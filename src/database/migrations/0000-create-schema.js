'use strict';

const dbConfig = require('../../config/dbConfig');

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.createSchema(dbConfig.schema);
    },

    down: async (queryInterface) => {
        await queryInterface.dropSchema(dbConfig.schema);
    }
};
