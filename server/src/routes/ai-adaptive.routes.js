const express = require('express');
const protect = require('../middlewares/auth.middleware');
const aiAdaptiveController = require('../controllers/ai-adaptive.controller');

const router = express.Router();

router.use(protect); // All AI adaptive routes require authentication

// Predictive Insights (Anti-Procrastination & Shadow Benchmark)
router.get('/insights', aiAdaptiveController.getInsights);

// Smart Quick Links (Recommendations)
router.get('/recommendations', aiAdaptiveController.getRecommendations);

// Learning DNA & Career Readiness
router.get('/dna', aiAdaptiveController.getLearningDNA);

// AI Mentor Layer (Chat/Guiding Questions)
router.post('/mentor', aiAdaptiveController.chatWithMentor);

module.exports = router;
