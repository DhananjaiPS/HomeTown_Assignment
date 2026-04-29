const mongoose = require('mongoose');
const env = require('./src/config/env');

async function listCollections() {
  try {
    await mongoose.connect(env.MONGO_URI);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listCollections();
