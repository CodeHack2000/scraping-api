const ServerConfig = require('@config/serverConfig');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {

    res.locals.message = err?.message;
    res.locals.error = ServerConfig?.env === 'development' ? err : {};

    console.log(err);

    res.status(err?.status || 500).send('error');
};