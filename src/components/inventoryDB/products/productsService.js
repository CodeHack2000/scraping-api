const DB = require('@models');

const ProductsDB = require('./productsDB');
const ProductsMapper = require('./productsMapper');

class ProductsService {

    constructor(Utils) {

        const { Logger, CommonMapper } = Utils;

        this.logger = Logger;

        this.productsMapper = new ProductsMapper(CommonMapper);
    }

    /**
     * Inserts a product into the database.
     * @param {Object} product - Product information to be inserted.
     * @returns {Promise<number>} The id of the inserted product.
     */
    async insProduct(product) {

        this.logger.info('<ProductsService> Inserting product...');

        let insertedProductId = null;

        try {

            this.logger.info('<ProductsService> Mapping product...');
            const mappedProduct = this.productsMapper.insProduct(product);

            insertedProductId = await ProductsDB.insProduct(mappedProduct);

            this.logger.info('<ProductsService> Product inserted successfully!');
        }
        catch (error) {

            this.logger.error('<ProductsService> Error inserting product: ' + error.message);
        }

        return insertedProductId;
    }

    /**
     * Updates a product in the database.
     * @param {Object} product - Product information to be updated.
     * @returns {Promise<boolean>} True if the product has been updated, false otherwise.
     */
    async updProduct(product) {

        this.logger.info('<ProductsService> Updating product...');

        let productHasUpdated = false;

        try {

            this.logger.info('<ProductsService> Mapping product...');
            const mappedProduct = this.productsMapper.updProduct(product);

            productHasUpdated = await ProductsDB.updProduct(mappedProduct);

            this.logger.info('<ProductsService> Product updated successfully!');
        }
        catch (error) {

            this.logger.error('<ProductsService> Error updating product: ' + error.message);
        }

        return productHasUpdated;
    }

    /**
     * Sets a product in the database, either by inserting a new one if it doesn't exist, or by updating an existing one.
     * @param {Object} product - Product information to be set.
     * @returns {Promise<number | boolean>} The id of the inserted product, or true if the product has been updated, or false if the product exists but can not be updated.
     */
    async setProduct(product) {

        this.logger.info('<ProductsService> Setting product...');

        let result;

        try {

            this.logger.info('<ProductsService> Getting product...');
            const _product = await ProductsDB.getProductByName(product?.name);

            if (
                _product?.id
                && (
                    (!_product?.description && product?.description)
                    || (!_product?.msrm && product?.msrm)
                )
            ) {

                this.logger.info('<ProductsService> The product exists and can be updated!');
                const updateProduct = {
                    id: _product?.id,
                    description: product?.description,
                    msrm: product?.msrm
                };

                result = await ProductsDB.updProduct(updateProduct);
            }
            else if (!_product?.id) {

                this.logger.info('<ProductsService> The product does not exist and can be inserted!');
                result = await this.insProduct(product);
            }
            else {

                this.logger.warn('<ProductsService> The requested product already exists and can not be updated!');
            }
        }
        catch (error) {

            this.logger.error('<ProductsService> Error setting product: ' + error.message);
        }

        return result;
    }

    /**
     * Inserts a batch of products into the database.
     * @param {Array<Object>} products - Array of product information to be inserted.
     * @returns {Promise<boolean>} True if all products have been inserted, false otherwise.
     */
    async insProductsBatch(products) {

        this.logger.info('<ProductsService> Inserting products with batch...');

        const insertedProducts = [];
        let transaction = null;

        try {

            this.logger.info('<ProductsService> Mapping products...');
            const mappedProducts = products.map((product) => this.productsMapper.insProduct(product));

            this.logger.info('<ProductsService> Starting transaction...');
            transaction = await DB.sequelize.transaction();

            this.logger.info('<ProductsService> Inserting products...');
            insertedProducts.push( ...await ProductsDB.insProductsBatch(mappedProducts, transaction) );

            this.logger.info('<ProductsService> Committing transaction...');
            await transaction.commit();
        }
        catch (error) {

            this.logger.error('<ProductsService> Error inserting products: ' + error.message);

            if (transaction) {

                this.logger.info('<ProductsService> Rolling back transaction...');
                await transaction.rollback();
            }
        }

        return insertedProducts;
    }

}

module.exports = ProductsService;
