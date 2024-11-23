const Express = require('express');

const InventoryController = require('../controller/inventoryController');

class InventoryRouter {

    constructor(Utils, DB) {

        this.router = Express.Router();

        this.controller = new InventoryController(Utils, DB);

        this._getAllCategories();
        this._verifyProducts();
    }

    _getAllCategories() {

        this.router.get(
            '/getAllCategories',
            (req, res) => this.controller.getAllCategories(req, res)
        );
    }

    _verifyProducts() {

        this.router.post(
            '/verifyProducts',
            (req, res) => this.controller.verifyProducts(req, res)
        );
    }
}

module.exports = InventoryRouter;