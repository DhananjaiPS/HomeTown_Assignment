const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a name'] },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  passwordHash: { type: String, required: [true, 'Please add a password'], select: false },
  role: { type: String, enum: ['learner', 'admin'], default: 'learner' },
  profile: {
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' }
  },
  stats: {
    totalScore: { type: Number, default: 0 },
    totalMaxScore: { type: Number, default: 0 },
    assignmentsAttempted: { type: Number, default: 0 },
    articlesCompleted: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    aiTokensUsed: { type: Number, default: 0 },
    aiTokensLimit: { type: Number, default: function() { return this.role === 'admin' ? 100000 : 10000; } }
  },
  badges: [{
    name: { type: String },
    awardedAt: { type: Date, default: Date.now }
  }],
  lastActiveAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Indexes (email is already indexed via unique: true)

module.exports = mongoose.model('User', userSchema);
