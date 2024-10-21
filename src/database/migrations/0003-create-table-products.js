'use strict';

const DbConfig = require('../../config/dbConfig');

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('products', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            categoryId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'categories',
                    key: 'id'
                }
            },
            description: {
                type: Sequelize.TEXT
            },
            msrm: {
                type: Sequelize.BOOLEAN
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                type: Sequelize.DATE
            },
        }, {
            schema: DbConfig.schema,
            tableName: 'products',
            timestamps: false
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('products');
    }
};
