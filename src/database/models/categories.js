module.exports = (sequelize, DataTypes, schema) => {

    const table = sequelize.define('categories', {

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
        description: {
            type: DataTypes.TEXT
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
        tableName: 'categories',
        timestamps: false
    });

    table.associate = (models) => {

        table.hasMany(models.products, {
            foreignKey: 'categoryId'
        });
    };

    return table;
};
