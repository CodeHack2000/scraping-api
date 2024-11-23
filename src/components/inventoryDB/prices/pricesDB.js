const { literal, col } = require('sequelize');

const { prices, websites, products, categories } = require('@models');

class PricesDB {

    /**
     * Inserts a price into the database.
     * @param {Object} price - Price information to be inserted.
     * @returns {Promise<number>} The id of the inserted price.
     */
    static async insPrice(price) {

        const createdPrice = await prices.create(price, {

            returning: true
        });

        return createdPrice;
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

    
    /**
     * Retrieves prices with product names similar to the given one.
     * The similarity is calculated using the strict_word_similarity function.
     * @param {string} [productName=''] - The product name to search for.
     * @returns {Promise<Array<Object>>} The prices with similar product names.
     */
    static async getPricesWithSimilarity(productName = '') {

        return await prices.findAll({
            attributes: [
                [col('website.name'), 'websiteName'],
                [col('product->category.name'), 'category'],
                [col('product.name'), 'productName'],
                ['price', 'price'],
                ['url', 'productUrl'],
            ],
            include: [
                {
                    model: products,
                    as: 'product',
                    attributes: [],
                    include: [
                        {
                            model: categories,
                            as: 'category',
                            attributes: [],
                        },
                    ],
                },
                {
                    model: websites,
                    as: 'website',
                    attributes: [],
                },
            ],
            where: literal(`
                strict_word_similarity( UPPER("product"."name"), '${productName}') >= 0.25
            `),
        });
    }
}

module.exports = PricesDB;
