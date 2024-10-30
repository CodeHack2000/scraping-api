const Express = require('express');

const GlobalScrapingController = require('../controller/globalScrapingController');

class GlobalScrapingRouter {

    constructor(Logger, TorInstances, TaskQueue) {

        this.router = Express.Router();

        this.controller = new GlobalScrapingController(Logger, TorInstances, TaskQueue);

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