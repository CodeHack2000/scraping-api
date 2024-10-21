'use strict';

const DbConfig = require('../../config/dbConfig');

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('websites', {
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
            url: {
                type: Sequelize.TEXT,
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
            tableName: 'websites',
            timestamps: false
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('websites');
    }
};
