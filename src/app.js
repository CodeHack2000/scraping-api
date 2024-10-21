const Express = require('express');

// Load aliases
require('module-alias/register');

const ErrorHandler = require('@shared/middlewares/errorHandlerMiddleware');

const app = Express();

// Config
app.disable('x-powered-by');

// Middleware
//app.use(Cors()); // Recomendado usar apenas nas rotas que quero tornar públicas
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));

// Middlewares
// Error handler
app.use(ErrorHandler);

// Routes
app.get('/', (req, res) => {

    res.json('OK');
});

module.exports = app;
