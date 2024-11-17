const cheerio = require('cheerio');

class GlobalScrapingService {

    constructor(Logger) {

        this.logger = Logger;
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
     * @param {string} websiteUrl - The base URL of the website.
     * @returns {Array<Object>} An array of product objects containing the URL, name, price, and last page.
     */
    extractHtmlToJson(html, websiteUrl = '') {

        const products = [];

        try {
                
            this.logger.info('<FarmaciaSaude> Extracting HTML to JSON...');

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

                $('div.listaProdutos div.itemProduto').each((_, element) => {

                    const product = {
                        url: websiteUrl + '/' + $(element).find('a.p').attr('href'),
                        name: $(element).find('div.nome').text().trim(),
                        price: $(element).find('a.p div.preco span[class="cambio EUR"]').last().text().replace(/[^0-9.]/g, '').trim()
                    };
                    
                    products.push(product);
                });
            }
        }
        catch (error) {
                
            this.logger.error('<FarmaciaSaude> Error extracting HTML to JSON: ' + error.message);
        }

        return products;
    }
}

module.exports = GlobalScrapingService;