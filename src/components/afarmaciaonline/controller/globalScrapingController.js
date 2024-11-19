const Path = require('path');
const Fs = require('fs');
const Moment = require('moment');

const config = require('../config/config');
const GlobalScrapingService = require('../services/globalScrapingService');
const DatabaseService = require('../services/databaseService');
const GlobalMapper = require('../mapper/globalMapper');

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
        this.databaseService = new DatabaseService(Logger, InventoryDB);
    }

    async scrapeAllCategories(req, res) {

        const result = {
            status: 400,
            products: [],
            categoryId: null
        };
        const options = {
            isFirstRequest: true,
            doScrollDown: false
        };
        let universalTorInstanceId = null;

        try {

            this.logger.info('<AFarmaciaOnline> Scraping all categories...');

            universalTorInstanceId = this.torInstances.universalTorInstanceId;

            await this.torInstances.initPuppeteer(universalTorInstanceId);

            const categories = config.categories;
            const websiteId = (await this.inventoryDB.websitesDB.getWebsiteByUrl(config.urlBase))?.id;
            const categoriesDB = await this.inventoryDB.categoriesDB.getAllCategories();

            const notScrapedUrls = [];

            for (const _categoryId in categories) {

                const category = categories[_categoryId];
                const categoryUrl = category.url;
                const url = config.urlBase + categoryUrl + '/?pmax=60';
                
                const categoryProducts = [];

                const mappedCategory = GlobalMapper.mapCategoryToDB(categoryUrl);
                const categoryId = (categoriesDB?.find((categ) => categ?.name === mappedCategory))?.id;
                result.categoryId = categoryId;

                const response = await this.torInstances.doGetRequestBrowser(universalTorInstanceId, url, options);

                if (response?.success) {

                    const jsonData = this.service.extractHtmlToJson(response.data);
                    
                    let filteredData = jsonData.filter((item) => item?.name) || [];
                    let tryCount = 0;
                    while (
                        (
                            filteredData.length === 0 
                            || !filteredData?.some((item) => item?.lastPage)
                        )
                        && tryCount < 3
                    ) {

                        await new Promise(resolve => setTimeout(resolve, 1000));

                        const _response = await this.torInstances.doGetRequestBrowser(universalTorInstanceId, url, options);

                        const _jsonData = this.service.extractHtmlToJson(_response?.data);

                        filteredData = _jsonData.filter((item) => item?.name) || [];

                        tryCount++;
                    }

                    categoryProducts.push(...filteredData);
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

                const insertedDataSuccess = await this.databaseService.insertDataToDB(categoryProducts, categoryId, websiteId);

                if (!insertedDataSuccess) {

                    const filename = `not-inserted-data_afarmaciaonline_${Moment().toDate().toISOString()}.json`;

                    const filePath = Path.join(__dirname, '../../../data', filename);

                    const notInsertedData = {
                        websiteId: websiteId || '',
                        categoryId: categoryId || '',
                        data: categoryProducts
                    };

                    Fs.writeFileSync(filePath, JSON.stringify(notInsertedData, null, 2));

                    this.logger.warn(`<AFarmaciaOnline> The following batch may have data that could not been inserted: ${filePath}`);
                }

                result.products.push(...categoryProducts);
            }

            if (notScrapedUrls.length > 0) {

                const filename = `not-scraped-urls_afarmaciaonline_${Moment().toDate().toISOString()}.txt`;

                const filePath = Path.join(__dirname, '../../../data', filename);

                Fs.writeFileSync(filePath, JSON.stringify(notScrapedUrls, null, 2));

                this.logger.warn(`<AFarmaciaOnline> The following urls were not scraped: ${filePath}`);
            }

            result.status = 200;
        }
        catch (error) {

            this.logger.error('<AFarmaciaOnline> Error scraping all categories: ' + error.message);
        }
        finally {

            if (universalTorInstanceId) {

                await this.torInstances.closePuppeteer(universalTorInstanceId);
            }
        }

        return res
            .status(result.status)
            .json({ products: result.products, categoryId: result.categoryId });
    }

    /**
     * Gets all categories URLs from the config file.
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @returns {Promise<void>} Resolves with the response of the request.
     */
    getAllCategoriesUrls(req, res) {

        this.logger.info('<AFarmaciaOnline> Getting all categories urls...');

        const result = {
            status: 400,
            categoriesUrls: []
        };

        try {

            const categories = config.categories;

            for (const category of categories) {

                const categoryUrl = category.url;
                const url = config.urlBase + categoryUrl;

                result.categoriesUrls.push(url);
            }

            result.status = 200;
        }
        catch(error) {

            this.logger.error('<AFarmaciaOnline> Error getting all categories urls: ' + error.message);
            result.status = 500;
        }

        return res
            .status(result.status)
            .json(result.categoriesUrls);
    }
}

module.exports = GlobalScrapingController;