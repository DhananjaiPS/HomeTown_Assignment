const Submission = require('../models/Submission');
const User = require('../models/User');

class LeaderboardService {
  async getLeaderboard(query) {
    const { page, limit, skip } = require('../utils/pagination').getPagination(query);

    const pipeline = [
      {
        $lookup: {
          from: 'submissions',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
            { $sort: { percentage: -1 } },
            {
              $group: {
                _id: '$assignmentId',
                bestPercentage: { $first: '$percentage' }
              }
            }
          ],
          as: 'bestSubmissions'
        }
      },
      {
        $addFields: {
          assignmentsAttempted: { $size: '$bestSubmissions' },
          avgBestPercentage: {
            $cond: [
              { $gt: [{ $size: '$bestSubmissions' }, 0] },
              { $avg: '$bestSubmissions.bestPercentage' },
              0
            ]
          }
        }
      },
      {
        $lookup: {
          from: "assignments",
          pipeline: [{ $match: { status: "active" } }],
          as: "activeAssignments"
        }
      },
      {
        $addFields: {
          totalAssignments: { $size: "$activeAssignments" }
        }
      },
      {
        $addFields: {
          completionRate: {
            $cond: [
              { $gt: ["$totalAssignments", 0] },
              { $multiply: [{ $divide: ["$assignmentsAttempted", "$totalAssignments"] }, 100] },
              0
            ]
          }
        }
      },
      {
        $addFields: {
          finalRankScore: {
            $add: [
              { $multiply: ["$avgBestPercentage", 0.7] },
              { $multiply: ["$completionRate", 0.3] }
            ]
          }
        }
      },
      { $sort: { finalRankScore: -1 } },
      {
        $project: {
          _id: 1,
          userId: "$_id",
          name: 1,
          avatar: "$profile.avatar",
          avgBestPercentage: 1,
          completionRate: 1,
          assignmentsAttempted: 1,
          finalRankScore: 1,
          badges: 1,
          role: 1
        }
      }
    ];

    const data = await User.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit }
    ]);

    // Count total distinct users for pagination
    const total = await User.countDocuments();

    return { leaderboard: data, total, page, pages: Math.ceil(total / limit) };
  }
}

module.exports = new LeaderboardService();
