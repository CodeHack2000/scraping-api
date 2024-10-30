const cheerio = require('cheerio');

const config = require('../config/config');

class GlobalScrapingService {

    constructor(Logger, TorInstances) {

        this.logger = Logger;
        this.torIntances = TorInstances;
    }

    extractHtmlToJson(html) {

        const products = [];

        try {

            this.logger.info('<FarmaciaSantaMarta> Extracting HTML to JSON...');

            const $ = cheerio.load(html, {
                decodeEntities: false,
                xml: false,
                lowerCaseTags: false,
                lowerCaseAttributeNames: false,
                recognizeSelfClosing: true,
                charset: 'UTF-8'
            });
    
            const category = $('div.hero-section h1.page-title').text().trim();

            const lastPage = $('nav.ct-pagination div.ct-hidden-sm a.page-numbers').last().text().trim();
    
            $('ul.products li.product').each((_, element) => {
            
                const product = {
                    url: $(element).find('a').attr('href'),
                    name: $(element).find('a h2').text().trim(),
                    price: $(element).find('a bdi').text().replace(/[^0-9,]/g, '').trim(),
                    category: category,
                    lastPage: lastPage
                };

                // Avoid duplicates
                if (products.findIndex((pro) => pro.url === product.url) === -1) {

                    products.push(product);
                }
            });
        }
        catch (error) {

            this.logger.error('<FarmaciaSantaMarta> Error extracting HTML to JSON: ' + error.message);
        }

        return products;
    }

    generateCategoryUrls(categoryUrl, lastPage) {

        const urls = [];

        this.logger.info('<FarmaciaSantaMarta> Generating category URLs...');

        for (let i = 2; i <= lastPage; i++) {

            const url = `${config.urlBase}${categoryUrl}/page/${i}/`;

            urls.push(url);
        }

        this.logger.info(`<FarmaciaSantaMarta> Generated ${urls.length} category URLs`);

        return urls;
    }
}

module.exports = GlobalScrapingService;