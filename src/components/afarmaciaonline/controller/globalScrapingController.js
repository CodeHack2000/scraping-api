const Path = require('path');
const Fs = require('fs');
const Moment = require('moment');

const config = require('../config/config');
const GlobalScrapingService = require('../services/globalScrapingService');
const DatabaseService = require('../services/databaseService');
const GlobalMapper = require('../mapper/globalMapper');
const ScrapingFilesService = require('../services/scrapingFilesService');

class GlobalScrapingController {

    constructor(Utils, Tools, DB) {

        const { Logger } = Utils;
        const { TorInstances, TaskQueue } = Tools;
        const { InventoryDB } = DB;

        this.logger = Logger;
        this.torInstances = TorInstances;
        this.taskQueue = TaskQueue;
        this.inventoryDB = InventoryDB;

        this.service = new GlobalScrapingService(Logger, false, TorInstances);
        this.databaseService = new DatabaseService(Logger, InventoryDB);
        this.scrapingFilesService = new ScrapingFilesService(Logger);
    }

    async scrapeAllCategories(req, res) {

        const result = {
            status: 400,
            products: []
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

                const firstResult = await this.service.scrapeNotScrapedUrls(universalTorInstanceId, { url, categoryId }, options);
                categoryProducts.push(...firstResult.products);

                if (firstResult?.notScrapedUrl) {

                    notScrapedUrls.push(firstResult?.notScrapedUrl);
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
            .json({ products: result.products });
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

    async scrapeNotScrapedUrls(req, res) {
        
        const result = {
            status: 400,
            products: []
        };
        const options = {
            isFirstRequest: true,
            doScrollDown: false
        };
        let universalTorInstanceId = null;
        
        try {
            
            this.logger.info('<AFarmaciaOnline> Scraping not scraped urls...');

            universalTorInstanceId = this.torInstances.universalTorInstanceId;

            await this.torInstances.initPuppeteer(universalTorInstanceId);

            const website = await this.inventoryDB.websitesDB.getWebsiteByUrl(config.urlBase);
            const categoriesDB = await this.inventoryDB.categoriesDB.getAllCategories();

            const sortedFiles = await this.scrapingFilesService.getFiles(website?.name);

            const urlsToScrape = [];
            for (const filePath of sortedFiles) {

                urlsToScrape.push(...this.scrapingFilesService.processFile(filePath));
            }

            const notScrapedUrls = [];
            const products = [];
            for (const urlObj of urlsToScrape) {

                const mappedCategory = GlobalMapper.mapCategoryToDB(urlObj?.category);
                const categoryId = (categoriesDB?.find((categ) => categ?.name === mappedCategory))?.id;

                const firstResult = await this.service.scrapeNotScrapedUrls(universalTorInstanceId, { url: urlObj?.url, categoryId }, options);
                products.push(...firstResult.products);

                if (firstResult?.notScrapedUrl) {

                    notScrapedUrls.push(firstResult?.notScrapedUrl);
                }

                if (firstResult?.nextPageUrl) {

                    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 3000) + 1000));

                    const secondResult = await this.service.scrapeNotScrapedUrls(universalTorInstanceId, { url: firstResult?.nextPageUrl, categoryId }, options);
                    products.push(...secondResult.products);

                    if (secondResult?.notScrapedUrl) {

                        notScrapedUrls.push(secondResult?.notScrapedUrl);
                    }
                }

                await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 3000) + 1000));
            }

            const insertedDataSuccess = await this.databaseService.insertDataToDB(products, null, website?.id);

            if (!insertedDataSuccess) {

                const filename = `not-inserted-data-automated_afarmaciaonline_${Moment().toDate().toISOString()}.json`;

                const filePath = Path.join(__dirname, '../../../data', filename);

                const notInsertedData = {
                    websiteId: website?.id || '',
                    data: products
                };

                Fs.writeFileSync(filePath, JSON.stringify(notInsertedData, null, 2));

                this.logger.warn(`<AFarmaciaOnline> The following batch may have data that could not been inserted: ${filePath}`);
            }

            result.products.push(...products);

            if (notScrapedUrls.length > 0) {

                const filename = `not-scraped-urls-automated_afarmaciaonline_${Moment().toDate().toISOString()}.txt`;

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
            .json({ products: result.products });
    }
}

module.exports = GlobalScrapingController;