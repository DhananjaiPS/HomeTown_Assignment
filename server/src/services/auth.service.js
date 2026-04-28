const User = require('../models/User');
const generateToken = require('../utils/generateToken');

class AuthService {
  async signup(name, email, password) {
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error('User already exists');
    }

    const user = await User.create({ name, email, passwordHash: password });

    const token = generateToken(user._id);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        stats: user.stats
      },
      token
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    user.lastActiveAt = Date.now();
    await user.save();

    const token = generateToken(user._id);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        stats: user.stats
      },
      token
    };
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateMe(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.bio !== undefined) user.profile.bio = updateData.bio;
    if (updateData.avatar !== undefined) user.profile.avatar = updateData.avatar;

    await user.save();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      stats: user.stats
    };
  }
}

module.exports = new AuthService();
