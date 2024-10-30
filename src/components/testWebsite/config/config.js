require('dotenv').config({ path: '@env' });

module.exports = {
    urlBase: process.env.TESTWEBSITE_URL_BASE,
    responseTimeClassification: process.env.TESTWEBSITE_RESPONSE_TIME_CLASSIFICATION,
    nCategories: process.env.TESTWEBSITE_N_CATEGORIES,
    categories: Array.from({ length: process.env.TESTWEBSITE_N_CATEGORIES }, (_, i) => ({

        url: process.env[`TESTWEBSITE_CATEGORY_${i + 1}_URL`],
    }))
};