const InventoryRoutes = require('./routes/inventoryRouter');

class InventoryExternal {

    constructor(Utils, DB, Middlewares) {

        this.router = (new InventoryRoutes(Utils, DB, Middlewares)).router;
    }
}

module.exports = InventoryExternal;