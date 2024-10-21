'use strict';

const DbConfig = require('../../config/dbConfig');

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('prices', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            productId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'products',
                    key: 'id'
                }
            },
            websiteId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'websites',
                    key: 'id'
                }
            },
            price: {
                type: Sequelize.DOUBLE,
                allowNull: false
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
            tableName: 'prices',
            timestamps: false
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('prices');
    }
};
