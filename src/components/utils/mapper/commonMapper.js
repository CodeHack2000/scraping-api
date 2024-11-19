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

        if (value === null || value === undefined) {

            result = defaultValue;
        }
        else if (typeof value === 'object' || typeof value === 'function') {

            result = null;
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

        if (value === null || value === undefined) {
            
            result = defaultValue;
        }
        else if (typeof value === 'object' || typeof value === 'function') {

            result = null;
        }
        else if (typeof value === 'boolean') {

            result = value ? 1 : 0;
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

        if (value === null || value === undefined) {
            
            result = defaultValue;
        }
        else if (typeof value === 'object' || typeof value === 'function' || typeof value === 'boolean') {

            result = null;
        }
        else {

            result = parseFloat(value);
        }

        return result;
    }

    static toBoolean(value, defaultValue = null) {

        let result;

        if (typeof value === 'boolean') {

            result = value;
        }
        else if (value === null || value === undefined) {
            
            result = defaultValue;
        }
        else if (typeof value === 'object' || typeof value === 'function') {

            result = null;
        }
        else if (
            typeof value === 'string'
            && ['S', 'SIM', 'Y', 'YES', 'TRUE', '1']
                .includes(
                    value
                        ?.toUpperCase()
                        ?.trim()
                )
        ) {

            result = true;
        }
        else if (
            typeof value === 'string'
            && ['N', 'NÃO', 'NAO', 'NO', 'FALSE', '0']
                .includes(
                    value
                        ?.toUpperCase()
                        ?.trim()
                )
        ) {

            result = false;
        }
        else if (value === 1) {

            result = true;
        }
        else if (value === 0) {

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