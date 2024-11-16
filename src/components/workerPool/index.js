const { Worker } = require('worker_threads');

class WorkerPool {

    constructor(Logger, TorInstances) {

        this.logger = Logger;
        this.torInstances = TorInstances;

        this.maxWorkers = this.torInstances.torTotalInstances - 1; // 1 tor instance is universal for all controllers
        this.workersPool = Array.from({ length: this.maxWorkers }, (_, i) => {

            return {
                id: i,
                tasks: [],
                currentBatchId: null,
                classificationSpeed: null,
                worker: null,
                workerFilePath: null,
                torInstanceId: null
            };
        });
    }

    assignTask(taskData) {
        
        const availableWorkers = this._getAvailableWorkers();
        const tasksPerWorker = Math.ceil(taskData?.urls?.length / availableWorkers.length);

        let assignedTasks = 0;
        const workerPromises = availableWorkers.map((worker) => {

            if (assignedTasks >= taskData?.urls?.length) {

                return;
            }

            worker.tasks = taskData?.urls?.slice(assignedTasks, assignedTasks + tasksPerWorker);
            worker.currentBatchId = taskData?.id;
            worker.classificationSpeed = taskData?.classificationSpeed;
            worker.workerFilePath = taskData?.workerFilePath;

            assignedTasks += tasksPerWorker;

            return this._runWorker(worker.id);
        });

        return Promise.all(workerPromises);
    }

    onWorkerComplete(workerId) {

        this.workersPool[workerId].currentBatchId = null;
        this.workersPool[workerId].tasks = [];
        this.workersPool[workerId].classificationSpeed = null;
        this.workersPool[workerId].worker = null;
        this.workersPool[workerId].workerFilePath = null;
        this.workersPool[workerId].torInstanceId = null;

        const nextBatchInfo = this._getBatchNeedsMoreWorkers();
        
        if (nextBatchInfo) {

            const batchId = Object.keys(nextBatchInfo)[0];
            const tasksPerWorker = Math.ceil(nextBatchInfo[batchId].remainingTasks / (nextBatchInfo[batchId].totalActiveWorkers + 1));

            this.workersPool.forEach((workerPool) => {

                if (workerPool.currentBatchId === batchId) {

                    const tasks = workerPool.tasks.slice(tasksPerWorker, workerPool.tasks.length);
                    workerPool.tasks = workerPool.tasks.slice(0, tasksPerWorker);

                    this.workersPool[workerId].tasks = [...this.workersPool[workerId].tasks, ...tasks];

                    this._sendMessageToWorker(workerPool.id, { tasks: workerPool.tasks, type: 'updateTasks' });
                }
            });

            this.workersPool[workerId].currentBatchId = batchId;
            this.workersPool[workerId].classificationSpeed = nextBatchInfo[batchId].classificationSpeed;
            this.workersPool[workerId].workerFilePath = nextBatchInfo[batchId].workerFilePath;

            this._runWorker(workerId);
        }
    }

    _sendMessageToWorker(workerId, message) {

        const worker = this.workersPool[workerId].worker;

        if (worker) {

            worker.postMessage(message);
        }
        else {

            this.logger.warn(`<WorkerPool> Worker ${workerId} not found.`);
        }
    }

    _runWorker(workerId) {

        this.logger.info(`<WorkerPool> Running worker ${workerId} on batch ${this.workersPool[workerId].currentBatchId}.`);

        return new Promise((resolve, reject) => {

            const data = {
                urls: this.workersPool[workerId].tasks
            };

            this.workersPool[workerId].worker = new Worker(this.workersPool[workerId].workerFilePath, { workerData: data });

            this.workersPool[workerId].worker.on('message', async (result) => {
 
                if (result.type === 'taskCompleted') {

                    this.logger.info(`<WorkerPool> Worker ${workerId} completed succesfully the tasks.`);
                }
                else if (result.type === 'log') {

                    this.logger[result.level || 'info'](result.log);
                }
                else if (result.type === 'tor') {

                    if (result.action === 'getNewTorInstance') {

                        this.workersPool[workerId].torInstanceId = this.torInstances.getNewTorInstance();

                        this._sendMessageToWorker(workerId, { requestId: result.requestId, torInstanceId: this.workersPool[workerId].torInstanceId });
                    }
                    else if (result.action === 'initPuppeteer') {

                        await this.torInstances.initPuppeteer(this.workersPool[workerId].torInstanceId);

                        this._sendMessageToWorker(workerId, { requestId: result.requestId });
                    }
                    else if (result.action === 'closePuppeteer') {
                        
                        await this.torInstances.closePuppeteer(this.workersPool[workerId].torInstanceId);

                        this._sendMessageToWorker(workerId, { requestId: result.requestId });
                    }
                    else if (result.action === 'doGetRequestBrowser') {

                        try {

                            const response = await this.torInstances.doGetRequestBrowser(this.workersPool[workerId].torInstanceId, result.url);

                            this.workersPool[workerId].tasks = this.workersPool[workerId].tasks.filter((task) => task !== result.url);
                            
                            this._sendMessageToWorker(workerId, { requestId: result.requestId, response });
                        }
                        catch (error) {

                            this._sendMessageToWorker(workerId, { requestId: result.requestId, error: error.message });
                        }
                    }
                    else if (result.action === 'doGetRequest') {

                        try {

                            const response = await this.torInstances.doGetRequest(this.workersPool[workerId].torInstanceId, result.url);

                            this.workersPool[workerId].tasks = this.workersPool[workerId].tasks.filter((task) => task !== result.url);
                            
                            this._sendMessageToWorker(workerId, { requestId: result.requestId, response });
                        }
                        catch (error) {

                            this._sendMessageToWorker(workerId, { requestId: result.requestId, error: error.message });
                        }
                    }
                    else if (result.action === 'delTorInstance') {

                        this.torInstances.delTorInstance(this.workersPool[workerId].torInstanceId);
                        this.workersPool[workerId].torInstanceId = null;
                    }
                }
                else {

                    this.logger.info(`<WorkerPool> Worker ${workerId} finished tasks on batch ${this.workersPool[workerId].currentBatchId}.`);
                    
                    if (this.workersPool[workerId].torInstanceId) {
        
                        this.torInstances.delTorInstance(this.workersPool[workerId].torInstanceId);
                    }

                    resolve(result);
                    this.onWorkerComplete(workerId);
                }
            });

            this.workersPool[workerId].worker.on('error', (error) => {

                this.logger.warn(`<WorkerPool> Worker ${workerId} errored on batch ${this.workersPool[workerId].currentBatchId}.`);
                this.logger.debug(`<WorkerPool> Worker ${workerId} had the following tasks: ${this.workersPool[workerId].tasks}`);

                reject(error);
                this.onWorkerComplete(workerId);
            });

            this.workersPool[workerId].worker.on('exit', (code) => {

                this.logger.info(`<WorkerPool> Worker ${workerId} stopped on batch ${this.workersPool[workerId].currentBatchId}.`);

                if (code !== 0) {

                    this.logger.error(`<WorkerPool> Worker ${workerId} stopped with exit code ${code}`);
                    reject(new Error(`<WorkerPool> Worker ${workerId} stopped with exit code ${code}`));
                }
            });
        });
    }

    _getBatchInfo(batchId) {

        const workers = this.workersPool.filter((worker) => worker.currentBatchId === batchId);

        return {
            remainingTasks: workers.reduce((acc, worker) => acc + worker.tasks.length, 0) || 0,
            totalActiveWorkers: workers.length || 0,
            classificationSpeed: workers?.[0]?.classificationSpeed || 0,
            workerFilePath: workers?.[0]?.workerFilePath || ''
        };
    }

    _getBatchNeedsMoreWorkers() {

        // Get distinct batch ids and filter out null values
        const distinctBatchId = [...new Set(this.workersPool.map((worker) => worker.currentBatchId))].filter(Boolean);

        // Get batch info for each distinct batch
        const batchesInfo = distinctBatchId.map((batchId) => {
           
            const batchInfo = this._getBatchInfo(batchId);

            return {
                [batchId]: {
                    remainingTasks: batchInfo.remainingTasks,
                    totalActiveWorkers: batchInfo.totalActiveWorkers,
                    classificationSpeed: batchInfo.classificationSpeed,
                    workerFilePath: batchInfo.workerFilePath
                }
            };
        });

        // Get batches that need more workers
        const batchesNeedsMoreWorkers = batchesInfo.filter((batch) => Math.ceil(batch[Object.keys(batch)[0]].remainingTasks / batch[Object.keys(batch)[0]].totalActiveWorkers) > 10);

        // Obtain first batch with the lowest classification speed
        return batchesNeedsMoreWorkers
            .sort((a, b) => b[Object.keys(b)[0]].classificationSpeed - a[Object.keys(a)[0]].classificationSpeed)
            .shift();
    }

    _getAvailableWorkers() {

        return this.workersPool.filter((worker) => worker.tasks.length === 0);
    }

    numberAvailableWorkers() {

        return this.workersPool.filter((worker) => worker.tasks.length === 0).length;
    }
}

module.exports = WorkerPool;