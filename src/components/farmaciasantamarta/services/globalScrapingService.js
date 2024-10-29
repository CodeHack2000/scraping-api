const cheerio = require('cheerio');

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
    
            $('ul.products li.product').each((_, element) => {
            
                const product = {
                    url: $(element).find('a').attr('href'),
                    name: $(element).find('a h2').text().trim(),
                    price: $(element).find('a bdi').text().replace(/[^0-9,]/g, '').trim(),
                    category: category
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

    async scrapeAllPages(torIntanceId) {

        // Check ip
        const publicIP = await this.torIntances.getPublicIP(torIntanceId);

        for (let page = 1; page <= maxPages; page++) {

            console.log(`Product: ${product}, Website: ${website}, Page: ${page}, IP: ${publicIP}`);

            const timeStart = performance.now();

            const response = await requestWebsite(website, queryObj, product, page, agent, userAgent.toString(), jar);

            const timeEnd = performance.now();

            console.log(response.success ? 'Success' : 'Error');

            if (!results[website]) {
                results[website] = {};
            }

            if (!results[website][product]) {
                results[website][product] = [];
            }

            const result = {
                time: timeEnd - timeStart,
                error: response.error,
                ip: publicIP
            }

            results[website][product].push(result);

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

module.exports = GlobalScrapingService;