const Fs = require('fs');
const Path = require('path');
const Moment = require('moment');

const config = require('../config/config');

class ScrapingFilesService {

    constructor(Logger) {

        this.logger = Logger;
    }

    /**
     * Reads all files with the given website name and sorts them by timestamp.
     * 
     * @param {string} websiteName - Name of the website.
     * @returns {Promise<Array<string>>} A promise that resolves with an array of file paths sorted by timestamp.
     */
    async getFiles(websiteName = '') {

        let sortedFiles = [];

        try {

            this.logger.info('<ScrapingFilesService> Reading files...');

            const dataDirPath = Path.join(__dirname, '../../../data');
            const fileId = 'not-scraped-urls_' + websiteName;

            const files = await new Promise((resolve, reject) => {
    
                Fs.readdir(dataDirPath, (err, files) => {

                    if (err) {
    
                        reject(err);
                        return;
                    }
    
                    resolve(files);
                });

            });

            const txtFiles = files.filter((file) => {

                return file.endsWith('.txt') && file.includes(fileId);
            });

            this.logger.info('<ScrapingFilesService> Found ' + txtFiles.length + ' files.');
            this.logger.info('<ScrapingFilesService> Sorting files...');

            sortedFiles = txtFiles
                .sort((a, b) => {
                    const timestampA = Moment(a.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/)[0]);
                    const timestampB = Moment(b.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/)[0]);
                    return timestampA.valueOf() - timestampB.valueOf();
                })
                .map((file) => Path.join(dataDirPath, file));
        }
        catch (error) {

            this.logger.error('Error reading files:', error);
        }

        return sortedFiles;
    }

    /**
     * Processes a file and generates new URLs to be scraped.
     * 
     * @param {string} filePath - Path of the file to be processed.
     * @returns {Array<string>} A list of new URLs to be scraped.
     */
    processFile(filePath) {

        const newUrls = [];

        try {

            this.logger.info('<ScrapingFilesService> Processing file...');

            // Get the urls and filter the content
            const content = Fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const urls = lines
                .filter((linha) => !['[', ']'].includes(linha))
                .map((linha) => linha.replace(/[,"]*/g, '').trim())
                .filter((linha) => linha !== 'null');

            urls.forEach((url) => newUrls.push( this._generateNewUrl(url) ));
            
        } catch (error) {
            this.logger.error('Error processing file:', error);
        }

        return newUrls;
    }

    
    /**
     * Generates a new URL object with a modified page number for scraping.
     * 
     * This function processes the input URL to determine which category it belongs to and 
     * decrements the page number (if applicable) to create a new URL. It also logs the processing step.
     * 
     * @param {string} url - The original URL to be processed.
     * @returns {Object} An object containing the new URL and its corresponding category.
     */
    _generateNewUrl(url) {

        let newUrlObj = {};

        try {

            this.logger.info(`<ScrapingFilesService> Processing the url... ${url}`);

            const baseUrl = config.urlBase;
            const categories = config.categories;
            const category = categories.find((categ) => url?.includes(categ?.url));

            const regex = new RegExp(`${baseUrl}${category?.url}/([0-9]+)`, 'g');
            const matches = regex.exec(url);

            const newPage = matches?.[1] === 1
                ? 1
                : (matches?.[1] - 1) || 0;

            newUrlObj.url = `${baseUrl}${category?.url}/${newPage}&pmax=60`;
            newUrlObj.category = category?.url;
        }
        catch (error) {

            this.logger.error('Error processing the url:', error);
        }

        return newUrlObj;
    }

}

module.exports = ScrapingFilesService;