require('dotenv').config({ path: '@env' });

module.exports = {
    urlBase: process.env.AFARMACIAONLINE_URL_BASE,
    responseTimeClassification: process.env.AFARMACIAONLINE_RESPONSE_TIME_CLASSIFICATION,
    nCategories: process.env.AFARMACIAONLINE_N_CATEGORIES,
    categories: Array.from({ length: process.env.AFARMACIAONLINE_N_CATEGORIES }, (_, i) => ({

        url: process.env[`AFARMACIAONLINE_CATEGORY_${i + 1}_URL`],
    }))
};