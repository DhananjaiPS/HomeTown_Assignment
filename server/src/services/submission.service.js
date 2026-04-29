const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Activity = require('../models/Activity');
const aiService = require('./ai.service');
const badgeService = require('./badge.service');
const { getIO } = require('../sockets/socket');

class SubmissionService {
  async submitAssignment(userId, data) {
    const { articleId, assignmentId, answers, timeTakenSeconds } = data;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || assignment.status !== 'active') {
      throw new Error('Assignment not found or inactive');
    }

    // Check max attempts
    const previousAttempts = await Submission.countDocuments({ userId, assignmentId });
    if (assignment.maxAttempts && previousAttempts >= assignment.maxAttempts) {
      throw new Error('Max attempts reached');
    }

    const attemptNo = previousAttempts + 1;
    let totalScore = 0;
    let totalMaxScore = assignment.totalMarks;
    let evaluatedAnswers = [];
    let hasFailedAI = false;

    for (const q of assignment.questions) {
      const userAnswerObj = answers.find(a => a.questionId.toString() === q._id.toString());
      const baseAnswer = {
        questionId: q._id,
        type: q.type,
        maxMarks: q.marks,
        userAnswer: userAnswerObj?.userAnswer,
        selectedOption: userAnswerObj?.selectedOption
      };

      if (q.type === 'mcq' || q.type === 'true_false') {
        const correctOpt = q.options.find(opt => opt.isCorrect);
        const isCorrect = correctOpt && userAnswerObj?.selectedOption === correctOpt.label;
        const marksAwarded = isCorrect ? q.marks : 0;
        totalScore += marksAwarded;
        evaluatedAnswers.push({ ...baseAnswer, isCorrect, marksAwarded });
      } else if (q.type === 'msq') {
        const correctLabels = q.options.filter(opt => opt.isCorrect).map(opt => opt.label);
        const userSelections = userAnswerObj?.selectedOptions || [];
        
        // Strict grading: Exact match required
        const isCorrect = 
          correctLabels.length > 0 &&
          userSelections.length === correctLabels.length && 
          userSelections.every(val => correctLabels.includes(val));
          
        const marksAwarded = isCorrect ? q.marks : 0;
        totalScore += marksAwarded;
        evaluatedAnswers.push({ ...baseAnswer, isCorrect, marksAwarded, selectedOptions: userSelections });
      } else if (q.type === 'short_answer') {
        if (!userAnswerObj?.userAnswer || userAnswerObj.userAnswer.trim() === '') {
          evaluatedAnswers.push({ ...baseAnswer, isCorrect: false, marksAwarded: 0, aiEvaluation: { score: 0, feedback: 'No answer provided', improvement: '', model: 'none' } });
          continue;
        }

        const evaluation = await aiService.evaluateShortAnswer(
          userId,
          q.questionText,
          q.expectedAnswer,
          q.rubric,
          userAnswerObj.userAnswer,
          q.marks
        );

        totalScore += evaluation.score;
        if (evaluation.feedback === "AI evaluation failed.") {
          hasFailedAI = true;
        }

        evaluatedAnswers.push({
          ...baseAnswer,
          marksAwarded: evaluation.score,
          aiEvaluation: {
            score: evaluation.score,
            feedback: evaluation.feedback,
            improvement: evaluation.improvement,
            model: aiService.hasKey ? 'gemini-1.5-pro-latest' : 'mock',
            evaluatedAt: Date.now()
          }
        });
      }
    }

    const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
    const status = hasFailedAI ? 'failed_ai_evaluation' : 'evaluated';

    const submission = await Submission.create({
      userId,
      articleId,
      assignmentId,
      attemptNo,
      answers: evaluatedAnswers,
      totalScore,
      totalMaxScore,
      percentage,
      status,
      timeTakenSeconds: timeTakenSeconds || 0
    });

    // Update denormalized user stats
    const user = await User.findById(userId);
    user.stats.assignmentsAttempted += 1;
    user.stats.totalScore += totalScore;
    user.stats.totalMaxScore += totalMaxScore;
    // Update streak logic using lastSubmissionAt and midnight boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.stats.lastSubmissionAt) {
      user.stats.currentStreak = 1;
      if (user.stats.longestStreak === 0) user.stats.longestStreak = 1;
    } else {
      const lastSub = new Date(user.stats.lastSubmissionAt);
      lastSub.setHours(0, 0, 0, 0);
      
      const diffTime = today.getTime() - lastSub.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        user.stats.currentStreak += 1;
        if (user.stats.currentStreak > user.stats.longestStreak) {
          user.stats.longestStreak = user.stats.currentStreak;
        }
      } else if (diffDays > 1) {
        user.stats.currentStreak = 1;
      }
      // If diffDays === 0 (same day), do nothing to streak
    }
    
    user.stats.lastSubmissionAt = Date.now();
    user.lastActiveAt = Date.now();
    user.markModified('stats');
    await user.save();

    await Activity.create({
      userId,
      type: 'assignment_submitted',
      title: 'Submitted Assignment',
      description: `You scored ${percentage.toFixed(2)}% on assignment ${assignment.title}.`,
      metadata: { assignmentId, score: totalScore }
    });

    await badgeService.awardBadges(userId, user.stats, submission);

    // Emit socket event for leaderboard update
    try {
      const io = getIO();
      io.emit('leaderboard:update', { userId, percentage, score: totalScore });
    } catch (err) {
      // socket not initialized during testing
    }

    return submission;
  }

  async getMySubmissions(userId, query) {
    const { page, limit, skip } = require('../utils/pagination').getPagination(query);
    const filter = { userId };
    if (query.assignmentId) filter.assignmentId = query.assignmentId;

    const submissions = await Submission.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignmentId', 'title');

    const total = await Submission.countDocuments(filter);

    return { submissions, total, page, pages: Math.ceil(total / limit) };
  }

  async getAllSubmissions(query) {
    const { page, limit, skip } = require('../utils/pagination').getPagination(query);
    
    const submissions = await Submission.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .populate('assignmentId', 'title');

    const total = await Submission.countDocuments();

    return { submissions, total, page, pages: Math.ceil(total / limit) };
  }
}

module.exports = new SubmissionService();
