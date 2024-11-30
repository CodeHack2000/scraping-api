const Express = require('express');

const InventoryController = require('../controller/inventoryController');
const InventoryRouterSchemas = require('../schemas/inventoryExternalRouterSchemas');

class InventoryRouter {

    constructor(Utils, DB, Middlewares) {

        const { AuthMiddleware, SchemaValidationMiddleware } = Middlewares;

        this.router = Express.Router();
        this.schemaValidationMiddleware = SchemaValidationMiddleware;
        this.authMiddleware = AuthMiddleware;

        this.schemas = InventoryRouterSchemas;
        this.controller = new InventoryController(Utils, DB);

        this._getAllCategories();
        this._verifyProducts();
    }

    _getAllCategories() {

        this.router.get(
            '/getAllCategories',
            (req, res, next) => this.authMiddleware.isInternalApiRequest(req, res, next),
            (req, res) => this.controller.getAllCategories(req, res)
        );
    }

    _verifyProducts() {

        this.router.post(
            '/verifyProducts',
            [
                (req, res, next) => this.authMiddleware.isInternalApiRequest(req, res, next),
                (req, res, next) => this.schemaValidationMiddleware(this.schemas.verifyProducts, 'body')(req, res, next)
            ],
            (req, res) => this.controller.verifyProducts(req, res)
        );
    }
}

module.exports = InventoryRouter;