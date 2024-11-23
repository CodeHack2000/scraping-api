const Express = require('express');

const GlobalScrapingController = require('../controller/globalScrapingController');

class GlobalScrapingRouter {

    constructor(Utils, Tools, DB) {

        this.router = Express.Router();

        this.controller = new GlobalScrapingController(Utils, Tools, DB);

        this._scrapeAllCategories();
        this._getAllCategoriesUrls();
        this._scrapeNotScrapedUrls();
    }

    _scrapeAllCategories() {

        this.router.get(
            '/scrapeAllCategories',
            (req, res) => this.controller.scrapeAllCategories(req, res)
        );
    }

    _getAllCategoriesUrls() {

        this.router.get(
            '/getAllCategoriesUrls',
            (req, res) => this.controller.getAllCategoriesUrls(req, res)
        );
    }

    _scrapeNotScrapedUrls() {

        this.router.get(
            '/scrapeNotScrapedUrls',
            (req, res) => this.controller.scrapeNotScrapedUrls(req, res)
        );
    }
}

module.exports = GlobalScrapingRouter;