const Moment = require('moment');

class PricesMapper {

    constructor(CommonMapper) {

        this.commonMapper = CommonMapper;
    }

    static insPrice(price) {

        return {
            productId: this.commonMapper.toInt(price?.productId),
            websiteId: this.commonMapper.toString(price?.websiteId),
            price: this.commonMapper.toFloat(price?.price),
            url: this.commonMapper.toString(price?.url),
            updatedAt: Moment().toDate()
        };
    }

    static updPrice(price) {

        return {
            id: this.commonMapper.toInt(price?.id),
            productId: this.commonMapper.toInt(price?.productId),
            websiteId: this.commonMapper.toString(price?.websiteId),
            price: this.commonMapper.toFloat(price?.price),
            url: this.commonMapper.toString(price?.url),
            updatedAt: Moment().toDate()
        };
    }
}

module.exports = PricesMapper;

