const Moment = require('moment');

class WebsitesMapper {

    constructor(CommonMapper) {

        this.commonMapper = CommonMapper;
    }

    static insWebsite(website) {

        return {
            name: this.commonMapper.toString(website?.name),
            url: this.commonMapper.toString(website?.url),
            updatedAt: Moment().toDate()
        };
    }

    static updWebsite(website) {

        return {
            id: this.commonMapper.toInt(website?.id),
            name: this.commonMapper.toString(website?.name),
            url: this.commonMapper.toString(website?.url),
            updatedAt: Moment().toDate()
        };
    }
}

module.exports = WebsitesMapper;