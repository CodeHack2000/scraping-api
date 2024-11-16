const { Op } = require('sequelize');

const { categories } = require('@models');

class CategoriesDB {

    /**
     * Inserts a category into the database.
     * @param {Object} category - The category information to be inserted.
     * @param {string} category.name - The name of the category.
     * @param {string} [category.description] - A description of the category.
     * @returns {Promise<number>} The ID of the inserted category.
     */
    static async insCategory(category) {

        const createdCategory = await categories.create(category);

        return createdCategory.id;
    }

    /**
     * Updates a category in the database.
     * @param {Object} category - The category information to be updated.
     * @param {number} category.id - The ID of the category to be updated.
     * @returns {Promise<boolean>} True if the category has been updated, false otherwise.
     */
    static async updCategory(category) {

        const affectedRows = await categories.update(

            category,
            {
                where: {
                    id: category.id
                }
            }
        );

        return !!affectedRows?.[0];
    }

    /**
     * Retrieves a category by its name.
     * @param {string} name - Category name to be retrieved.
     * @returns {Promise<Object>} The category with the given name if exists, null otherwise.
     */
    static async getCategoryByName(name = '') {

        return await categories.findOne({ where: { 
            name: { [Op.iLike]: name } 
        } });
    }

    /**
     * Inserts a batch of categories into the database.
     * @param {Array<Object>} categoriesBatch - Array of category information to be inserted.
     * @param {Sequelize.Transaction} [transaction=null] - Transaction to be used for this operation.
     * @returns {Promise<Array<Categories>>} The inserted categories.
     */
    static async insCategoriesBatch(categoriesBatch, transaction = null) {

        return await categories.bulkCreate(
            categoriesBatch,
            {
                updateOnDuplicate: ['description', 'updatedAt'],
                transaction,
                batchSize: 1000
            }
        );
    }

}

module.exports = CategoriesDB;
