const { websites } = require('@models');

class WebsitesDB {

    /**
     * Inserts a website into the database.
     * @param {Object} website - Website information to be inserted.
     * @returns {Promise<number>} The id of the inserted website.
     */
    static async insWebsite(website) {

        const createdWebsite = await websites.create(website);

        return createdWebsite.id;
    }

    /**
     * Updates a website in the database.
     * @param {Object} website - Website information to be updated.
     * @returns {Promise<boolean>} True if the website has been updated, false otherwise.
     */
    static async updWebsite(website) {

        const affectedRows = await websites.update(

            website,
            {
                where: {
                    id: website.id
                }
            }
        );

        return !!affectedRows?.[0];
    }

    /**
     * Retrieves a website from the database by the given URL.
     * @param {string} url - The URL of the website to be retrieved.
     * @returns {Promise<Object | null>} The website if it exists, null otherwise.
     */
    static async getWebsiteByUrl(url) {

        return await websites.findOne({ where: { url: url } });
    }

    /**
     * Inserts a batch of websites into the database.
     * @param {Array<Object>} websitesBatch - Array of website information to be inserted.
     * @param {Sequelize.Transaction} [transaction=null] - Transaction to be used for this operation.
     * @returns {Promise<Array<Websites>>} The inserted websites.
     */
    static async insWebsitesBatch(websitesBatch, transaction = null) {

        return await websites.bulkCreate(
            websitesBatch,
            {
                updateOnDuplicate: ['updatedAt'],
                transaction
            }
        );
    }
}

module.exports = WebsitesDB;