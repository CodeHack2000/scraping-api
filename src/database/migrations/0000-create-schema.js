'use strict';

const DbConfig = require('../../config/dbConfig');

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.createSchema(DbConfig.schema);
    },

    down: async (queryInterface) => {
        await queryInterface.dropSchema(DbConfig.schema);
    }
};
