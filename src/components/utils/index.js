const Logger = require('./logger');
const CommonMapper = require('./mapper/commonMapper');

class Utils {

    constructor() {

        this.logger = Logger;
        this.commonMapper = CommonMapper;
    }
}

module.exports = Utils;