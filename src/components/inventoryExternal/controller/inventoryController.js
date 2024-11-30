class InventoryController {

    constructor(Utils, DB) {

        const { Logger, CommonMapper } = Utils;
        const { InventoryDB } = DB;

        this.logger = Logger;
        this.commonMapper = CommonMapper;
        this.inventoryDB = InventoryDB;
    }

    /**
     * Retrieves all categories from the database.
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @returns {Promise<void>} Resolves with the response of the request.
     */
    async getAllCategories(req, res) {

        const result = {
            status: 400,
            categories: []
        };

        try {

            this.logger.info('<Inventory> Getting all categories...');

            result.categories.push(...await this.inventoryDB.categoriesDB.getAllCategories());

            result.status = 200;

            this.logger.info('<Inventory> Categories fetched successfully!');
        }
        catch (error) {

            result.status = 500;
            this.logger.error(`<Inventory> Error getting categories: ${error.message}`);
        }

        return res
            .status(result.status)
            .json(result.categories);
    }

    /**
     * Retrieves prices from the database with similarity to the given product names.
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @returns {Promise<void>} Resolves with the response of the request.
     */
    async verifyProducts(req, res) {

        const result = {
            status: 400,
            products: []
        };

        try {

            this.logger.info('<Inventory> Verifying products...');

            const productsArray = req?.body?.products || [];

            for (const _productName of productsArray) {

                const productName = this.commonMapper.toString(_productName)
                    ?.replace(/'"/g, '')
                    ?.toUpperCase()
                    ?.trim();

                this.logger.info(`<Inventory> Verifying product: ${productName}`);

                result.products.push(...await this.inventoryDB.pricesDB.getPricesWithSimilarity(productName));
            }
            
            this.logger.info('<Inventory> Products verified successfully!');

            result.status = 200;
        }
        catch (error) {

            result.status = 500;
            this.logger.error(`<Inventory> Error verifying products: ${error.message}`);
        }

        return res
            .status(result.status)
            .json(result.products);
    }
}

module.exports = InventoryController;