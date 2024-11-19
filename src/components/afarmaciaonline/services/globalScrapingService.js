const cheerio = require('cheerio');

const config = require('../config/config');

class GlobalScrapingService {

    constructor(Logger, isWorker = false) {

        this.logger = Logger;
        this.isWorker = isWorker;
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
}

module.exports = GlobalScrapingService;