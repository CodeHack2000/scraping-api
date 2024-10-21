module.exports = (sequelize, DataTypes, schema) => {

    const table = sequelize.define('websites', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: false
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
        tableName: 'websites',
        timestamps: false
    });

    table.associate = (models) => {

        table.hasMany(models.prices, {
            foreignKey: 'websiteId'
        });
    };

    return table;
};
