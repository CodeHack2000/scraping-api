const Path = require('path');

const config = require('../config/config');
const GlobalScrapingService = require('../services/globalScrapingService');

class GlobalScrapingController {

    constructor(Logger, TorInstances, TaskQueue) {

        this.logger = Logger;
        this.torInstances = TorInstances;
        this.taskQueue = TaskQueue;

        this.service = new GlobalScrapingService(Logger);
    }

    async scrapeAllCategories(req, res) {

        const result = {
            status: 400,
            products: []
        };

        try {

            this.logger.info('<TESTWEBSITE> Scraping all categories...');

            const universalTorInstanceId = this.torInstances.universalTorInstanceId;

            const categories = config.categories;

            for (const categoryId in categories) {

                const category = categories[categoryId];
                const categoryUrl = category.url;
                const url = config.urlBase + categoryUrl;

                const response = await this.torInstances.doGetRequest(universalTorInstanceId, url);

                if (response?.success) {

                    const jsonData = this.service.extractHtmlToJson(response.data);

                    result.products = result.products.concat(jsonData);
                }

                if (result?.products?.[0]?.lastPage > 1) {

                    const workerData = {
                        urls: this.service.generateCategoryUrls(categoryUrl, result.products[0].lastPage),
                        classificationSpeed: config.responseTimeClassification,
                        workerFilePath: Path.resolve(__dirname, '../workers/globalScrapingWorker.js')
                    };

                    const workersProducts = await this.taskQueue.addTask(1, workerData);
                    result.products = result.products.concat(workersProducts);
                }
            }

            result.status = 200;
        }
        catch (error) {

            this.logger.error('<TESTWEBSITE> Error scraping all categories: ' + error.message);
        }

        return res
            .status(result.status)
            .json(result.products);
    }
}

module.exports = GlobalScrapingController;