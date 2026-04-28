// src/services/ai.service.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const AIUsageLog = require('../models/AIUsageLog');
const User = require('../models/User');
const logger = require('../utils/logger');

const MODEL_NAME = 'gemini-2.5-flash';
const FALLBACK_MODEL_NAME = 'gemini-1.5-flash-latest'; // <-- Updated this to use the reliable tag

class AIService {
  constructor() {
    this.hasKey = !!env.GEMINI_API_KEY;

    if (this.hasKey) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

      this.textModel = this.genAI.getGenerativeModel({ model: MODEL_NAME });
      // 2. Initialize fallback model
      this.fallbackTextModel = this.genAI.getGenerativeModel({ model: FALLBACK_MODEL_NAME });

      this.jsonModel = this.genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: { responseMimeType: 'application/json' },
      });

      this.fallbackJsonModel = this.genAI.getGenerativeModel({
        model: FALLBACK_MODEL_NAME,
        generationConfig: { responseMimeType: 'application/json' },
      });
    }
  }

  async generateHint(userId, questionText, useFallback = false) {
    const currentModelName = useFallback ? FALLBACK_MODEL_NAME : MODEL_NAME;
    const currentModel = useFallback ? this.fallbackTextModel : this.textModel;

    if (!this.hasKey) {
      await this._logUsage(userId, 'hint', currentModelName, true, null, 0, 0);
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

      const result = await currentModel.generateContent(prompt);
      const text = this._clean(result.response.text());
      const inputTokens = result.response.usageMetadata?.promptTokenCount || 0;
      const outputTokens = result.response.usageMetadata?.candidatesTokenCount || 0;

      await this._logUsage(userId, 'hint', currentModelName, true, null, inputTokens, outputTokens);

      return text || 'Think about the main concept in the question.';
    } catch (err) {
      console.error(`[Gemini Error in generateHint - ${currentModelName}]:`, err.message);
      
      // 4. AUTOMATIC FALLBACK LOGIC
      if (err.message.includes('503') && !useFallback) {
        console.log(`🔄 Google 2.5 servers are busy. Retrying automatically with ${FALLBACK_MODEL_NAME}...`);
        return this.generateHint(userId, questionText, true);
      }

      await this._logUsage(userId, 'hint', currentModelName, false, err.message, 0, 0);

      // --- 🌟 THE PRO HANDLING 🌟 ---
      if (err.message.includes('503') || err.message.includes('429') || err.message.includes('demand')) {
        return "⏳ The AI servers are busy right now. Please try again in a few seconds!";
      }

      if (err.message.includes('API key')) {
        return "⚠️ Configuration Error: The AI service API key is misconfigured or disabled.";
      }

      return 'Failed to generate a hint right now due to an unexpected error.';
    }
  }

  async _logUsage(userId, feature, modelName, success, errorMessage = null, inputTokens = 0, outputTokens = 0) {
    try {
      await AIUsageLog.create({
        userId,
        feature,
        model: modelName,
        success,
        errorMessage,
        inputTokens,
        outputTokens
      });

      const totalTokens = inputTokens + outputTokens;
      if (totalTokens > 0) {
        await User.findByIdAndUpdate(userId, { $inc: { 'stats.aiTokensUsed': totalTokens } });
      }
    } catch (e) {
      logger.error('Failed to log AI usage', e);
    }
  }

  async evaluateShortAnswer(userId, questionText, expectedAnswer, rubric, userAnswer, maxMarks, useFallback = false) {
    if (!this.hasKey) {
      return {
        score: Math.floor(maxMarks / 2),
        feedback: 'Mock evaluation: Your answer touches on some key points but lacks depth.',
        improvement: 'Include more specific examples.'
      };
    }

    const currentModelName = useFallback ? FALLBACK_MODEL_NAME : MODEL_NAME;
    const currentModel = useFallback ? this.fallbackJsonModel : this.jsonModel;

    try {
      const prompt = `
        You are an expert educational evaluator. Evaluate the student's short answer against the expected answer and rubric.
        
        Question: ${questionText}
        Expected Answer: ${expectedAnswer || 'N/A'}
        Rubric: ${rubric || 'N/A'}
        Student's Answer: ${userAnswer}
        Maximum Marks: ${maxMarks}

        Return ONLY a JSON object with the following structure:
        {
          "score": <number between 0 and ${maxMarks}, representing the marks awarded based on correctness and rubric>,
          "feedback": "<string: what they did well and what they missed in 1-2 sentences>",
          "improvement": "<string: actionable advice on how to improve in 1 sentence>"
        }
      `.trim();

      const res = await currentModel.generateContent(prompt);
      const text = res.response.text();
      
      const inputTokens = res.response.usageMetadata?.promptTokenCount || 0;
      const outputTokens = res.response.usageMetadata?.candidatesTokenCount || 0;
      await this._logUsage(userId, 'evaluation', currentModelName, true, null, inputTokens, outputTokens);

      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\n?/, '').replace(/```$/, '').trim();
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\n?/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(cleanText);
      return {
        score: Number(parsed.score) || 0,
        feedback: parsed.feedback || 'Good attempt.',
        improvement: parsed.improvement || 'N/A'
      };
    } catch (err) {
      console.error(`[Gemini Error in evaluateShortAnswer - ${currentModelName}]:`, err.message);
      
      if (err.message.includes('503') && !useFallback) {
        console.log(`🔄 Google 2.5 servers are busy. Retrying evaluateShortAnswer automatically with ${FALLBACK_MODEL_NAME}...`);
        return this.evaluateShortAnswer(userId, questionText, expectedAnswer, rubric, userAnswer, maxMarks, true);
      }

      await this._logUsage(userId, 'evaluation', currentModelName, false, err.message, 0, 0);

      return {
        score: 0,
        feedback: 'AI evaluation failed.',
        improvement: 'Please try submitting again later.'
      };
    }
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

  async _localSummarize(title, content) {
    return new Promise((resolve) => {
      try {
        const natural = require('natural');
        const tokenizer = new natural.SentenceTokenizer();
        const sentences = tokenizer.tokenize(content);

        if (!sentences || sentences.length <= 5) return resolve(content);

        const tfidf = new natural.TfIdf();
        tfidf.addDocument(content);

        const scored = sentences.map((s, index) => {
          let score = 0;
          const words = new natural.WordTokenizer().tokenize(s);
          words.forEach(word => {
            score += tfidf.tfidf(word, 0);
          });
          return { sentence: s, score: score, index };
        });

        scored.sort((a, b) => b.score - a.score);
        const topSentences = scored.slice(0, Math.max(3, Math.floor(sentences.length * 0.2))).sort((a, b) => a.index - b.index);

        resolve(topSentences.map(x => x.sentence).join(' '));
      } catch (err) {
        console.error("Local summary failed", err);
        resolve(content); // Fallback to original content
      }
    });
  }

  // 3. Add useFallback parameter
  async summarizeArticle(userId, content, title, useFallback = false) {
    const currentModelName = useFallback ? FALLBACK_MODEL_NAME : MODEL_NAME;
    const currentModel = useFallback ? this.fallbackTextModel : this.textModel;

    try {
      // Pre-summarize locally to save up to 80% of tokens before calling Gemini
      const shortenedContent = await this._localSummarize(title, content);
      const context = this._buildContext(shortenedContent, title);

      const prompt = `
Summarize this article in simple terms with clean paragraph breaks:
- Cover key idea, benefits, risks
- Keep it short
- Use plain text only (do NOT use markdown like ** or *)

${context}
`;

      const res = await currentModel.generateContent(prompt);
      const text = res.response.text().trim();
      const inputTokens = res.response.usageMetadata?.promptTokenCount || 0;
      const outputTokens = res.response.usageMetadata?.candidatesTokenCount || 0;

      if (this._isFailed(text)) {
        return { summary: 'Failed to generate summary', shouldCache: false };
      }

      await this._logUsage(userId, 'summarize', currentModelName, true, null, inputTokens, outputTokens);

      return { summary: text, shouldCache: true };
    } catch (err) {
      console.error(`[Gemini Error in summarizeArticle - ${currentModelName}]:`, err.message);

      // 4. AUTOMATIC FALLBACK LOGIC
      // If we hit a 503 and haven't tried the fallback yet, immediately retry!
      if (err.message.includes('503') && !useFallback) {
        console.log(`🔄 Google 2.5 servers are busy. Retrying automatically with ${FALLBACK_MODEL_NAME}...`);
        return this.summarizeArticle(userId, content, title, true);
      }

      await this._logUsage(userId, 'summarize', currentModelName, false, err.message, 0, 0);

      // --- 🌟 THE PRO HANDLING 🌟 ---
      // If we reach here, either the fallback also failed, or it's a hard error.

      if (err.message.includes('503') || err.message.includes('429') || err.message.includes('demand')) {
        return {
          summary: "⏳ The AI servers are currently experiencing unusually high demand. We couldn't generate a summary right now, but please try again in a minute or two!",
          shouldCache: false
        };
      }

      if (err.message.includes('API key')) {
        return {
          summary: "⚠️ Configuration Error: The AI service is currently misconfigured. Please contact support.",
          shouldCache: false
        };
      }

      // Generic fallback for all other random errors
      return {
        summary: 'Failed to generate summary due to an unexpected error. Please try again later.',
        shouldCache: false
      };
    }
  }
}

module.exports = new AIService();