const CategoriesService = require('./categories/categoriesService');
const CategoriesDB = require('./categories/categoriesDB');
const PricesService = require('./prices/pricesService');
const PricesDB = require('./prices/pricesDB');
const ProductsService = require('./products/productsService');
const WebsitesService = require('./websites/websitesService');
const WebsiteDB = require('./websites/websitesDB');
const TestTableService = require('./testTable/testTableService');

class InventoryDB {

    constructor(Utils) {

        this.websitesService = new WebsitesService(Utils);
        this.websitesDB = WebsiteDB;

        this.categoriesService = new CategoriesService(Utils);
        this.categoriesDB = CategoriesDB;

        this.productsService = new ProductsService(Utils);

        this.pricesService = new PricesService(Utils);
        this.pricesDB = PricesDB;

        this.testTableService = new TestTableService(Utils);
    }
}

module.exports = InventoryDB;