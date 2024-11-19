/* eslint-disable no-undef */

const CommonMapper = require('../../mapper/commonMapper');

describe('CommonMapper', () => {

    describe('toString', () => {

        it('should convert object to string', () => {

            const result = CommonMapper.toString({});

            expect(result).toBeNull();
        });

        it('should convert null to empty string', () => {

            const result = CommonMapper.toString(null);

            expect(result).toEqual('');
        });

        it('should convert undefined to empty string', () => {

            const result = CommonMapper.toString(undefined);

            expect(result).toEqual('');
        });

        it('should convert string to string', () => {

            const result = CommonMapper.toString('test');

            expect(result).toEqual('test');
        });

        it('should convert number to string', () => {

            const result = CommonMapper.toString(1);

            expect(result).toEqual('1');
        });

        it('should convert boolean to string', () => {

            const result = CommonMapper.toString(true);

            expect(result).toEqual('true');
        });

        it('should convert array to string', () => {

            const result = CommonMapper.toString([1, 2, 3]);

            expect(result).toBeNull();
        });

        it('should convert function to string', () => {

            const result = CommonMapper.toString(() => {});

            expect(result).toBeNull();
        });

        it('should return default value if not specified', () => {

            const result = CommonMapper.toString(null, 'default');

            expect(result).toEqual('default');
        });
    });

    describe('toInt', () => {

        it('should convert string to int', () => {

            const result = CommonMapper.toInt('1');

            expect(result).toEqual(1);
        });

        it('should convert number to int', () => {

            const result = CommonMapper.toInt(1.5);

            expect(result).toEqual(1);
        });

        it('should convert boolean to int', () => {

            const result = CommonMapper.toInt(true);

            expect(result).toEqual(1);
        });

        it('should convert object to null', () => {

            const result = CommonMapper.toInt({});

            expect(result).toEqual(null);
        });

        it('should convert null to default value', () => {

            const result = CommonMapper.toInt(null, 5);

            expect(result).toEqual(5);
        });

        it('should convert undefined to default value', () => {

            const result = CommonMapper.toInt(undefined, 5);

            expect(result).toEqual(5);
        });
    });

    describe('toFloat', () => {

        it('should convert string to float', () => {

            const result = CommonMapper.toFloat('1.5');

            expect(result).toEqual(1.5);
        });

        it('should convert number to float', () => {

            const result = CommonMapper.toFloat(1);

            expect(result).toEqual(1);
        });

        it('should convert boolean to float', () => {

            const result = CommonMapper.toFloat(true);

            expect(result).toBeNull();
        });

        it('should convert object to null', () => {

            const result = CommonMapper.toFloat({});

            expect(result).toEqual(null);
        });

        it('should convert null to default value', () => {

            const result = CommonMapper.toFloat(null, 5.5);

            expect(result).toEqual(5.5);
        });

        it('should convert undefined to default value', () => {

            const result = CommonMapper.toFloat(undefined, 5.5);

            expect(result).toEqual(5.5);
        });
    });

    describe('toBoolean', () => {

        it('should convert string to boolean', () => {

            const result = CommonMapper.toBoolean('true');

            expect(result).toEqual(true);
        });

        it('should convert number to boolean', () => {

            const result = CommonMapper.toBoolean(1);

            expect(result).toEqual(true);
        });

        it('should convert boolean to boolean', () => {

            const result = CommonMapper.toBoolean(true);

            expect(result).toEqual(true);
        });

        it('should convert object to null', () => {

            const result = CommonMapper.toBoolean({});

            expect(result).toEqual(null);
        });

        it('should convert null to default value', () => {

            const result = CommonMapper.toBoolean(null, false);

            expect(result).toEqual(false);
        });

        it('should convert undefined to default value', () => {

            const result = CommonMapper.toBoolean(undefined, false);

            expect(result).toEqual(false);
        });
    });

    describe('fillEmptyProperties', () => {

        it('should fill empty properties in the targetObject with the values from the sourceObject', () => {

            const targetObject = {
                a: '',
                b: null,
                c: undefined
            };

            const sourceObject = {
                a: 'test',
                b: 1,
                c: true
            };

            const result = CommonMapper.fillEmptyProperties(targetObject, sourceObject);

            expect(result).toEqual({
                a: 'test',
                b: 1,
                c: true
            });
        });
    });
});
