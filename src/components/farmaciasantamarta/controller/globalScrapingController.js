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
        let torInstanceId;

        try {

            this.logger.info('<FarmaciaSantaMarta> Scraping all categories...');

            const categories = config.categories;

            torInstanceId = this.torInstances.getNewTorInstance();

            for (const categoryId in categories) {

                const category = categories[categoryId];
                const categoryUrl = category.url;
                const url = config.urlBase + categoryUrl;

                const response = await this.torInstances.doGetRequest(torInstanceId, url);

                if (response?.success) {

                    const jsonData = this.service.extractHtmlToJson(response.data);

                    result.products = result.products.concat(jsonData);
                }

                if (result?.products?.[0]?.lastPage > 1) {

                    const workerData = {
                        urls: this.service.generateCategoryUrls(categoryUrl, result.products[0].lastPage),
                        classificationSpeed: config.responseTimeClassification,
                        workerFilePath: '@farmaciasantamarta/workers/globalScrapingWorker.js',
                        torInstanceId
                    };

                    const workersProducts = await this.taskQueue.addTask(1, workerData);
                    result.products = result.products.concat(workersProducts);
                }

                if (categoryId < categories.length - 1) {
                    
                    this.torInstances.refreshTorInstance(torInstanceId);
                }
            }

            result.status = 200;
        }
        catch (error) {

            this.logger.error('<FarmaciaSantaMarta> Error scraping all categories: ' + error.message);
        }
        finally {

            if (torInstanceId) {

                this.torInstances.delTorInstance(torInstanceId);
            }
        }

        return res
            .status(result.status)
            .json(result.products);
    }
}

module.exports = GlobalScrapingController;