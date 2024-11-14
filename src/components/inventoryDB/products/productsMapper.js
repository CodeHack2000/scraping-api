const Moment = require('moment');

class ProductsMapper {

    constructor(CommonMapper) {

        this.commonMapper = CommonMapper;
    }
    
    /**
     * Maps a product object to a database-compatible format for insert.
     * @param {Object} product - The product information to be mapped.
     * @param {string} product.name - The name of the product.
     * @param {number} product.categoryId - The ID of the category the product belongs to.
     * @param {string} product.description - A description of the product.
     * @param {boolean} product.msrm - Measurement status of the product.
     * @returns {Object} The mapped product object with validated and transformed properties.
     */
    insProduct(product) {

        return {
            name: this.commonMapper.toString(product?.name),
            categoryId: this.commonMapper.toString(product?.categoryId, null),
            description: this.commonMapper.toString(product?.description),
            msrm: this.commonMapper.toBoolean(product?.msrm),
            updatedAt: Moment().toDate()
        };
    }

    /**
     * Maps a product object to a database-compatible format for update.
     * @param {Object} product - The product information to be mapped.
     * @param {number} product.id - The ID of the product to be updated.
     * @param {string} product.name - The name of the product.
     * @param {number} product.categoryId - The ID of the category the product belongs to.
     * @param {string} product.description - A description of the product.
     * @param {boolean} product.msrm - Measurement status of the product.
     * @returns {Object} The mapped product object with validated and transformed properties.
     */
    updProduct(product) {

        return {
            id: this.commonMapper.toInt(product?.id),
            name: this.commonMapper.toString(product?.name),
            categoryId: this.commonMapper.toInt(product?.categoryId),
            description: this.commonMapper.toString(product?.description),
            msrm: this.commonMapper.toBoolean(product?.msrm),
            updatedAt: Moment().toDate()
        };
    }
}

module.exports = ProductsMapper;

