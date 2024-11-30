const Express = require('express');

const TorInstancesComponent = require('@tor');
const UtilsComponent = require('@utils');
const FarmaciaSantaMartaComponent = require('@farmaciasantamarta');
const FarmaciaSaudeComponent = require('@farmaciasaude');
const AFarmaciaOnlineComponent = require('@afarmaciaonline');
const InventoryExtComponent = require('@inventoryExternal');
const WorkerPoolComponent = require('@workerPool');
const TaskQueueComponent = require('@taskQueue');
const TestWebsiteComponent = require('@testwebsite');
const InventoryDBComponent = require('@inventoryDB');
const AuthComponent = require('@auth');

// Load aliases
require('module-alias/register');

const SharedMiddlewares = require('@shared/middlewares');

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

// Auth
const auth = new AuthComponent(_utils);

// Middleware pack
const _middlewares = {
    AuthMiddleware: auth.middlewares,
    SchemaValidationMiddleware: SharedMiddlewares.schemaValidationMiddleware
};

// External
const inventoryExternal = new InventoryExtComponent({ ..._utils, CommonMapper: utils.commonMapper }, _db, _middlewares);

// Internal
const farmaciaSantaMarta = new FarmaciaSantaMartaComponent(_utils, _tools, _db, _middlewares);
const farmaciaSaude = new FarmaciaSaudeComponent(_utils, _tools, _db, _middlewares);
const aFarmaciaOnline = new AFarmaciaOnlineComponent(_utils, _tools, _db, _middlewares);
const testWebsite = new TestWebsiteComponent(_utils, _tools, _db, _middlewares);

// Config
app.disable('x-powered-by');

// Middleware
//app.use(Cors()); // Recomendado usar apenas nas rotas que quero tornar públicas
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));

// Middlewares
// Error handler
app.use(SharedMiddlewares.errorHandlerMiddleware);

// Routes
app.get('/', (req, res) => {

    res.json('OK');
});

app.use('/farmaciasantamarta', farmaciaSantaMarta.router);
app.use('/farmaciasaude', farmaciaSaude.router);
app.use('/afarmaciaonline', aFarmaciaOnline.router);
app.use('/inventoryExt', inventoryExternal.router);

app.use('/testwebsite', testWebsite.router);

module.exports = app;
