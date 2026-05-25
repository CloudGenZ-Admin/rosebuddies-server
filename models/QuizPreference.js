const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const QuizPreference = sequelize.define('QuizPreference', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  location_data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  personality: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  friendship_goals: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  availability: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, { timestamps: true });

module.exports = QuizPreference;