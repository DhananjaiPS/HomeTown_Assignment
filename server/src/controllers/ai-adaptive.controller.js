const User = require('../models/User');
const Submission = require('../models/Submission');
const Activity = require('../models/Activity');
const aiService = require('../services/ai.service');

// Heuristics for Career Readiness
const calculateReadiness = (submissions) => {
  const readiness = { dsa: 0, systemDesign: 0, coreSubjects: 0 };
  if (!submissions || submissions.length === 0) return readiness;

  let scoreSum = 0;
  submissions.forEach(sub => { scoreSum += sub.percentage || 0; });
  const avg = scoreSum / submissions.length;

  // Simple heuristic mapping
  readiness.dsa = Math.min(100, avg * 0.9);
  readiness.systemDesign = Math.min(100, avg * 0.8);
  readiness.coreSubjects = Math.min(100, avg * 0.95);

  return readiness;
};

// 1. Predictive Insights (Anti-Procrastination & Shadow Benchmark)
exports.getInsights = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Shadow Benchmark
    // For performance, we sample users or use pre-aggregated stats. 
    // Here we compute a simple ranking estimate based on their score.
    const userScore = user.stats.totalScore;
    const usersBelow = await User.countDocuments({ 'stats.totalScore': { $lt: userScore } });
    const totalUsers = await User.countDocuments();
    const percentile = totalUsers > 1 ? Math.round((usersBelow / (totalUsers - 1)) * 100) : 100;

    // Predictive Completion
    const pacingDays = user.stats.assignmentsAttempted > 0 ? (30 / user.stats.assignmentsAttempted) : 30;

    // Anti-procrastination nudge
    let nudge = null;
    const lastSub = user.stats.lastSubmissionAt ? new Date(user.stats.lastSubmissionAt) : null;
    if (lastSub) {
      const daysSince = Math.floor((Date.now() - lastSub.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > 2) {
        nudge = `You've been inactive for ${daysSince} days. Just a 5-minute revision can prevent a 20% memory drop!`;
      } else if (user.stats.currentStreak > 2) {
        nudge = `You're on a ${user.stats.currentStreak}-day streak! Keep the momentum going today.`;
      }
    }

    res.json({
      success: true,
      data: {
        percentile,
        estimatedCompletionDays: Math.round(pacingDays * 10), // Example logic
        nudge,
        cognitiveLoadIndex: user.stats.cognitiveLoadIndex || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Smart Quick Links (Recommendations)
exports.getRecommendations = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignmentId');

    const links = [];

    if (submissions.length > 0) {
      const lastSub = submissions[0];
      if (lastSub.percentage < 70) {
        links.push({
          id: 'revise',
          title: `Revise: ${lastSub.assignmentId?.title || 'Last Topic'}`,
          icon: 'BookOpen',
          action: `/articles`,
          type: 'weakness'
        });
      } else {
        links.push({
          id: 'next',
          title: 'Ready for the next challenge',
          icon: 'TrendingUp',
          action: `/articles`,
          type: 'progress'
        });
      }
    } else {
      links.push({
        id: 'start',
        title: 'Start your first article',
        icon: 'BookOpen',
        action: `/articles`,
        type: 'start'
      });
    }

    // Add a quick win task
    links.push({
      id: 'quick-win',
      title: '5-Minute Code Review',
      icon: 'Zap',
      action: `/articles`,
      type: 'quick'
    });

    res.json({ success: true, data: links });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Learning DNA & Career Readiness
exports.getLearningDNA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const submissions = await Submission.find({ userId: req.user._id }).limit(20);

    // Dynamic Readiness Calculation
    const readiness = calculateReadiness(submissions);
    user.stats.careerReadiness = readiness;
    
    // Minimal mock logic for DNA if empty
    if (!user.stats.learningDNA.strengths.length) {
      user.stats.learningDNA.strengths = ['Fast Learner', 'Consistent'];
      user.stats.learningDNA.weaknesses = ['Edge Cases', 'System Design Context'];
    }

    await user.save();

    res.json({
      success: true,
      data: {
        readiness: user.stats.careerReadiness,
        dna: user.stats.learningDNA
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. AI Mentor Layer (Chat/Guiding Questions)
exports.chatWithMentor = async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Here we'd call the Gemini API via aiService.
    // For the prompt, we enforce the "Socratic Method" / Guiding Questions.
    
    const systemPrompt = `You are an AI Learning Mentor for a software engineering platform.
    CRITICAL RULES:
    1. DO NOT give direct answers to coding problems.
    2. Use the Socratic method: ask guiding questions to lead the user to the answer.
    3. Keep responses under 3 sentences. Be concise.
    4. Provide encouragement.
    
    Current User Context: ${JSON.stringify(context || {})}`;

    let reply = "";
    
    if (aiService.hasKey) {
      const model = aiService.textModels[0];
      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "I understand. I will guide the user without giving direct answers." }] }
        ],
      });
      
      const result = await chat.sendMessage(message);
      reply = result.response.text();
    } else {
      reply = `(Mock Mentor) That's an interesting question about "${message}". What approach have you considered so far?`;
    }

    res.json({ success: true, data: { reply } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
