require('dotenv').config({ path: '@env' });

module.exports = {
    urlBase: process.env.FARMACIASANTAMARTA_URL_BASE,
    responseTimeClassification: process.env.FARMACIASANTAMARTA_RESPONSE_TIME_CLASSIFICATION,
    nCategories: process.env.FARMACIASANTAMARTA_N_CATEGORIES,
    categories: Array.from({ length: process.env.FARMACIASANTAMARTA_N_CATEGORIES }, (_, i) => ({

        url: process.env[`FARMACIASANTAMARTA_CATEGORY_${i + 1}_URL`],
    }))
};