/* eslint-disable no-undef */

const Fs = require('fs');
const Path = require('path');

const GlobalScrapingService = require('../../services/globalScrapingService');
const htmlResult = require('../data/higiene-oral-data-result.json');

describe('globalScrapingService', () => {

    const logger = {
        error: jest.fn(),
        info: jest.fn()
    };
    const globalScrapingService = new GlobalScrapingService(logger, true);

    const websiteUrl = 'https://www.test.com.pt';
    let html = '';

    beforeAll(() => {

        const htmlPath = Path.join(__dirname, '../data/higiene-oral-data.html');
        html = Fs.readFileSync(htmlPath, 'utf8');
    });

    describe('extractHtmlToJson', () => {

        it('should extract HTML to JSON', async () => {

            const result = await globalScrapingService.extractHtmlToJson(html, websiteUrl);

            expect(result).toEqual(htmlResult);
        });
    });
});
