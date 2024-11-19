const Express = require('express');

const GlobalScrapingController = require('../controller/globalScrapingController');

class GlobalScrapingRouter {

    constructor(Utils, Tools, DB) {

        this.router = Express.Router();

        this.controller = new GlobalScrapingController(Utils, Tools, DB);

        this._scrapeAllCategories();
    }

    _scrapeAllCategories() {

        this.router.get(
            '/scrapeAllCategories',
            (req, res) => this.controller.scrapeAllCategories(req, res)
        );
    }
}

module.exports = GlobalScrapingRouter;