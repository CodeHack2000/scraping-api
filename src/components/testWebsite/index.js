const GlobalScrapingRouter = require('./routes/globalScrapingRouter');

class TestWebsite {

    constructor(Utils, Tools, DB) {

        this.router = (new GlobalScrapingRouter(Utils, Tools, DB)).router;
    }
}

module.exports = TestWebsite;