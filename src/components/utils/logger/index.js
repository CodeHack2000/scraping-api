const BuildDevLogger = require('./devLogger');
const BuildProdLogger = require('./prodLogger');
const ServerConfig = require('../../../config/serverConfig');

module.exports = ServerConfig.env === 'development' 
    ? BuildDevLogger() 
    : BuildProdLogger();