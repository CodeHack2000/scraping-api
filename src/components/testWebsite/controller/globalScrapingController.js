const Path = require('path');
const Fs = require('fs');
const Moment = require('moment');

const config = require('../config/config');
const GlobalScrapingService = require('../services/globalScrapingService');

class GlobalScrapingController {

    constructor(Utils, Tools, DB) {

        const { Logger } = Utils;
        const { TorInstances, TaskQueue } = Tools;
        const { InventoryDB } = DB;

        this.logger = Logger;
        this.torInstances = TorInstances;
        this.taskQueue = TaskQueue;
        this.inventoryDB = InventoryDB;

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

            const notScrapedUrls = [];

            for (const categoryId in categories) {

                const category = categories[categoryId];
                const categoryUrl = category.url;
                const url = config.urlBase + categoryUrl;
                const categoryProducts = [];

                const response = await this.torInstances.doGetRequest(universalTorInstanceId, url);

                if (response?.success) {

                    const jsonData = this.service.extractHtmlToJson(response.data);

                    categoryProducts.push(...jsonData);
                }
                else {

                    notScrapedUrls.push(url);
                }

                if (categoryProducts[0]?.lastPage > 1) {

                    const workerData = {
                        urls: this.service.generateCategoryUrls(categoryUrl, categoryProducts[0]?.lastPage),
                        classificationSpeed: config.responseTimeClassification,
                        workerFilePath: Path.resolve(__dirname, '../workers/globalScrapingWorker.js')
                    };

                    const workersProducts = await this.taskQueue.addTask(1, workerData);
                    categoryProducts.push(...workersProducts.aggregatedProducts);

                    if (workersProducts?.aggregatedNotScrapedUrls?.length > 0) {

                        notScrapedUrls.push(...workersProducts.aggregatedNotScrapedUrls);
                    }
                }

                let insertedData = [];
                if (categoryProducts.length > 0) {

                    insertedData = await this.inventoryDB.testTableService.insTestTableBatch(categoryProducts);
                }

                if (insertedData?.length === 0 && categoryProducts.length > 0) {

                    const filename = `not-inserted-data-${Moment().toDate().toISOString()}.json`;

                    const filePath = Path.join(__dirname, '../../../data', filename);

                    Fs.writeFileSync(filePath, JSON.stringify(categoryProducts, null, 2));

                    this.logger.warn(`<TESTWEBSITE> The following batch may have data that could not been inserted: ${filePath}`);
                }

                result.products.push(...categoryProducts);
            }

            if (notScrapedUrls.length > 0) {

                const filename = `not-scraped-urls-${Moment().toDate().toISOString()}.json`;

                const filePath = Path.join(__dirname, '../../../data', filename);

                Fs.writeFileSync(filePath, JSON.stringify(notScrapedUrls, null, 2));

                this.logger.warn(`<TESTWEBSITE> The following urls were not scraped: ${filePath}`);
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