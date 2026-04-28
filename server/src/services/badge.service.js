const User = require('../models/User');

class BadgeService {
  async awardBadges(userId, stats, submission) {
    const user = await User.findById(userId);
    if (!user) return;

    const currentBadges = user.badges.map(b => b.name);
    const newBadges = [];

    // First Submission
    if (stats.assignmentsAttempted === 1 && !currentBadges.includes('First Submission')) {
      newBadges.push({ name: 'First Submission' });
    }

    // 5 Assignments Completed
    if (stats.assignmentsAttempted >= 5 && !currentBadges.includes('5 Assignments Completed')) {
      newBadges.push({ name: '5 Assignments Completed' });
    }

    // 90%+ Scorer
    if (submission && submission.percentage >= 90 && !currentBadges.includes('90%+ Scorer')) {
      newBadges.push({ name: '90%+ Scorer' });
    }

    // Consistency Streak (Assuming streak logic is updated elsewhere, we check here)
    if (stats.currentStreak >= 3 && !currentBadges.includes('Consistency Streak')) {
      newBadges.push({ name: 'Consistency Streak' });
    }

    // Article Finisher
    if (stats.articlesCompleted >= 5 && !currentBadges.includes('Article Finisher')) {
      newBadges.push({ name: 'Article Finisher' });
    }

    if (newBadges.length > 0) {
      user.badges.push(...newBadges);
      await user.save();
      
      const Activity = require('../models/Activity');
      const activities = newBadges.map(b => ({
        userId,
        type: 'badge_earned',
        title: `Earned Badge: ${b.name}`,
        description: `Congratulations! You earned the ${b.name} badge.`
      }));
      await Activity.insertMany(activities);
    }
  }
}

module.exports = new BadgeService();
