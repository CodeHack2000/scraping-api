const { parentPort, workerData } = require('worker_threads');

const GlobalScrapingService = require('../services/globalScrapingService');

class GlobalScrapingWorker {

    constructor(data) {

        const { urls } = data;

        this.urls = urls || [];
        this.products = [];
        this.notScrapedUrls = [];

        this.logger = {
            log: (message, level = 'info') => parentPort.postMessage({ type: 'log', level, log: message }),
        };
        this.service = new GlobalScrapingService(this.logger, true);
        this.requestId = 0;
        this.pendindRequests = new Map();

        parentPort.on('message', (message) => {

            if (message.type === 'updateTasks') {

                this.urls = message.tasks;
            }

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

        let torInstanceId = this._sendRequest('getNewTorInstance');
        let isActive = true;
        let url = '';

        try {

            await this._sendRequest('initPuppeteer');

            while (isActive) {

                if (!this.urls.length) {

                    await new Promise(resolve => setTimeout(resolve, 1000));

                    if (!this.urls.length) {

                        isActive = false;
                    }

                    continue;
                }

                url = this.urls.shift();


                if (!torInstanceId) {

                    torInstanceId = this._sendRequest('getNewTorInstance');
                }

                const response = await this._sendRequest('doGetRequestBrowser', { url });

                if (response?.success) {

                    const jsonData = this.service.extractHtmlToJson(response.data);

                    this.products = this.products.concat(jsonData);
                }
                else {

                    this.notScrapedUrls.push(url);
                }

                // Wait 1s after each request
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        catch (error) {

            parentPort.postMessage({ error: `Error while scraping ${url}: ${error.message}` });
        }
        finally {

            if (torInstanceId) {
            
                await this._sendRequest('closePuppeteer');
            }
        }
    }

    async execute() {

        try {

            await this.scrapeUrls();
            parentPort.postMessage({ products: this.products, notScrapedUrls: this.notScrapedUrls });
        }
        catch (error) {

            this.logger.log(`Error while scraping: ${error.message}`, error);
        }
    }
}

if (parentPort) {

    const workerInstance = new GlobalScrapingWorker(workerData);
    
    workerInstance.execute()
        .then(() => {

            parentPort.postMessage({ type: 'taskCompleted' });
        })
        .catch((error) => {

            parentPort.postMessage({ type: 'error', error: error.message });
        });
}

module.exports = GlobalScrapingWorker;