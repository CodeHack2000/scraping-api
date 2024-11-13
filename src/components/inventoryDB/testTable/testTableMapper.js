const Moment = require('moment');

class TestTableMapper {

    constructor(CommonMapper) {

        this.commonMapper = CommonMapper;
    }

    insTestTable(test) {

        return {
            name: this.commonMapper.toString(test?.name),
            year: this.commonMapper.toString(test?.year),
            wins: this.commonMapper.toString(test?.wins),
            updatedAt: Moment().toDate()
        };
    }
}

module.exports = TestTableMapper;
