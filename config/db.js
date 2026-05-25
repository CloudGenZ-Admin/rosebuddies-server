const { Sequelize } = require('sequelize');
require('dotenv').config();

// Direct MySQL Connection
const sequelize = new Sequelize(
  process.env.DB_NAME,       // 'friendship'
  process.env.DB_USER,       // 'root'
  process.env.DB_PASSWORD,   // '12345'
  {
    host: process.env.DB_HOST, // '127.0.0.1'
    dialect: 'mysql',
    logging: false, // Isey true karenge toh terminal mein SQL queries dikhengi
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database Connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the MySQL database:', error.message);
  }
};

module.exports = { sequelize, connectDB };