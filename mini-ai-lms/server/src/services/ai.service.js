// src/services/ai.service.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const AIUsageLog = require('../models/AIUsageLog');
const logger = require('../utils/logger');

const MODEL_NAME = 'gemini-2.5-flash';

class AIService {
  constructor() {
    this.hasKey = !!env.GEMINI_API_KEY;

    if (this.hasKey) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

      this.textModel = this.genAI.getGenerativeModel({ model: MODEL_NAME });

      this.jsonModel = this.genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: { responseMimeType: 'application/json' },
      });
    }
  }
  async generateHint(userId, questionText) {
    if (!this.hasKey) {
      await this._logUsage(userId, 'hint', MODEL_NAME, true);
      return 'Mock Hint: Focus on the main concept in the question and connect it with the article.';
    }

    try {
      const cleanQuestion = this._clean(questionText).slice(0, 1500);

      const prompt = `
You are a helpful teaching assistant.

Give one short hint for the question below.

Rules:
- Do not reveal the direct answer.
- Do not solve the full question.
- Give only a useful nudge.

Question:
${cleanQuestion}
`.trim();

      const result = await this.textModel.generateContent(prompt);
      const text = this._clean(result.response.text());

      await this._logUsage(userId, 'hint', MODEL_NAME, true);

      return text || 'Think about the main concept in the question.';
    } catch (err) {
      await this._logUsage(userId, 'hint', MODEL_NAME, false, err.message);
      return 'Failed to generate a hint right now.';
    }
  }
  async _logUsage(userId, feature, success, errorMessage = null) {
    try {
      await AIUsageLog.create({
        userId,
        feature,
        model: MODEL_NAME,
        success,
        errorMessage,
      });
    } catch (e) { }
  }

  _clean(text = '') {
    return text.replace(/\s+/g, ' ').trim();
  }

  _isFailed(text = '') {
    const t = text.toLowerCase();
    return t.includes('failed') || t.includes('try again');
  }

  _buildContext(content, title) {
    const clean = this._clean(content);

    if (clean.length <= 6000) {
      return clean;
    }

    const intro = clean.slice(0, 2500);
    const mid = clean.slice(clean.length / 2, clean.length / 2 + 1500);
    const end = clean.slice(-2500);

    return `Title: ${title}\n\n${intro}\n\n${mid}\n\n${end}`;
  }

  async summarizeArticle(userId, content, title) {
    try {
      const context = this._buildContext(content, title);

      const prompt = `
Summarize this article in simple terms:
- Cover key idea, benefits, risks
- Keep it short
- No extra info

${context}
`;

      const res = await this.textModel.generateContent(prompt);
      const text = this._clean(res.response.text());

      if (this._isFailed(text)) {
        return { summary: 'Failed to generate summary', shouldCache: false };
      }

      await this._logUsage(userId, 'summary', true);

      return { summary: text, shouldCache: true };
    } catch (err) {
      await this._logUsage(userId, 'summary', false, err.message);
      return { summary: 'Failed to generate summary', shouldCache: false };
    }
  }
}

module.exports = new AIService();