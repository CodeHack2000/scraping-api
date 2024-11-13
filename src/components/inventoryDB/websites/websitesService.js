const DB = require('@models');

const WebsitesDB = require('./websitesDB');
const WebsitesMapper = require('./websitesMapper');

class WebsitesService {

    constructor(Utils) {

        const { Logger, CommonMapper } = Utils;

        this.logger = Logger;
        
        this.websitesMapper = new WebsitesMapper(CommonMapper);
    }

    /**
     * Inserts a website into the database.
     * @param {Object} website - Website information to be inserted.
     * @returns {Promise<number>} The id of the inserted website.
     */
    async insWebsite(website) {

        this.logger.info('<WebsitesService> Inserting website...');

        let insertedWebsiteId = null;

        try {

            const verifyWebsiteExists = await WebsitesDB.getWebsiteByUrl(website?.url);

            if (verifyWebsiteExists?.id) {

                this.logger.warn('<WebsitesService> Website already exists!');
            }
            else {

                this.logger.info('<WebsitesService> Mapping website...');
                const mappedWebsite = this.websitesMapper.insWebsite(website);

                insertedWebsiteId = await WebsitesDB.insWebsite(mappedWebsite);

                this.logger.info('<WebsitesService> Website inserted successfully!');
            }
        }
        catch (error) {

            this.logger.error('<WebsitesService> Error inserting website: ' + error.message);
        }

        return insertedWebsiteId;
    }

    /**
     * Updates a website in the database.
     * @param {Object} website - Website information to be updated.
     * @returns {Promise<boolean>} True if the website has been updated, false otherwise.
     */
    async updWebsite(website) {

        this.logger.info('<WebsitesService> Updating website...');

        let websiteHasUpdated = false;

        try {

            this.logger.info('<WebsitesService> Mapping website...');
            const mappedWebsite = this.websitesMapper.updWebsite(website);

            websiteHasUpdated = await WebsitesDB.updWebsite(mappedWebsite);

            this.logger.info('<WebsitesService> Website updated successfully!');
        }
        catch (error) {

            this.logger.error('<WebsitesService> Error updating website: ' + error.message);
        }

        return websiteHasUpdated;
    }

    /**
     * Inserts a batch of websites into the database.
     * @param {Array<Object>} websites - Array of website information to be inserted.
     * @returns {Promise<boolean>} True if all websites have been inserted, false otherwise.
     */
    async insWebsitesBatch(websites) {

        this.logger.info('<WebsitesService> Inserting websites with batch...');

        let insertedWebsites = [];
        let transaction = null;

        try {

            this.logger.info('<WebsitesService> Mapping websites...');
            const mappedWebsites = websites.map((website) => this.websitesMapper.insWebsite(website));

            this.logger.info('<WebsitesService> Starting transaction...');
            transaction = await DB.sequelize.transaction();

            this.logger.info('<WebsitesService> Inserting websites...');
            insertedWebsites = await WebsitesDB.insWebsitesBatch(mappedWebsites, transaction);

            this.logger.info('<WebsitesService> Committing transaction...');
            await transaction.commit();
        }
        catch (error) {

            this.logger.error('<WebsitesService> Error inserting websites: ' + error.message);

            if (transaction) {

                this.logger.info('<WebsitesService> Rolling back transaction...');
                await transaction.rollback();
            }
        }

        return !!insertedWebsites?.length;
    }

}

module.exports = WebsitesService;
