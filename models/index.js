const { sequelize } = require('../config/db');
const User = require('./User');
const Profile = require('./Profile');
const QuizPreference = require('./QuizPreference');
const RefreshToken = require('./RefreshToken');
const VerificationToken = require('./VerificationToken');

// 1-to-1: User and Profile
User.hasOne(Profile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'user_id' });

// 1-to-1: User and QuizPreference
User.hasOne(QuizPreference, { foreignKey: 'user_id', onDelete: 'CASCADE' });
QuizPreference.belongsTo(User, { foreignKey: 'user_id' });

// 1-to-Many: User and RefreshTokens
User.hasMany(RefreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

// 1-to-Many: User and VerificationTokens
User.hasMany(VerificationToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
VerificationToken.belongsTo(User, { foreignKey: 'user_id' });

// Sync database function (creates tables if they don't exist)
const syncDatabase = async () => {
  try {
   
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing models:', error);
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Profile,
  QuizPreference,
  RefreshToken,
  VerificationToken
};