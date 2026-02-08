const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Association

const File = sequelize.define('File', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    originalName: { type: DataTypes.STRING }, // Local display name
    path: { type: DataTypes.STRING, allowNull: false }, // Virtual path: /storage/admin/Doc.txt
    physicalPath: { type: DataTypes.STRING }, // On-disk path
    type: { type: DataTypes.STRING }, // MIME type
    size: { type: DataTypes.INTEGER }, // Bytes
    category: { type: DataTypes.STRING }, // Images, Videos, etc.
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }, // Soft delete (Trash Bin)
    deletedAt: { type: DataTypes.DATE },
    ownerId: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    }
});

// Relationships
User.hasMany(File, { foreignKey: 'ownerId' });
File.belongsTo(User, { foreignKey: 'ownerId' });

module.exports = File;
