const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: { // Hashed
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: { // 'user', 'admin', 'guest'
        type: DataTypes.STRING,
        defaultValue: 'user',
    },
    email: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    avatar: { type: DataTypes.STRING },
    settings: {
        type: DataTypes.JSON, // Stores theme, wallpaper, etc.
        defaultValue: {
            theme: 'dark',
            wallpaper: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop",
            volume: 80,
            wifi: true,
            brightness: 100
        }
    }
});

module.exports = User;
