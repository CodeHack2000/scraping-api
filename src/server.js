// Load aliases
require('module-alias/register');

const App = require('./app');
const Utils = require('@utils');

// Config
const ServerConfig = require('@config/serverConfig');

// DB
const DB = require('@models');

// Utils
const utils = new Utils();

const startServer = async () => {

    try {

        await DB.sequelize.sync();
        utils.logger.info('DB synced successfully.');

        App.listen(ServerConfig.port, () => {

            utils.logger.info(`Server is running on ${ServerConfig.port} port`);
        });
    }
    catch (error) {

        utils.logger.error('Server - Error: ' + error.message);
        process.exit(1);
    }
};

startServer();
