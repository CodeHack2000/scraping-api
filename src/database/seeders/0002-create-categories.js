/* eslint-disable no-unused-vars */
'use strict';

const Moment = require('moment');

const dbConfig = require('../../config/dbConfig');

/**
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {

    async up(queryInterface, Sequelize) {

        const now = Moment().toDate();

        await queryInterface.bulkInsert(
            { schema: dbConfig.schema, tableName: 'categories' },
            [
                {
                    name: 'Mamã e Bebé',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'Cabelo',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'Rosto',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'Corpo',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'Animal',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'Solares',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'Saúde e Bem-Estar',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'Saúde Oral',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'Sexualidade',
                    createdAt: now,
                    updatedAt: now
                },
            ],
            {}
        );
    },

    async down(queryInterface, _) {

        await queryInterface.bulkDelete(
            { schema: dbConfig.schema, tableName: 'categories' },
            null,
            {}
        );
    }
};
