const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true, // Google login users ke paas phone nahi hoga shuru mein
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true, // Null for Google Auth
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  auth_provider: {
    type: DataTypes.ENUM('LOCAL', 'GOOGLE'),
    defaultValue: 'LOCAL',
  },
  role: {
    type: DataTypes.ENUM('MEMBER', 'ADMIN'),
    defaultValue: 'MEMBER',
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'BANNED', 'DELETED'),
    defaultValue: 'ACTIVE',
  },
   is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  timestamps: true, // adds created_at and updated_at automatically
});

module.exports = User;