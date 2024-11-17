const GlobalScrapingRouter = require('./routes/globalScrapingRouter');

class FarmaciaSaude {

    constructor(Utils, Tools, DB) {

        this.router = (new GlobalScrapingRouter(Utils, Tools, DB)).router;
    }
}

module.exports = FarmaciaSaude;