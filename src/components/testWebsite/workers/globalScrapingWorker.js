const { parentPort, workerData } = require('worker_threads');
const GlobalScrapingService = require('../services/globalScrapingService');

class GlobalScrapingWorker {

    constructor(data) {

        const { urls } = data;

        this.urls = urls || [];
        this.products = [];

        this.logger = {
            log: (message, level = 'info') => parentPort.postMessage({ type: 'log', level, log: message }),
        };
        this.service = new GlobalScrapingService(this.logger, true);
        this.requestId = 0;
        this.pendindRequests = new Map();

        parentPort.on('message', (message) => {

            if (message.requestId && this.pendindRequests.has(message.requestId)) {
                
                const { resolve, reject } = this.pendindRequests.get(message.requestId);
                
                this.pendindRequests.delete(message.requestId);

                if (message.error) {

                    reject(new Error(message.error));
                }
                else {

                    resolve(message.response);
                }
            }
        });
    }

    _sendRequest(action, data) {

        return new Promise((resolve, reject) => {

            const requestId = ++this.requestId;
            this.pendindRequests.set(requestId, { resolve, reject });
            parentPort.postMessage({ type: 'tor', requestId, action, ...data });
        });
    }

    async scrapeUrls() {

        let torInstanceId;

        for (const url of this.urls) {

            torInstanceId = this._sendRequest('getNewTorInstance');

            try {

                const response = await this._sendRequest('doGetRequest', { url });

                if (response?.success) {

                    const jsonData = this.service.extractHtmlToJson(response.data, );

                    this.products = this.products.concat(jsonData);
                }

                // Wait 1s
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {

                parentPort.postMessage({ error: `Error while scraping ${url}: ${error.message}` });
            }
            finally {

                if (torInstanceId) {

                    this._sendRequest('delTorInstance');
                }
            }
        }
    }

    async execute() {

        try {

            await this.scrapeUrls();
            parentPort.postMessage({ products: this.products });
        }
        catch (error) {

            this.logger.log(`Error while scraping: ${error.message}`, error);
        }
    }
}

if (parentPort) {

    const workerInstance = new GlobalScrapingWorker(workerData);
    
    workerInstance.execute()
        .then((results) => {

            parentPort.postMessage({ type: 'taskCompleted', results });
        })
        .catch((error) => {

            parentPort.postMessage({ type: 'error', error: error.message });
        });
}

module.exports = GlobalScrapingWorker;