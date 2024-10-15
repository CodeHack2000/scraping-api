'use strict';

const Fs = require('fs');
const Path = require('path');
const Sequelize = require('sequelize');


const ServerConfig = require('@config/serverConfig');
const DbConfig = require('@config/dbConfig');

const env = ServerConfig.env;
const config = require(__dirname + '/../config/config.json')[env];
const basename = Path.basename(__filename);
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

Fs
    .readdirSync(__dirname)
    .filter(file => {
        return (

            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1
        );
    })
    .forEach(file => {

        const model = require(Path.join(__dirname, file))(sequelize, Sequelize.DataTypes, DbConfig.schema);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {

    if (db[modelName].associate) {

        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
