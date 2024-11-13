const GlobalScrapingRouter = require('./routes/globalScrapingRouter');

class FarmaciaSantaMarta {

    constructor(Utils, Tools, DB) {

        this.router = (new GlobalScrapingRouter(Utils, Tools, DB)).router;
    }
}

module.exports = FarmaciaSantaMarta;