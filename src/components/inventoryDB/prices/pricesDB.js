const { prices } = require('@models');

class PricesDB {

    /**
     * Inserts a price into the database.
     * @param {Object} price - Price information to be inserted.
     * @returns {Promise<number>} The id of the inserted price.
     */
    static async insPrice(price) {

        const createdPrice = await prices.create(price);

        return createdPrice.id;
    }

    /**
     * Updates a price in the database.
     * @param {Object} price - Price information to be updated.
     * @returns {Promise<boolean>} True if the price has been updated, false otherwise.
     */
    static async updPrice(price) {

        const [count, rows] = await prices.update(

            price,
            {
                where: {
                    id: price.id
                },
                
                returning: true
            }
        );

        return { count, rows };
    }

    /**
     * Retrieves a price from the database by the given product id and website id.
     * @param {number} productId - The id of the product.
     * @param {string} websiteId - The id of the website.
     * @returns {Promise<Object | null>} The price if it exists, null otherwise.
     */
    static async getPriceByProductIdAndWebsiteId(productId, websiteId) {

        return await prices.findOne({
            where: {
                productId: productId,
                websiteId: websiteId
            }
        });
    }

    /**
     * Inserts a batch of prices into the database.
     * @param {Array<Object>} pricesBatch - Array of price information to be inserted.
     * @param {Sequelize.Transaction} [transaction=null] - Transaction to be used for this operation.
     * @returns {Promise<Array<Prices>>} The inserted prices.
     */
    static async insPricesBatch(pricesBatch, transaction = null) {

        return await prices.bulkCreate(
            pricesBatch,
            {
                updateOnDuplicate: ['price', 'url', 'updatedAt'],
                transaction,
                batchSize: 1000
            }
        );
    }
}

module.exports = PricesDB;
