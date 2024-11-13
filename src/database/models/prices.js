module.exports = (sequelize, DataTypes, schema) => {

    const table = sequelize.define('prices', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        productId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'products',
                key: 'id'
            }
        },
        websiteId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'websites',
                key: 'id'
            }
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false
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
        tableName: 'prices',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['productId', 'websiteId']
            }
        ]
    });

    table.associate = (models) => {

        table.belongsTo(models.products, {
            foreignKey: 'productId'
        });

        table.belongsTo(models.websites, {
            foreignKey: 'websiteId'
        });
    };

    return table;
};
