class GlobalMapper {

    /**
     * Maps a category from Farmacia Santa Marta to a category for the local database.
     * @param {string} category - Category from Farmacia Santa Marta.
     * @returns {string} The mapped category for the local database.
     */
    static mapCategoryToDB(category = '') {

        let mappedCategory = '';

        if (category.includes('bebe-e-mama')) {

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
        else if (category.includes('espaco-animal')) {

            mappedCategory = 'Animal';
        }
        else if (category.includes('protecao-solar')) {

            mappedCategory = 'Solares';
        }
        else if (category.includes('saude-e-bem-estar')) {

            mappedCategory = 'Saúde e Bem Estar';
        }
        else if (category.includes('saude-oral')) {

            mappedCategory = 'Saúde Oral';
        }
        else if (category.includes('sexualidade')) {

            mappedCategory = 'Sexualidade';
        }

        return mappedCategory;
    }
}

module.exports = GlobalMapper;