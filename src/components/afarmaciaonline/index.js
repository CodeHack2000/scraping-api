const GlobalScrapingRouter = require('./routes/globalScrapingRouter');

class AFarmaciaOnline {

    constructor(Utils, Tools, DB) {

        this.router = (new GlobalScrapingRouter(Utils, Tools, DB)).router;
    }
}

module.exports = AFarmaciaOnline;