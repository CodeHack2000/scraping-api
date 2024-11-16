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

                this.logger.log('<FarmaciaSantaMarta> Extracting HTML to JSON...');
            }
            else {
                
                this.logger.info('<FarmaciaSantaMarta> Extracting HTML to JSON...');
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

                const lastPage = $('nav.ct-pagination div.ct-hidden-sm a.page-numbers').last().text().trim();
    
                $('ul.products li.product').each((_, element) => {
                
                    const product = {
                        url: $(element).find('a').attr('href'),
                        name: $(element).find('a h2').text().trim(),
                        price: $(element).find('a bdi').last().text().replace(/[^0-9,]/g, '').trim(),
                        lastPage: lastPage
                    };

                    if(product.price?.indexOf(',') > -1){
                    
                        const parts = product.price.split(',');
                        product.price = parts[parts.length - 1];
                    }
                    
                    products.push(product);
                });
            }
        }
        catch (error) {

            if (this.isWorker) {

                this.logger.log('<FarmaciaSantaMarta> Error extracting HTML to JSON: ' + error.message, 'error');
            }
            else {
                
                this.logger.error('<FarmaciaSantaMarta> Error extracting HTML to JSON: ' + error.message);
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

            this.logger.log('<FarmaciaSantaMarta> Generating category URLs...');
        }
        else {
            
            this.logger.info('<FarmaciaSantaMarta> Generating category URLs...');
        }

        for (let i = 2; i <= lastPage; i++) {

            const url = `${config.urlBase}${categoryUrl}/page/${i}/`;

            urls.push(url);
        }

        if (this.isWorker) {

            this.logger.log(`<FarmaciaSantaMarta> Generated ${urls.length} category URLs`);
        }
        else {
            
            this.logger.info(`<FarmaciaSantaMarta> Generated ${urls.length} category URLs`);
        }

        return urls;
    }
}

module.exports = GlobalScrapingService;