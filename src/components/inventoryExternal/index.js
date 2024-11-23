const InventoryRoutes = require('./routes/inventoryRouter');

class InventoryExternal {

    constructor(Utils, DB) {

        this.router = (new InventoryRoutes(Utils, DB)).router;
    }
}

module.exports = InventoryExternal;