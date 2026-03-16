const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer; // keep a reference so it is not garbage collected

const connectDb = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (uri) {
      await mongoose.connect(uri);
      console.log('Connected to MongoDB');
      return;
    }

    // Fallback for local/dev when no Atlas URI is provided
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log('Connected to in-memory MongoDB (mongodb-memory-server)');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = {
  connectDb
};
