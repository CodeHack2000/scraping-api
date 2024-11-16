const { Op } = require('sequelize');

const { products } = require('@models');

class ProductsDB {

    /**
     * Inserts a product into the database.
     * @param {Object} product - Product information to be inserted.
     * @returns {Promise<number>} The id of the inserted product.
     */
    static async insProduct(product) {

        const createdProduct = await products.create(product);

        return createdProduct.id;
    }

    /**
     * Updates a product in the database.
     * @param {Object} product - Product information to be updated.
     * @returns {Promise<boolean>} True if the product has been updated, false otherwise.
     */
    static async updProduct(product) {

        const [count, rows] = await products.update(

            product,
            {
                where: {
                    id: product.id
                },
                
                returning: true
            }
        );

        return { count, rows };
    }

    /**
     * Retrieves a product by its name.
     * @param {string} name - Product name to be retrieved.
     * @returns {Promise<Object>} The product with the given name if exists, null otherwise.
     */
    static async getProductByName(name = '') {

        return await products.findOne({ where: { 
            name: { [Op.iLike]: name }
        } });
    }

    /**
     * Inserts a batch of products into the database.
     * @param {Array<Object>} productsBatch - Array of product information to be inserted.
     * @param {Sequelize.Transaction} [transaction=null] - Transaction to be used for this operation.
     * @returns {Promise<Array<Products>>} The inserted products.
     */
    static async insProductsBatch(productsBatch, transaction = null) {

        return await products.bulkCreate(
            productsBatch,
            {
                updateOnDuplicate: ['description', 'msrm', 'updatedAt'],
                transaction,
                batchSize: 1000,
                validate: false
            }
        );
    }
}

module.exports = ProductsDB;
