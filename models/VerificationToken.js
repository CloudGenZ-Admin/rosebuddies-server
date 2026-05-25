const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VerificationToken = sequelize.define('VerificationToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },   // -- OTP  Store honga-- 
  type: {
    type: DataTypes.ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET'),
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, { timestamps: true });

module.exports = VerificationToken;