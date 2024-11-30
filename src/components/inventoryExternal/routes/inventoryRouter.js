const Express = require('express');

const InventoryController = require('../controller/inventoryController');
const AuthMiddleware = require('../middleware/authMiddleware');

class InventoryRouter {

    constructor(Utils, DB) {

        this.router = Express.Router();

        this.controller = new InventoryController(Utils, DB);
        this.authMiddleware = new AuthMiddleware(Utils);

        this._getAllCategories();
        this._verifyProducts();
    }

    _getAllCategories() {

        this.router.get(
            '/getAllCategories',
            (req, res, next) => this.authMiddleware.isInternalRequest(req, res, next),
            (req, res) => this.controller.getAllCategories(req, res)
        );
    }

    _verifyProducts() {

        this.router.post(
            '/verifyProducts',
            (req, res, next) => this.authMiddleware.isInternalRequest(req, res, next),
            (req, res) => this.controller.verifyProducts(req, res)
        );
    }
}

module.exports = InventoryRouter;