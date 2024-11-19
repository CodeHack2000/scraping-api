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
            categories: []
        };
        const options = {
            isFirstRequest: true,
            doScrollDown: true
        };
        let universalTorInstanceId = null;

        try {

            this.logger.info('<FarmaciaSaude> Scraping all categories...');

            universalTorInstanceId = this.torInstances.universalTorInstanceId;

            await this.torInstances.initPuppeteer(universalTorInstanceId);

            const categories = config.categories;
            const websiteId = (await this.inventoryDB.websitesDB.getWebsiteByUrl(config.urlBase))?.id;
            const categoriesDB = await this.inventoryDB.categoriesDB.getAllCategories();

            const notScrapedUrls = [];

            for (const _categoryId in categories) {

                const category = categories[_categoryId];
                const categoryUrl = category.url;
                const url = config.urlBase + categoryUrl;
                
                const categoryProducts = [];

                const mappedCategory = GlobalMapper.mapCategoryToDB(categoryUrl);
                const categoryId = categoriesDB?.find((categ) => categ?.name === mappedCategory);

                result.categories.push({ ...mappedCategory, id: categoryId });

                const response = await this.torInstances.doGetRequestBrowser(universalTorInstanceId, url, options);

                if (response?.success) {

                    const jsonData = this.service.extractHtmlToJson(response.data, config.urlBase);
                    
                    let filteredData = jsonData.filter((item) => item?.name) || [];
                    let tryCount = 0;
                    while (filteredData.length === 0 && tryCount < 3
                    ) {

                        await new Promise(resolve => setTimeout(resolve, 1000));

                        const _response = await this.torInstances.doGetRequestBrowser(universalTorInstanceId, url, options);

                        const _jsonData = this.service.extractHtmlToJson(_response?.data, config.urlBase);

                        filteredData = _jsonData.filter((item) => item?.name) || [];

                        tryCount++;
                    }

                    categoryProducts.push(...filteredData);
                }
                else {

                    notScrapedUrls.push(url);
                }

                const insertedDataSuccess = await this.databaseService.insertDataToDB(categoryProducts, categoryId, websiteId);

                if (!insertedDataSuccess) {

                    const filename = `not-inserted-data_FarmaciaSaude_${Moment().toDate().toISOString()}.json`;

                    const filePath = Path.join(__dirname, '../../../data', filename);

                    const notInsertedData = {
                        websiteId: websiteId || '',
                        categoryId: categoryId || '',
                        data: categoryProducts
                    };

                    Fs.writeFileSync(filePath, JSON.stringify(notInsertedData, null, 2));

                    this.logger.warn(`<FarmaciaSaude> The following batch may have data that could not been inserted: ${filePath}`);
                }

                result.products.push(...categoryProducts);
            }

            if (notScrapedUrls.length > 0) {

                const filename = `not-scraped-urls_FarmaciaSaude__${Moment().toDate().toISOString()}.json`;

                const filePath = Path.join(__dirname, '../../../data', filename);

                Fs.writeFileSync(filePath, JSON.stringify(notScrapedUrls, null, 2));

                this.logger.warn(`<FarmaciaSaude> The following urls were not scraped: ${filePath}`);
            }

            result.status = 200;
        }
        catch (error) {

            this.logger.error('<FarmaciaSaude> Error scraping all categories: ' + error.message);
        }
        finally {

            if (universalTorInstanceId) {

                await this.torInstances.closePuppeteer(universalTorInstanceId);
            }
        }

        return res
            .status(result.status)
            .json(result.products);
    }
}

module.exports = GlobalScrapingController;