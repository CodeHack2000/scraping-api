const { parentPort, workerData } = require('worker_threads');
const GlobalScrapingService = require('../services/globalScrapingService');

class GlobalScrapingWorker {

    constructor(data) {

        const { torInstances, torInstanceId, urls, logger } = data;

        this.urls = urls || [];
        this.torInstances = torInstances;
        this.torInstanceId = torInstanceId;
        this.products = [];
        this.logger = logger;

        this.service = new GlobalScrapingService(logger);
    }

    async scrapeUrls() {

        for (const url of this.urls) {

            try {

                const response = await this.torInstances.doGetRequest(this.torInstanceId, url);

                if (response?.success) {

                    const jsonData = this.service.extractHtmlToJson(response.data);

                    this.products = this.products.concat(jsonData);
                }
            }
            catch (error) {

                parentPort.postMessage({ error: `Error while scraping ${url}: ${error.message}` });
            }
        }
    }

    async execute() {

        try {

            await this.scrapeUrls();
            parentPort.postMessage({ products: this.products });
        }
        catch (error) {

            this.logger.error(`Error while scraping: ${error.message}`);
        }
    }
}

if (parentPort) {

    const workerInstance = new GlobalScrapingWorker(workerData);
    
    workerInstance.runTasks()
        .then((results) => {

            parentPort.postMessage({ type: 'taskCompleted', results });
        })
        .catch((error) => {

            parentPort.postMessage({ type: 'error', error: error.message });
        });
}

module.exports = GlobalScrapingWorker;