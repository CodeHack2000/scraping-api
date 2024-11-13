const { test_table } = require('@models');

class TestTableDB {

    /**
     * Inserts a batch of testTable into the database.
     * @param {Array<Object>} testTableBatch - Array of testTable information to be inserted.
     * @param {Sequelize.Transaction} [transaction=null] - Transaction to be used for this operation.
     * @returns {Promise<Array<TestTable>>} The inserted testTable.
     */
    static async insTestTableBatch(testTableBatch, transaction = null) {

        return await test_table.bulkCreate(
            testTableBatch,
            {
                updateOnDuplicate: ['wins', 'updatedAt'],
                transaction
            }
        );
    }

}

module.exports = TestTableDB;
