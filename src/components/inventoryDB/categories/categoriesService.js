const DB = require('@models');

const CategoriesDB = require('./categoriesDB');
const CategoriesMapper = require('./categoriesMapper');

class CategoriesService {

    constructor(Utils) {

        const { Logger, CommonMapper } = Utils;

        this.logger = Logger;

        this.categoriesMapper = new CategoriesMapper(CommonMapper);
    }

    /**
     * Inserts a category into the database.
     * @param {Object} category - Category information to be inserted.
     * @returns {Promise<number>} The id of the inserted category.
     */
    async insCategory(category) {

        this.logger.info('<CategoriesService> Inserting category...');

        let insertedCategoryId = null;

        try {

            const verifyCategoryExists = await CategoriesDB.getCategoryByName(category?.name);

            if (verifyCategoryExists?.id) {

                this.logger.warn('<CategoriesService> Category already exists!');
            }
            else {

                this.logger.info('<CategoriesService> Mapping category...');
                const mappedCategory = this.categoriesMapper.insCategory(category);

                insertedCategoryId = await CategoriesDB.insCategory(mappedCategory);

                this.logger.info('<CategoriesService> Category inserted successfully!');
            }
        }
        catch (error) {

            this.logger.error('<CategoriesService> Error inserting category: ' + error.message);
        }

        return insertedCategoryId;
    }

    /**
     * Updates a category in the database.
     * @param {Object} category - Category information to be updated.
     * @returns {Promise<boolean>} True if the category has been updated, false otherwise.
     */
    async updCategory(category) {

        this.logger.info('<CategoriesService> Updating category...');

        let categoryHasUpdated = false;

        try {

            this.logger.info('<CategoriesService> Mapping category...');
            const mappedCategory = this.categoriesMapper.updCategory(category);

            categoryHasUpdated = await CategoriesDB.updCategory(mappedCategory);

            this.logger.info('<CategoriesService> Category updated successfully!');
        }
        catch (error) {

            this.logger.error('<CategoriesService> Error updating category: ' + error.message);
        }

        return categoryHasUpdated;
    }

    /**
     * Inserts a batch of categories into the database.
     * @param {Array<Object>} categories - Array of category information to be inserted.
     * @returns {Promise<boolean>} True if all categories have been inserted, false otherwise.
     */
    async insCategoriesBatch(categories) {

        this.logger.info('<CategoriesService> Inserting categories with batch...');

        let insertedCategories = [];
        let transaction = null;

        try {

            this.logger.info('<CategoriesService> Mapping categories...');
            const mappedCategories = categories.map((category) => this.categoriesMapper.insCategory(category));

            this.logger.info('<CategoriesService> Starting transaction...');
            transaction = await DB.sequelize.transaction();

            this.logger.info('<CategoriesService> Inserting categories...');
            insertedCategories = await CategoriesDB.insCategoriesBatch(mappedCategories, transaction);

            this.logger.info('<CategoriesService> Committing transaction...');
            await transaction.commit();
        }
        catch (error) {

            this.logger.error('<CategoriesService> Error inserting categories: ' + error.message);

            if (transaction) {

                this.logger.info('<CategoriesService> Rolling back transaction...');
                await transaction.rollback();
            }
        }

        return !!insertedCategories?.length;
    }
}

module.exports = CategoriesService;

