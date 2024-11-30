class SharedMiddlewares {

    constructor() {

        this.errorHandlerMiddleware = require('./errorHandlerMiddleware');
        this.schemaValidationMiddleware = require('./schemaValidationMiddleware');
    }
};

module.exports = new SharedMiddlewares();