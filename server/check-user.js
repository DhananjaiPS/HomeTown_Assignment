const mongoose = require('mongoose');
const User = require('./src/models/User');
const env = require('./src/config/env');

async function checkUser() {
  try {
    await mongoose.connect(env.MONGO_URI);
    const user = await User.findById("69f1168588c58fe16e8258bd");
    console.log('User found:', user ? user.name : 'NOT FOUND');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUser();
