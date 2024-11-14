const DB = require('@models');

const PricesDB = require('./pricesDB');
const PricesMapper = require('./pricesMapper');

class PricesService {

    constructor(Utils) {

        const { Logger, CommonMapper } = Utils;

        this.logger = Logger;
        
        this.pricesMapper = new PricesMapper(CommonMapper);
    }

    /**
     * Inserts a price into the database.
     * @param {Object} price - Price information to be inserted.
     * @returns {Promise<number>} The id of the inserted price.
     */
    async insPrice(price) {

        this.logger.info('<PricesService> Inserting price...');

        let insertedPriceId = null;

        try {

            this.logger.info('<PricesService> Mapping price...');
            const mappedPrice = this.pricesMapper.insPrice(price);

            insertedPriceId = await PricesDB.insPrice(mappedPrice);

            this.logger.info('<PricesService> Price inserted successfully!');
        }
        catch (error) {

            this.logger.error('<PricesService> Error inserting price: ' + error.message);
        }

        return insertedPriceId;
    }

    /**
     * Updates a price in the database.
     * @param {Object} price - Price information to be updated.
     * @returns {Promise<boolean>} True if the price has been updated, false otherwise.
     */
    async updPrice(price) {

        this.logger.info('<PricesService> Updating price...');

        let priceHasUpdated = false;

        try {

            this.logger.info('<PricesService> Mapping price...');
            const mappedPrice = this.pricesMapper.updPrice(price);

            priceHasUpdated = await PricesDB.updPrice(mappedPrice);

            this.logger.info('<PricesService> Price updated successfully!');
        }
        catch (error) {

            this.logger.error('<PricesService> Error updating price: ' + error.message);
        }

        return priceHasUpdated;
    }

    /**
     * Sets a price in the database, either by inserting a new one if it doesn't exist, or by updating an existing one.
     * @param {Object} price - Price information to be set.
     * @returns {Promise<number | boolean>} The id of the inserted price, or true if the price has been updated, or false if the price exists but can not be updated.
     */
    async setPrice(price) {

        this.logger.info('<PricesService> Setting price...');

        let result;

        try {

            this.logger.info('<PricesService> Getting price...');
            const _price = await PricesDB.getPriceByProductIdAndWebsiteId(price?.productId, price?.websiteId);

            if (
                _price?.id
                && _price?.price !== price?.price
            ) {

                this.logger.info('<PricesService> The price exists and can be updated!');
                const updatePrice = {
                    id: _price?.id,
                    price: price?.price
                };

                result = await PricesDB.updPrice(updatePrice);
            }
            else if (!_price?.id) {

                this.logger.info('<PricesService> The price does not exist and can be inserted!');
                result = await this.insPrice(price);
            }
            else {

                this.logger.warn('<PricesService> The requested price already exists and can not be updated!');
            }
        }
        catch (error) {

            this.logger.error('<PricesService> Error setting price: ' + error.message);
        }

        return result;
    }

    
    /**
     * Inserts a batch of prices into the database.
     * @param {Array<Object>} prices - Array of price information to be inserted.
     * @returns {Promise<Array<Prices>>} The inserted prices.
     */
    async insPricesBatch(prices) {

        this.logger.info('<PricesService> Inserting prices with batch...');

        const insertedPrices = [];
        let transaction = null;

        try {

            this.logger.info('<PricesService> Mapping prices...');
            const mappedPrices = prices.map((price) => this.pricesMapper.insPrice(price));

            this.logger.info('<PricesService> Starting transaction...');
            transaction = await DB.sequelize.transaction();

            this.logger.info('<PricesService> Inserting prices...');
            insertedPrices.push( ...await PricesDB.insPricesBatch(mappedPrices, transaction) );

            this.logger.info('<PricesService> Committing transaction...');
            await transaction.commit();
        }
        catch (error) {

            this.logger.error('<PricesService> Error inserting prices: ' + error.message);

            if (transaction) {

                this.logger.info('<PricesService> Rolling back transaction...');
                await transaction.rollback();
            }
        }

        return insertedPrices;
    }

}

module.exports = PricesService;
