const GlobalScrapingRouter = require('./routes/globalScrapingRouter');

class FarmaciaSantaMarta {

    constructor(Logger, TorInstances) {

        this.router = (new GlobalScrapingRouter(Logger, TorInstances)).router;
    }
}

module.exports = FarmaciaSantaMarta;