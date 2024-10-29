const Crypto = require('crypto');

class TaskQueue {

    constructor(Logger, WorkerPool) {
    
        this.logger = Logger;
        this.workerPool = WorkerPool;

        this.queue = [];
    }

    async addTask(priority, data, workerFilePath) {

        this.logger.info('<TaskQueue> Adding task...');

        return new Promise((resolve, reject) => {

            this.queue.push({ priority, data, workerFilePath, resolve, reject });
            this.queue = this.queue.sort((a, b) => a.priority - b.priority);    // Sort the queue by priority
            this.processQueue();
        });
    }

    async processQueue() {

        this.logger.info('<TaskQueue> Processing queue...');

        if (this.queue.length === 0) {

            this.logger.info('<TaskQueue> Queue is empty.');
            return;
        }

        if (this.workerPool.numberAvailableWorkers() === 0) {

            this.logger.info('<TaskQueue> No workers available, adding task to queue...');
            return;
        }

        const { data, workerFilePath, resolve, reject } = this.queue.shift();

        try {

            this.logger.info('<TaskQueue> Running task...');

            const _data = {
                ...data,
                id: Crypto.randomBytes(16).toString('hex')
            };

            const result = await this.workerPool.runTask(_data, workerFilePath);

            resolve(result);
        }
        catch (error) {

            this.logger.error('<TaskQueue> Task failed: ' + error.message);

            reject(error);
        }
        finally {

            this.logger.info('<TaskQueue> Task completed.');

            if (this.queue.length > 0) {

                this.logger.info('<TaskQueue> Processing next task...');
                this.processQueue();
            }
        }
    }

}

module.exports = TaskQueue;