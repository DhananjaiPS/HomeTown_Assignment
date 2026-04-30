const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const logger = require('./utils/logger');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Trust Proxy (Essential for production rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

// General Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// 🤖 Chat & AI Specific Rate Limiter (Stricter for high-cost resources)
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 10, // 10 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit hit: IP ${req.ip} exceeded AI limit`);
    res.status(429).json({
      success: false,
      message: 'Limit reached! ⏳ Please try again after 1 minute cooldown.'
    });
  }
});

// Logging Middleware
app.use(pinoHttp({ logger, autoLogging: false }));

// Health Check Route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running smoothly' });
});

// Import Routes
const authRoutes = require('./routes/auth.routes');
const articleRoutes = require('./routes/article.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const submissionRoutes = require('./routes/submission.routes');
const aiRoutes = require('./routes/ai.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const adaptiveRoutes = require('./routes/ai-adaptive.routes');
const authorRequestRoutes = require('./routes/authorRequest.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/ai', aiLimiter, aiRoutes); // Apply aiLimiter here
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/adaptive', adaptiveRoutes);
app.use('/api/v1/author-requests', authorRequestRoutes);

// Error Handling Middleware (must be last)
app.use(errorMiddleware);

module.exports = app;
