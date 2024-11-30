const GlobalScrapingRouter = require('./routes/globalScrapingRouter');

class FarmaciaSaude {

    constructor(Utils, Tools, DB, Middlewares) {

        this.router = (new GlobalScrapingRouter(Utils, Tools, DB, Middlewares)).router;
    }
}

module.exports = FarmaciaSaude;