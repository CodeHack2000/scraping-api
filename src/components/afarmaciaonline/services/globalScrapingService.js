const cheerio = require('cheerio');

const config = require('../config/config');

class GlobalScrapingService {

    constructor(Logger, isWorker = false, TorInstances = {}) {

        this.logger = Logger;
        this.isWorker = isWorker;
        this.torInstances = TorInstances;
    }

    /**
     * Extracts product data from HTML content and converts it to a JSON format.
     * 
     * This function uses Cheerio to parse the provided HTML and extracts information
     * about products such as their URL, name, and price. It also determines the last
     * pagination page available. The extracted data is returned as an array of product
     * objects.
     * 
     * Logs information or errors during the extraction process, depending on whether
     * the service is running as a worker or not.
     * 
     * @param {string} html - The HTML content to be parsed and extracted.
     * @returns {Array<Object>} An array of product objects containing the URL, name, price, and last page.
     */
    extractHtmlToJson(html) {

        const products = [];

        try {

            if (this.isWorker) {

                this.logger.log('<AFarmaciaOnline> Extracting HTML to JSON...');
            }
            else {
                
                this.logger.info('<AFarmaciaOnline> Extracting HTML to JSON...');
            };

            const $ = cheerio.load(html, {
                decodeEntities: false,
                xml: false,
                lowerCaseTags: false,
                lowerCaseAttributeNames: false,
                recognizeSelfClosing: true,
                charset: 'UTF-8'
            });

            const isValid = $('head title').text().trim();

            // Validate if the page is valid
            if (!['One moment, please'].includes(isValid)) {

                const lastPage = $('ul#pagination li').last().find('a').text().trim();

                const afterSelectedPageUrl = $('ul#pagination li.selected').next().find('a').attr('href');

                $('ul.listagem-produtos li.listagens-li').each((_, element) => {
                
                    const product = {
                        url: $(element).find('a.name-product').attr('href'),
                        name: $(element).find('a.name-product').text().trim(),
                        price: $(element).find('span.price-value').last().text().replace(/[^0-9,]/g, '').trim(),
                        msrm: $(element).find('div.mnsrm_div').text().trim(),
                        lastPage,
                        afterSelectedPageUrl: afterSelectedPageUrl
                            ? afterSelectedPageUrl + '&pmax=60'
                            : ''
                    };

                    if (product?.msrm?.includes('MSRM')) {

                        product.msrm = true;
                    }
                    else if (product?.msrm?.includes('MNSRM')) {

                        product.msrm = false;
                    }
                    else {

                        product.msrm = null;
                    }
                    
                    products.push(product);
                });
            }
        }
        catch (error) {

            if (this.isWorker) {

                this.logger.log('<AFarmaciaOnline> Error extracting HTML to JSON: ' + error.message, 'error');
            }
            else {
                
                this.logger.error('<AFarmaciaOnline> Error extracting HTML to JSON: ' + error.message);
            };
        }

        return products;
    }

    /**
     * Generates a list of category URLs to be scraped. The list of URLs does not include the first page.
     * @param {string} categoryUrl - URL of the category to be scraped.
     * @param {number} lastPage - Number of the last page to be scraped.
     * @returns {Array<string>} A list of category URLs to be scraped.
     */
    generateCategoryUrls(categoryUrl, lastPage) {

        const urls = [];

        if (this.isWorker) {

            this.logger.log('<AFarmaciaOnline> Generating category URLs...');
        }
        else {
            
            this.logger.info('<AFarmaciaOnline> Generating category URLs...');
        }

        for (let i = 2; i <= lastPage; i++) {

            const url = `${config.urlBase}${categoryUrl}/${i}&pmax=60`;

            urls.push(url);
        }

        if (this.isWorker) {

            this.logger.log(`<AFarmaciaOnline> Generated ${urls.length} category URLs`);
        }
        else {
            
            this.logger.info(`<AFarmaciaOnline> Generated ${urls.length} category URLs`);
        }

        return urls;
    }

    /**
     * Scrapes a single page from the provided URL and extracts products from the HTML content.
     * If the scraping is successful, it will return an object containing the scraped products and the URL of the next page.
     * If the scraping is not successful, it will return an object containing the URL that was not scraped.
     * @param {string} universalTorInstanceId - The universal Tor instance ID.
     * @param {{url: string, categoryId: string}} payload - The payload containing the URL and category ID to be scraped.
     * @param {Object} options - The options to be passed to the browser instance.
     * @returns {Promise<{products: Array<Object>, nextPageUrl: string, notScrapedUrl: string}>} A promise that resolves with the scraped data.
     */
    async scrapeNotScrapedUrls(universalTorInstanceId, payload = {}, options = {}) {

        const result = {
            products: [],
            nextPageUrl: null,
            notScrapedUrl: ''
        };

        try {

            const { url = '', categoryId = '' } = payload;

            const response = await this.torInstances.doGetRequestBrowser(universalTorInstanceId, url, options);

            if (response?.success) {

                const jsonData = this.extractHtmlToJson(response.data);
                
                let filteredData = jsonData.filter((item) => item?.name) || [];
                let tryCount = 0;
                while (filteredData.length === 0 && tryCount < 3) {

                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const _response = await this.torInstances.doGetRequestBrowser(universalTorInstanceId, url, options);

                    const _jsonData = this.extractHtmlToJson(_response?.data);

                    filteredData = _jsonData.filter((item) => item?.name) || [];

                    tryCount++;
                }

                filteredData.forEach((item) => {

                    item.categoryId = categoryId;
                });

                result.products.push(...filteredData);

                result.nextPageUrl = jsonData.find((item) => item?.nextPageUrl)?.nextPageUrl || '';
            }
            else {

                result.notScrapedUrl = url;
            }
        }
        catch (error) {

            this.logger.error('<AFarmaciaOnline> Error scraping URL: ' + error.message);
        }

        return result;
    }
}

module.exports = GlobalScrapingService;