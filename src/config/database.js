const mongoose = require('mongoose');

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nnptudm-day5';
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB: ${mongoUri}`);
}

module.exports = connectDatabase;
