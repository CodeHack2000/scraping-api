require('dotenv').config({ path: '@env' });

module.exports = {
    urlBase: process.env.FARMACIASAUDE_URL_BASE,
    responseTimeClassification: process.env.FARMACIASAUDE_RESPONSE_TIME_CLASSIFICATION,
    nCategories: process.env.FARMACIASAUDE_N_CATEGORIES,
    categories: Array.from({ length: process.env.FARMACIASAUDE_N_CATEGORIES }, (_, i) => ({

        url: process.env[`FARMACIASAUDE_CATEGORY_${i + 1}_URL`],
    }))
};