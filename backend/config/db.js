const mongoose = require('mongoose');

const connectDb = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Please configure it in backend/.env');
    process.exit(1);
  }

  const dbName = process.env.MONGODB_DB_NAME;
  if (!dbName) {
    console.error('MONGODB_DB_NAME is not set. Please add the database name in backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName });
    console.log(`Connected to MongoDB Atlas — database: ${dbName}`);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = {
  connectDb
};
