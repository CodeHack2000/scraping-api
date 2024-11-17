class GlobalMapper {

    /**
     * Maps a category from Farmacia Saude to a category for the local database.
     * @param {string} category - Category from Farmacia Saude.
     * @returns {string} The mapped category for the local database.
     */
    static mapCategoryToDB(category = '') {

        let mappedCategory = '';

        if (['bebe-crianca', 'mama'].includes(category)) {

            mappedCategory = 'Mamã e Bebé';
        }
        else if (category.includes('cabelo')) {

            mappedCategory = 'Cabelo';
        }
        else if (category.includes('rosto')) {

            mappedCategory = 'Rosto';
        }
        else if (category.includes('corpo')) {

            mappedCategory = 'Corpo';
        }
        else if (category.includes('saude-animal')) {

            mappedCategory = 'Animal';
        }
        else if (category.includes('solares')) {

            mappedCategory = 'Solares';
        }
        else if (['saude', 'medicamentos', 'suplementos', 'nutricao'].includes(category)) {

            mappedCategory = 'Saúde e Bem-Estar';
        }
        else if (category.includes('higiene-oral')) {

            mappedCategory = 'Saúde Oral';
        }
        else if (['maquilhagem', 'sustentavel', 'homem'].includes(category)) {

            mappedCategory = 'Diversos';
        }

        return mappedCategory;
    }
}

module.exports = GlobalMapper;