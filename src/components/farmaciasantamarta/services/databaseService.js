class DatabaseService {

    constructor(Logger, InventoryDB) {

        this.logger = Logger;
        this.inventoryDB = InventoryDB;
    }

    /**
     * Inserts a batch of products and prices from the given data to the database.
     * @param {Array<Object>} dataBatch - The data to be inserted.
     * @param {number} categoryId - The id of the category to which the products belong.
     * @param {string} websiteId - The id of the website from which the products have been scraped.
     * @returns {Promise<boolean>} True if all products and prices have been inserted, false otherwise.
     */
    async insertDataToDB(dataBatch, categoryId, websiteId) {

        let success = false;

        this.logger.info('<FarmaciaSantaMarta> [databaseService] - Inserting data to database...');

        try {

            this.logger.info('<FarmaciaSantaMarta> [databaseService] - Mapping products...');

            // Obtain the products from the data
            const products = dataBatch
                .filter((obj) => obj?.name)
                .map((obj) => {

                    return {
                        name: obj?.name,
                        categoryId: categoryId,
                        description: obj?.description,
                        msrm: obj?.msrm
                    };
                });

            this.logger.info('<FarmaciaSantaMarta> [databaseService] - Inserting products...');
            
            // Insert the products to the database
            const insertedProducts = await this.inventoryDB.productsService.insProductsBatch(products);

            this.logger.info('<FarmaciaSantaMarta> [databaseService] - Mapping prices...');

            // Obtain the prices from the data
            const prices = [];
            for (const obj of dataBatch) {

                const product = insertedProducts?.find((prod) => prod?.name === obj?.name && prod?.id);

                const price = {
                    productId: product?.id,
                    websiteId: websiteId,
                    price: obj?.price,
                    url: obj?.url
                };

                prices.push(price);
            }

            this.logger.info('<FarmaciaSantaMarta> [databaseService] - Inserting prices...');

            // Insert the prices to the database
            const insertedPrices = await this.inventoryDB.pricesService.insPricesBatch(prices);

            success = insertedProducts?.length > 0 && insertedPrices?.length > 0;

            this.logger.debug(`<FarmaciaSantaMarta> [databaseService] - Inserted ${insertedProducts?.length} products and ${insertedPrices?.length} prices`);
        }
        catch (error) {

            this.logger.error(`<FarmaciaSantaMarta> [databaseService] - Error inserting data: ${error.message}`);
        }

        return success;
    }
}

module.exports = DatabaseService;