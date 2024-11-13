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
            { schema: dbConfig.schema, tableName: 'websites' },
            [
                {
                    name: 'farmaciasantamarta',
                    url: 'https://farmaciasantamarta.pt',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'afarmaciaonline',
                    url: 'https://www.afarmaciaonline.pt',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'pharma24',
                    url: 'https://www.pharma24.pt',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'farmaciasaude',
                    url: 'https://www.farmaciasaude.com.pt',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'sadabandeira',
                    url: 'https://www.sadabandeira.com',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'gamafarma',
                    url: 'https://www.gamafarma.pt',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'farmaciavci',
                    url: 'https://www.farmaciavci.pt',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'cuida',
                    url: 'https://www.cuida.pt',
                    createdAt: now,
                    updatedAt: now
                },
                {
                    name: 'farmaciadaliga',
                    url: 'https://www.farmaciadaliga.pt',
                    createdAt: now,
                    updatedAt: now
                }
            ],
            {}
        );
    },

    async down(queryInterface, _) {

        await queryInterface.bulkDelete(
            { schema: dbConfig.schema, tableName: 'websites' },
            null,
            {}
        );
    }
};
