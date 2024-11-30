const Joi = require('joi');

exports.verifyProducts = Joi.object({
    products: Joi.array().items(Joi.string()).required()
});