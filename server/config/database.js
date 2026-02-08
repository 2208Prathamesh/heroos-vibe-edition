const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'), // Database file in project root
    logging: false, // Cleaner console output
});

module.exports = sequelize;
