require('dotenv').config();
const rawEnv = process.env.NODE_ENV || 'development';
const MODE = rawEnv.trim().toLowerCase(); 

global.isDev = (MODE === 'development');

console.log(`\n=========================================`);
console.log(`🚀 STARTING  BACKEND`);
console.log(`🌍 ENVIRONMENT: [${MODE.toUpperCase()}]`);

if (global.isDev) {
  console.log(`⚠️  TESTING MODE ON`);
} else {
  console.log(`🔒 PRODUCTION MODE ON`);
}
console.log(`=========================================\n`);

// ==========================================
// 📦 MODULE IMPORTS & APP SETUP
// ==========================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const {syncDatabase} = require('./models/index.js'); // Import syncDatabase from models/index.js
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send(`Mosaic API is running smoothly in ${MODE} mode! 🚀`);
});

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  await connectDB();
  await syncDatabase(); 
  
  app.listen(PORT, () => {
    console.log(`✅ Server is listening on Port ${PORT}\n`);
  });
};

startServer();