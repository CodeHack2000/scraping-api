'use strict';

const DbConfig = require('../../config/dbConfig');

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('categories', {
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
            description: {
                type: Sequelize.TEXT
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
            tableName: 'categories',
            timestamps: false
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('categories');
    }
};
