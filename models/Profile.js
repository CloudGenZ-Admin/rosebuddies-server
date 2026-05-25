const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pronouns: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  age_range: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  onboarding_step: {
    type: DataTypes.ENUM('SIGNUP', 'QUIZ_DONE', 'PROFILE_DONE'),
    defaultValue: 'SIGNUP',
  }
}, { timestamps: true });

module.exports = Profile;