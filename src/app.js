const Express = require('express');

const TorInstancesComponent = require('@tor');
const UtilsComponent = require('@utils');
const FarmaciaSantaMartaComponent = require('@farmaciasantamarta');
const WorkerPoolComponent = require('@workerPool');
const TaskQueueComponent = require('@taskQueue');
const TestWebsiteComponent = require('@testwebsite');
const InventoryDBComponent = require('@inventoryDB');

// Load aliases
require('module-alias/register');

const ErrorHandler = require('@shared/middlewares/errorHandlerMiddleware');

const app = Express();

// Utils
const utils = new UtilsComponent();

// Utils pack
const _utils = {
    Logger: utils.logger
};

// Tools
const torInstances = new TorInstancesComponent(utils.logger);
const workerPool = new WorkerPoolComponent(utils.logger, torInstances);
const taskQueue = new TaskQueueComponent(utils.logger, workerPool);

// Tools pack
const _tools = {
    TorInstances: torInstances,
    TaskQueue: taskQueue
};

// DB
const inventoryDB = new InventoryDBComponent({ ..._utils, CommonMapper: utils.commonMapper });

// DB pack
const _db = {
    InventoryDB: inventoryDB
};

const farmaciaSantaMarta = new FarmaciaSantaMartaComponent(_utils, _tools, _db);
const testWebsite = new TestWebsiteComponent(_utils, _tools, _db);

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
