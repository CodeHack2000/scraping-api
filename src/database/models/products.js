module.exports = (sequelize, DataTypes, schema) => {

    const table = sequelize.define('products', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        categoryId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'categories',
                key: 'id'
            }
        },
        description: {
            type: DataTypes.TEXT
        },
        msrm: {
            type: DataTypes.BOOLEAN
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
        tableName: 'products',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['name', 'categoryId']
            }
        ]
    });

    table.associate = (models) => {

        table.belongsTo(models.categories, {
            foreignKey: 'categoryId'
        });
    };

    return table;
};
