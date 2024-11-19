/* eslint-disable no-undef */

const Fs = require('fs');
const Path = require('path');

const GlobalScrapingService = require('../../services/globalScrapingService');
const htmlResult = require('../data/medicamentos-data-result.json');
const config = require('../../config/config');

describe('globalScrapingService', () => {

    const logger = {
        log: jest.fn()
    };
    const urlBase = config.urlBase;
    const globalScrapingService = new GlobalScrapingService(logger, true);

    let html = '';

    beforeAll(() => {

        const htmlPath = Path.join(__dirname, '../data/medicamentos-data.html');
        html = Fs.readFileSync(htmlPath, 'utf8');
    });

    describe('extractHtmlToJson', () => {

        it('should extract HTML to JSON', async () => {

            const result = await globalScrapingService.extractHtmlToJson(html);

            expect(result).toEqual(htmlResult);
        });
    });

    describe('generateCategoryUrls', () => {

        const categoryUrl = '/medicamentos';

        const result = globalScrapingService.generateCategoryUrls(categoryUrl, 4, config);

        expect(result).toEqual([
            `${urlBase}/medicamentos/2&pmax=60`,
            `${urlBase}/medicamentos/3&pmax=60`,
            `${urlBase}/medicamentos/4&pmax=60`
        ]);
    });

});
