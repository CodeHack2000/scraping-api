class GlobalMapper {

    /**
     * Maps a category from Farmacia Santa Marta to a category for the local database.
     * @param {string} category - Category from Farmacia Santa Marta.
     * @returns {string} The mapped category for the local database.
     */
    static mapCategoryToDB(category = '') {

        let mappedCategory = '';

        if (category.includes('mama-e-bebe')) {

            mappedCategory = 'Mamã e Bebé';
        }
        else if (category.includes('rosto')) {

            mappedCategory = 'Rosto';
        }
        else if (category.includes('cabelo')) {

            mappedCategory = 'Cabelo';
        }
        else if (category.includes('corpo')) {

            mappedCategory = 'Corpo';
        }
        else if (category.includes('solares')) {

            mappedCategory = 'Solares';
        }
        else if (['medicamentos', 'emagrecimento', 'suplementos', 'ortopedia'].includes(category)) {

            mappedCategory = 'Saúde e Bem-Estar';
        }
        else if (category.includes('sexualidade')) {

            mappedCategory = 'Sexualidade';
        }

        return mappedCategory;
    }
}

module.exports = GlobalMapper;