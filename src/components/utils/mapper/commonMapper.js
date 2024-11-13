class CommonMapper {

    /**
     * Converts the given value to a string. If the value is an object, null is returned.
     * If the value is null or undefined, an empty string is returned. Otherwise, the value is converted to a string with the String() function.
     *
     * @param {any} value The value to convert to a string
     *
     * @return {string} The string value
     */
    static toString(value, defaultValue = '') {

        let result;

        if (typeof value === 'object') {

            result = null;
        }
        else if (!value) {

            result = defaultValue;
        }
        else {

            result = String(value);
        }

        return result;
    }

    /**
     * Converts the given value to an integer. If the value is an object, null is returned.
     * If the value is null or undefined, the default value is returned. Otherwise, the value is
     * converted to an integer with the parseInt() function.
     *
     * @param {any} value The value to convert to an integer
     * @param {int} [defaultValue=null] The default value to return if the value is null or undefined
     *
     * @return {int} The integer value
     */
    static toInt(value, defaultValue = null) {

        let result;

        if (typeof value === 'object') {

            result = null;
        }
        else if (!value) {

            result = defaultValue;
        }
        else {

            result = parseInt(value);
        }

        return result;
    }

    /**
     * Converts the given value to a float. If the value is an object, null is returned.
     * If the value is null or undefined, the default value is returned. Otherwise, the value is
     * converted to a float with the parseFloat() function.
     *
     * @param {any} value The value to convert to a float
     * @param {float} [defaultValue=0.0] The default value to return if the value is null or undefined
     *
     * @return {float} The float value
     */
    static toFloat(value, defaultValue = 0.0) {

        let result;

        if (typeof value === 'object') {

            result = null;
        }
        else if (!value) {

            result = defaultValue;
        }
        else {

            result = parseFloat(value);
        }

        return result;
    }

    static toBoolean(value, defaultValue = null) {

        let result;

        if (typeof value === 'object') {

            result = null;
        }
        else if (!value) {

            result = defaultValue;
        }
        else if (
            ('S', 'Sim', 'Y', 'Yes', 'True', '1')
                .toUpperCase()
                .includes(
                    value
                        .toUpperCase()
                        .trim()
                )
        ) {

            result = true;
        }
        else if (
            ('N', 'Não', 'No', 'False', '0')
                .toUpperCase()
                .includes(
                    value
                        .toUpperCase()
                        .trim()
                )
        ) {

            result = false;
        }

        return result;
    }
    
    /**
     * Fill empty properties in the targetObject with the values from the sourceObject
     *
     * @param {Object} targetObject The object that will be filled with properties
     * @param {Object} sourceObject The object that contains the values to fill the targetObject
     *
     * @return {Object} The targetObject with the filled properties
     */
    static fillEmptyProperties(targetObject, sourceObject) {

        const resultObject = { ...targetObject };

        Object.entries(sourceObject).forEach(([key, value]) => {
                       
            if (!resultObject[key]) {

                resultObject[key] = value;
            }
        });

        return resultObject;
    }
}

module.exports = CommonMapper;