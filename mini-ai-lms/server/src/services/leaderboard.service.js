const Submission = require('../models/Submission');

class LeaderboardService {
  async getLeaderboard(query) {
    const { page, limit, skip } = require('../utils/pagination').getPagination(query);

    // Leaderboard logic using aggregation:
    // Best percentage per assignment per user, then aggregate.
    
    const pipeline = [
      // Sort submissions by percentage descending to get best first
      { $sort: { percentage: -1 } },
      
      // Group by user and assignment to get best submission per assignment
      {
        $group: {
          _id: { userId: "$userId", assignmentId: "$assignmentId" },
          bestPercentage: { $first: "$percentage" },
          userId: { $first: "$userId" }
        }
      },
      
      // Group by user to calculate average best percentage and assignments attempted
      {
        $group: {
          _id: "$userId",
          assignmentsAttempted: { $sum: 1 },
          avgBestPercentage: { $avg: "$bestPercentage" }
        }
      },
      
      // Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      { $match: { "user.role": "learner" } }, // only learners on leaderboard
      
      // Calculate final rank score (formula from prompt: 0.7 * score + 0.3 * completionRate)
      // Assuming completionRate = (assignmentsAttempted / totalAssignments) * 100
      // We need total active assignments for exact rate, let's look it up or approximate.
      // For simplicity here, let's use user.stats.articlesCompleted as a proxy for completion factor or lookup Assignments.
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
      
      // Sort by finalRankScore
      { $sort: { finalRankScore: -1 } },
      
      // Project necessary fields
      {
        $project: {
          _id: 1,
          userId: "$_id",
          name: "$user.name",
          avatar: "$user.profile.avatar",
          avgBestPercentage: 1,
          completionRate: 1,
          assignmentsAttempted: 1,
          finalRankScore: 1,
          badges: "$user.badges"
        }
      }
    ];

    const data = await Submission.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit }
    ]);

    // Count total distinct users for pagination
    const totalPipeline = [
        { $group: { _id: "$userId" } },
        { $count: "total" }
    ];
    const totalRes = await Submission.aggregate(totalPipeline);
    const total = totalRes[0] ? totalRes[0].total : 0;

    return { leaderboard: data, total, page, pages: Math.ceil(total / limit) };
  }
}

module.exports = new LeaderboardService();
