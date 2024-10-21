const Path = require('path');
require('dotenv').config({ path: Path.resolve(__dirname, '../../.env') });

module.exports = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    //sessionSecret: process.env.SESSION_SECRET,
    host: process.env.HOST,
    appName: process.env.APP_NAME,
};
