require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Submission = require('./src/models/Submission');
const env = require('./src/config/env');

const fixStreaks = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    
    for (const user of users) {
      const submissions = await Submission.find({ userId: user._id }).sort({ createdAt: 1 });
      
      if (submissions.length === 0) {
        user.stats.currentStreak = 0;
        user.stats.longestStreak = 0;
        user.stats.lastSubmissionAt = null;
        user.markModified('stats');
        await user.save();
        console.log(`User ${user.email}: No submissions, streak reset to 0.`);
        continue;
      }

      let currentStreak = 0;
      let longestStreak = 0;
      let lastSubDate = null;

      for (const sub of submissions) {
        const subDate = new Date(sub.createdAt);
        subDate.setHours(0, 0, 0, 0);

        if (!lastSubDate) {
          currentStreak = 1;
          longestStreak = 1;
        } else {
          const diffTime = subDate.getTime() - lastSubDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak += 1;
            if (currentStreak > longestStreak) longestStreak = currentStreak;
          } else if (diffDays > 1) {
            currentStreak = 1;
          }
        }
        lastSubDate = new Date(subDate); // clone it
      }

      // Check if current streak is broken today
      if (lastSubDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - lastSubDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
            // They haven't submitted yesterday or today, so the streak is dead
            currentStreak = 0;
        }
      }

      const absoluteLastSub = submissions[submissions.length - 1].createdAt;

      user.stats.currentStreak = currentStreak;
      user.stats.longestStreak = Math.max(longestStreak, user.stats.longestStreak || 0);
      user.stats.lastSubmissionAt = absoluteLastSub;
      user.markModified('stats');
      
      await user.save();
      console.log(`User ${user.email}: current=${currentStreak}, longest=${user.stats.longestStreak}`);
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixStreaks();
