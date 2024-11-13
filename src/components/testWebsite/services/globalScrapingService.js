const cheerio = require('cheerio');

const config = require('../config/config');

class GlobalScrapingService {

    constructor(Logger, isWorker = false) {

        this.logger = Logger;
        this.isWorker = isWorker;
    }

    extractHtmlToJson(html) {

        const products = [];

        try {

            if (this.isWorker) {

                this.logger.log('<TESTWEBSITE> Extracting HTML to JSON...');
            }
            else {
                
                this.logger.info('<TESTWEBSITE> Extracting HTML to JSON...');
            };

            const $ = cheerio.load(html, {
                decodeEntities: false,
                xml: false,
                lowerCaseTags: false,
                lowerCaseAttributeNames: false,
                recognizeSelfClosing: true,
                charset: 'UTF-8'
            });
    
            const lastPageAllHtml = $('div.pagination-area ul.pagination li');
            const lastPageHtml = lastPageAllHtml[lastPageAllHtml.length - 2];
            const lastPage = $(lastPageHtml).find('a').text().trim();
    
            $('table.table tr.team').each((_, element) => {
                
                const team = {
                    name: $(element).find('td.name').text().trim(),
                    year: $(element).find('td.year').text().trim(),
                    wins: $(element).find('td.wins').text().trim(),
                    lastPage
                };

                products.push(team);
            });
        }
        catch (error) {

            if (this.isWorker) {

                this.logger.log('<TESTWEBSITE> Error extracting HTML to JSON: ' + error.message, 'error');
            }
            else {
                
                this.logger.error('<TESTWEBSITE> Error extracting HTML to JSON: ' + error.message);
            }
        }

        return products;
    }

    generateCategoryUrls(categoryUrl, lastPage) {

        const urls = [];

        if (this.isWorker) {

            this.logger.log('<TESTWEBSITE> Generating category URLs...');
        }
        else {
            
            this.logger.info('<TESTWEBSITE> Generating category URLs...');
        }

        for (let i = 2; i <= lastPage; i++) {

            const url = `${config.urlBase}${categoryUrl}?page_num=${i}`;

            urls.push(url);
        }

        if (this.isWorker) {

            this.logger.log(`<TESTWEBSITE> Generated ${urls.length} category URLs`);
        }
        else {
            
            this.logger.info(`<TESTWEBSITE> Generated ${urls.length} category URLs`);
        }

        return urls;
    }
}

module.exports = GlobalScrapingService;