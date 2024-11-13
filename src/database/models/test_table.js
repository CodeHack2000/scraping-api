module.exports = (sequelize, DataTypes, schema) => {

    const table = sequelize.define('test_table', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        year: {
            type: DataTypes.STRING
        },
        wins: {
            type: DataTypes.STRING
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE
        },
    }, { 
        schema,
        tableName: 'test_table',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['name', 'year']
            }
        ]
    });

    return table;
};
