'use strict';

const DbConfig = require('../../config/dbConfig');

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('test_table', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            year: {
                type: Sequelize.STRING
            },
            wins: {
                type: Sequelize.STRING
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
            tableName: 'test_table',
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ['name', 'year']
                }
            ]
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('test_table');
    }
};
