const mongoose = require('mongoose');
const AuthorRequest = require('./src/models/AuthorRequest');
const env = require('./src/config/env');

async function checkDB() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to DB');
    
    const count = await AuthorRequest.countDocuments();
    console.log('Total Author Requests in DB:', count);
    
    const all = await AuthorRequest.find();
    console.log('Requests:', JSON.stringify(all, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDB();
