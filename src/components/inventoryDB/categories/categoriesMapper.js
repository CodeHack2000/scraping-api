const Moment = require('moment');

class CategoriesMapper {

    constructor(CommonMapper) {

        this.commonMapper = CommonMapper;
    }

    insCategory(category) {

        return {
            name: this.commonMapper.toString(category?.name),
            description: this.commonMapper.toString(category?.description),
            updatedAt: Moment().toDate(),
            createdAt: Moment().toDate()
        };
    }

    updCategory(category) {

        return {
            id: this.commonMapper.toInt(category?.id),
            name: this.commonMapper.toString(category?.name),
            description: this.commonMapper.toString(category?.description),
            updatedAt: Moment().toDate()
        };
    }
}

module.exports = CategoriesMapper;
