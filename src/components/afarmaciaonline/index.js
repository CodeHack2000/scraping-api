const GlobalScrapingRouter = require('./routes/globalScrapingRouter');

class AFarmaciaOnline {

    constructor(Utils, Tools, DB, Middlewares) {

        this.router = (new GlobalScrapingRouter(Utils, Tools, DB, Middlewares)).router;
    }
}

module.exports = AFarmaciaOnline;