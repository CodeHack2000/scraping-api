const Moment = require('moment');

class PricesMapper {

    constructor(CommonMapper) {

        this.commonMapper = CommonMapper;
    }

    insPrice(price) {

        return {
            productId: this.commonMapper.toString(price?.productId, null),
            websiteId: this.commonMapper.toString(price?.websiteId, null),
            price: this.commonMapper.toString(price?.price),
            url: this.commonMapper.toString(price?.url),
            updatedAt: Moment().toDate()
        };
    }

    updPrice(price) {

        return {
            id: this.commonMapper.toInt(price?.id),
            productId: this.commonMapper.toInt(price?.productId),
            websiteId: this.commonMapper.toString(price?.websiteId),
            price: this.commonMapper.toString(price?.price),
            url: this.commonMapper.toString(price?.url),
            updatedAt: Moment().toDate()
        };
    }
}

module.exports = PricesMapper;

