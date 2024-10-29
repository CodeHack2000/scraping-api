const TorControl = require('tor-control');
const { SocksProxyAgent } = require('socks-proxy-agent');

class ProductScrapingController {

    constructor(Logger, torData) {

        this.logger = Logger;
        this.controller = new TorControl({
            password: torData.password,
            persistent: true,
            port: torData.controlPort,
            host: torData.host
        });
        this.agent = SocksProxyAgent(`socks://${torData.host}:${torData.port}`);
    }
}

module.exports = ProductScrapingController;