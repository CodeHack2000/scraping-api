const GlobalScrapingRouter = require('./routes/globalScrapingRouter');

class FarmaciaSantaMarta {

    constructor(Logger, TorInstances, TaskQueue) {

        this.router = (new GlobalScrapingRouter(Logger, TorInstances, TaskQueue)).router;
    }
}

module.exports = FarmaciaSantaMarta;