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

        this.logger.info('<AFarmaciaOnline> [databaseService] - Inserting data to database...');

        if (dataBatch?.length === 0) {

            return success;
        }

        try {

            this.logger.info('<AFarmaciaOnline> [databaseService] - Mapping products...');

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

            this.logger.info('<AFarmaciaOnline> [databaseService] - Inserting products...');
            
            // Insert the products to the database
            const dbProducts = [];
            for (const product of products) {

                const prod = await this.inventoryDB.productsService.setProduct(product);

                dbProducts.push({ id: prod?.id, ...product });
            }

            this.logger.info('<AFarmaciaOnline> [databaseService] - Mapping prices...');

            // Obtain the prices from the data
            const prices = [];
            for (const obj of dataBatch) {

                const product = dbProducts?.find((prod) => prod?.name === obj?.name && prod?.id);

                const price = {
                    productId: product?.id,
                    websiteId: websiteId,
                    price: obj?.price,
                    url: obj?.url
                };

                if (price?.productId && price?.websiteId) {

                    prices.push(price);
                }
            }

            this.logger.info('<AFarmaciaOnline> [databaseService] - Inserting prices...');

            // Insert the prices to the database
            const dbPrices = [];
            for (const price of prices) {

                const _price = await this.inventoryDB.pricesService.setPrice(price);

                dbPrices.push({ priceId: _price?.id, ...price });
            }

            success = dbProducts?.length > 0 && dbPrices?.length > 0;

            this.logger.debug(`<AFarmaciaOnline> [databaseService] - Handled ${dbProducts?.length} products and ${dbPrices?.length} prices`);
        }
        catch (error) {

            this.logger.error(`<AFarmaciaOnline> [databaseService] - Error inserting data: ${error.message}`);
        }

        return success;
    }
}

module.exports = DatabaseService;