const GlobalScrapingRouter = require('./routes/globalScrapingRouter');

class TestWebsite {

    constructor(Utils, Tools, DB, Middlewares) {

        this.router = (new GlobalScrapingRouter(Utils, Tools, DB, Middlewares)).router;
    }
}

module.exports = TestWebsite;