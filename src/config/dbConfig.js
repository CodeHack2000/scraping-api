const Path = require('path');
require('dotenv').config({ path: Path.resolve(__dirname, '../../.env') });

module.exports = {
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    schema: process.env.DB_SCHEMA,
    migrationTable: process.env.DB_MIGRATION_TABLE,
};
