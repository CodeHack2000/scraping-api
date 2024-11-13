const DB = require('@models');

const TestTableDB = require('./testTableDB');
const TestTableMapper = require('./testTableMapper');

class TestTableService {

    constructor(Utils) {

        const { Logger, CommonMapper } = Utils;

        this.logger = Logger;
        
        this.testTableMapper = new TestTableMapper(CommonMapper);
    }

    
    /**
     * Inserts a batch of testTable into the database.
     * @param {Array<Object>} testTable - Array of testTable information to be inserted.
     * @returns {Promise<Array<TestTable>>} The inserted testTable.
     */
    async insTestTableBatch(testTable) {

        this.logger.info('<TestTableService> Inserting testTable with batch...');

        const insertedValues = [];
        let transaction = null;

        try {

            this.logger.info('<TestTableService> Mapping testTable...');
            const mappedTestTable = testTable.map((test) => this.testTableMapper.insTestTable(test));

            this.logger.info('<TestTableService> Starting transaction...');
            transaction = await DB.sequelize.transaction();

            this.logger.info('<TestTableService> Inserting testTable...');
            insertedValues.push( ...await TestTableDB.insTestTableBatch(mappedTestTable, transaction) );

            this.logger.info('<TestTableService> Committing transaction...');
            await transaction.commit();
        }
        catch (error) {

            this.logger.error('<TestTableService> Error inserting testTable: ' + error.message);

            if (transaction) {

                this.logger.info('<TestTableService> Rolling back transaction...');
                await transaction.rollback();
            }
        }

        console.log(insertedValues[0].id);

        return insertedValues;
    }
}

module.exports = TestTableService;

