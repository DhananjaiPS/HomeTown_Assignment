const User = require('../models/User');
const Article = require('../models/Article');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Activity = require('../models/Activity');

class DashboardService {
  async getMyDashboard(userId) {
    const user = await User.findById(userId).select('stats badges name profile');
    const recentActivity = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('metadata.articleId', 'title')
      .populate('metadata.assignmentId', 'title');

    const recentSubmissions = await Submission.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('assignmentId', 'title');

    return {
      stats: user.stats,
      badges: user.badges,
      recentActivity,
      recentSubmissions
    };
  }

  async getAdminDashboard() {
    const totalUsers = await User.countDocuments({ role: 'learner' });
    const totalArticles = await Article.countDocuments();
    const totalAssignments = await Assignment.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    const avgScoreResult = await Submission.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$percentage' } } }
    ]);
    const avgScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0;

    return {
      totalUsers,
      totalArticles,
      totalAssignments,
      totalSubmissions,
      avgScore
    };
  }
}

module.exports = new DashboardService();
