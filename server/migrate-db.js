const mongoose = require('mongoose');
const env = require('./src/config/env');

async function migrateData() {
  try {
    await mongoose.connect(env.MONGO_URI);
    const db = mongoose.connection.db;
    
    const oldCol = db.collection('authorrequests');
    const newCol = db.collection('author_requests');
    
    const count = await oldCol.countDocuments();
    console.log(`Found ${count} requests in 'authorrequests'`);
    
    if (count > 0) {
      const data = await oldCol.find().toArray();
      await newCol.insertMany(data);
      console.log(`Migrated ${count} requests to 'author_requests'`);
      
      // OPTIONAL: Delete old collection to prevent future confusion
      // await oldCol.drop();
      // console.log("Dropped old collection 'authorrequests'");
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrateData();
