const Express = require('express');

const TorInstancesComponent = require('@tor');
const UtilsComponent = require('@utils');
const FarmaciaSantaMartaComponent = require('@farmaciasantamarta');
const WorkerPoolComponent = require('@workerPool');
const TaskQueueComponent = require('@taskQueue');
const TestWebsiteComponent = require('@testwebsite');

// Load aliases
require('module-alias/register');

const ErrorHandler = require('@shared/middlewares/errorHandlerMiddleware');

const app = Express();

const utils = new UtilsComponent();
const torInstances = new TorInstancesComponent(utils.logger);
const workerPool = new WorkerPoolComponent(utils.logger, torInstances);
const taskQueue = new TaskQueueComponent(utils.logger, workerPool);
const farmaciaSantaMarta = new FarmaciaSantaMartaComponent(utils.logger, torInstances, taskQueue);
const testWebsite = new TestWebsiteComponent(utils.logger, torInstances, taskQueue);

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

app.use('/farmaciasantamarta', farmaciaSantaMarta.router);
app.use('/testwebsite', testWebsite.router);

module.exports = app;
