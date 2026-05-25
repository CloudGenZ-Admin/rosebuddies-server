const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_revoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, { timestamps: true });

module.exports = RefreshToken;