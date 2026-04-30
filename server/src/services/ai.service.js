// src/services/ai.service.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const AIUsageLog = require('../models/AIUsageLog');
const AIChatLog = require('../models/AIChatLog');
const User = require('../models/User');
const logger = require('../utils/logger');
const cacheService = require('./cache.service');
const fuzzyService = require('./fuzzy.service');
const ragService = require('./rag.service');
const personalizationService = require('./personalization.service');
const VivaSession = require('../models/VivaSession');

const MODELS = [
  'gemini-2.0-flash',           // Primary (April 2026 performance model)
  'gemini-2.5-flash',           // High-throughput 2026 model
  'gemini-2.5-pro',             // High-reasoning 2026 model
  'gemini-flash-lite-latest'    // Verified 2026 high-availability model
];

class AIService {
  constructor() {
    this.hasKey = !!env.GEMINI_API_KEY;

    if (this.hasKey) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

      // Initialize all model tiers
      this.textModels = MODELS.map(name => this.genAI.getGenerativeModel({ model: name }));
      
      this.jsonModels = MODELS.map(name => this.genAI.getGenerativeModel({
        model: name,
        generationConfig: { responseMimeType: 'application/json' },
      }));
    }
  }

  async chat(userId, message, articleId, assignmentId, mode = 'normal', tier = 0) {
    const startTime = Date.now();

    // 1. Normalize Query
    const normalizedMessage = fuzzyService.normalize(message);

    // [FAIL-SAFE] Simple Greetings & Help
    const greetings = ['hi', 'hello', 'hey', 'help', 'who are you', 'how are you'];
    if (greetings.includes(normalizedMessage)) {
      let answer = "Hello! I am your AI Learning Assistant. How can I help you today?";
      if (normalizedMessage === 'help') {
        answer = "I can help you understand articles, explain coding concepts, give hints for assignments, or even conduct a mock viva! Just ask me anything related to your studies.";
      }
      return { answer, source: 'predefined', confidence: 1.0, mode, usedRAG: false };
    }


    // 2. Check Cache
    const cacheKey = cacheService.getChatKey(normalizedMessage, articleId, mode);
    const cachedAnswer = cacheService.getChatAnswer(cacheKey);
    if (cachedAnswer) {
      await this._logChat(userId, message, cachedAnswer, 'cache', mode, 1.0, false, articleId, assignmentId, Date.now() - startTime);
      const user = await User.findById(userId).select('stats');
      return { answer: cachedAnswer, source: 'cache', confidence: 1.0, mode, usedRAG: false, stats: user.stats };
    }

    // 3. Viva Mode specific logic (High Priority)
    if (mode === 'viva') {
      return await this._handleViva(userId, message, articleId);
    }

    // 4. Fuzzy Match Predefined Q&A (only for normal mode without specific article context)
    if (mode === 'normal' && !articleId && !assignmentId) {
      const fuzzyMatch = await fuzzyService.findMatch(message);
      if (fuzzyMatch) {
        let finalAnswer = fuzzyMatch.answer;

        // SDE-3 Logic: If confidence is medium, add a helpful follow-up
        if (fuzzyMatch.confidence < 0.8 && fuzzyMatch.confidence >= 0.5) {
          finalAnswer += "\n\nAgar tum chaho toh main isko aur detail me explain kar sakta hoon Gemini ke through. Bas pucho!";
        }

        await this._logChat(userId, message, finalAnswer, fuzzyMatch.matchType, mode, fuzzyMatch.confidence, false, articleId, assignmentId, Date.now() - startTime);
        const user = await User.findById(userId).select('stats');
        return { answer: finalAnswer, source: fuzzyMatch.matchType, confidence: fuzzyMatch.confidence, mode, usedRAG: false, stats: user.stats };
      }
    }

    // 4. Fetch Personalization & RAG Context
    let contextStr = await personalizationService.getContextString(userId);
    let usedRAG = false;

    // Hint Mode specific rules
    if (mode === 'hint') {
      contextStr += `\n\n[INSTRUCTION]\nThe user is asking for a hint. DO NOT give the direct answer. Give a conceptual step-by-step hint.`;
    }

    if (articleId || assignmentId) {
      // Just general context
      contextStr += `\nThe user is asking about a specific context. ArticleId: ${articleId || 'N/A'}. AssignmentId: ${assignmentId || 'N/A'}.`;
    } else {
      // Search knowledge base
      const ragContext = await ragService.buildRAGContextString(message);
      if (ragContext) {
        contextStr += ragContext;
        usedRAG = true;
      }
    }

    // 5. Call Gemini
    const currentModelName = MODELS[tier] || MODELS[0];
    const currentModel = this.textModels[tier] || this.textModels[0];

    if (!this.hasKey) {
      const answer = "Mock AI Answer: This is an advanced system response.";
      return { answer, source: 'gemini', confidence: 0.9, mode, usedRAG };
    }

    try {
      const prompt = `
You are an AI learning assistant inside Mini AI LMS. Answer in simple student-friendly language. 
Keep answers short, structured, and practical. If the question is about code, explain with an example. 
If unsure, say that the topic is not available in the current LMS context. Do not hallucinate.

${contextStr}

User Question: ${message}
      `.trim();

      const result = await currentModel.generateContent(prompt);
      const text = result.response.text();

      const inputTokens = result.response.usageMetadata?.promptTokenCount || 0;
      const outputTokens = result.response.usageMetadata?.candidatesTokenCount || 0;

      await this._logUsage(userId, 'chat', currentModelName, true, null, inputTokens, outputTokens);

      // Update weak topics if mode is hint and it seems user is struggling
      if (mode === 'hint') {
        // rudimentary weak topic tagging based on message
        await personalizationService.updateWeakTopic(userId, message.split(' ').slice(0, 3).join(' '), true);
      }

      // 6. Cache the result (for 30 minutes for specific doubts, 6 hours for general)
      const ttl = (articleId || assignmentId) ? 1000 * 60 * 30 : 1000 * 60 * 60 * 6;
      cacheService.setChatAnswer(cacheKey, text, ttl);

      const source = usedRAG ? 'rag_gemini' : 'gemini';
      await this._logChat(userId, message, text, source, mode, 0.95, usedRAG, articleId, assignmentId, Date.now() - startTime);

      // Get latest user stats to return to frontend
      const updatedUser = await User.findById(userId).select('stats');

      return { answer: text, source, confidence: 0.95, mode, usedRAG, stats: updatedUser.stats };

    } catch (err) {
      // 7. Multi-Tier Fallback Logic
      if ((err.message.includes('503') || err.message.includes('429')) && tier < MODELS.length - 1) {
        console.log(`🔄 ${currentModelName} failed (Quota/Busy). Retrying with ${MODELS[tier + 1]}...`);
        return this.chat(userId, message, articleId, assignmentId, mode, tier + 1);
      }

      console.error(`[Gemini Error in chat - ${currentModelName}]:`, err);

      if (err.message.includes('429') || err.message.includes('quota')) {
        return {
          answer: "⏳ Quota Exceeded: You've hit the Gemini API free tier limit for all available models. Please try again after some time or use my predefined knowledge base!",
          source: 'error',
          isError: true,
          mode
        };
      }

      // Handle Leaked Key / Forbidden error
      if (err.message.includes('403') || err.message.includes('Forbidden')) {
        return {
          answer: 'The AI service is currently unavailable due to an API key issue. However, you can still ask basic questions that are in my knowledge base!',
          source: 'error',
          confidence: 0,
          mode,
          usedRAG: false
        };
      }

    }
  }

  async _handleViva(userId, message, articleId) {
    const startTime = Date.now();
    let session = await VivaSession.findOne({ userId, status: 'active' });

    if (!session) {
      // Start a new session
      const topic = articleId ? `Article ID: ${articleId}` : 'General Web Development';
      session = await VivaSession.create({
        userId,
        topic,
        status: 'active',
        maxQuestions: 5,
        history: []
      });

      const prompt = `Start a viva/oral exam on the topic: ${topic}. Ask the first question. Keep it short.`;
      const aiResponse = await this._callGeminiRaw(prompt);

      session.history.push({ question: aiResponse });
      await session.save();

      const user = await User.findById(userId).select('stats');

      return {
        answer: `Started Viva on ${topic}!\n\n${aiResponse}`,
        source: 'viva_gemini',
        confidence: 1.0,
        mode: 'viva',
        stats: user.stats
      };
    }

    // Handle user's answer to the previous question
    const lastInteraction = session.history[session.history.length - 1];
    lastInteraction.userAnswer = message;

    const evaluationPrompt = `
      Topic: ${session.topic}
      Question: ${lastInteraction.question}
      User Answer: ${message}
      
      Evaluate the answer. Provide short feedback and a score out of 10.
      Format: FEEDBACK: <text> | SCORE: <number>
    `;

    const evalResult = await this._callGeminiRaw(evaluationPrompt);
    const [feedback, scoreStr] = evalResult.split('|');
    const score = parseInt(scoreStr?.replace(/[^0-9]/g, '')) || 0;

    lastInteraction.evaluation = feedback.replace('FEEDBACK:', '').trim();
    lastInteraction.marksAwarded = score;
    session.score += score;
    session.questionsAsked += 1;

    if (session.questionsAsked >= session.maxQuestions) {
      session.status = 'completed';
      await session.save();
      const user = await User.findById(userId).select('stats');
      return {
        answer: `Viva Completed! 🎉\n\nLast Evaluation: ${lastInteraction.evaluation}\nTotal Score: ${session.score}/${session.maxQuestions * 10}\n\nYou can start a new session by selecting Viva mode again.`,
        source: 'viva_gemini',
        confidence: 1.0,
        mode: 'viva',
        stats: user.stats
      };
    }

    // Ask next question
    const nextQuestionPrompt = `
      Topic: ${session.topic}
      Previous History: ${session.history.map(h => `Q: ${h.question}, A: ${h.userAnswer}`).join('\n')}
      
      Ask the next question for the viva. Don't repeat previous questions.
    `;
    const nextQuestion = await this._callGeminiRaw(nextQuestionPrompt);
    session.history.push({ question: nextQuestion });
    await session.save();

    const user = await User.findById(userId).select('stats');

    return {
      answer: `Evaluation: ${lastInteraction.evaluation}\nScore: ${score}/10\n\nNEXT QUESTION: ${nextQuestion}`,
      source: 'viva_gemini',
      confidence: 1.0,
      mode: 'viva',
      stats: user.stats
    };
  }

  async _callGeminiRaw(prompt) {
    if (!this.hasKey) return "Mock AI Response for Viva.";
    try {
      const result = await this.textModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error('Gemini Raw Call Failed:', err);
      return "I'm sorry, I'm having trouble processing the Viva session right now.";
    }
  }

  async _logChat(userId, message, answer, source, mode, confidence, usedRAG, articleId, assignmentId, responseTimeMs) {
    try {
      await AIChatLog.create({
        userId, message, answer, source, mode, confidence, usedRAG, articleId, assignmentId, responseTimeMs
      });
    } catch (e) {
      logger.error('Failed to log AI chat', e);
    }
  }

  async generateHint(userId, questionText, tier = 0) {
    const currentModelName = MODELS[tier] || MODELS[0];
    const currentModel = this.textModels[tier] || this.textModels[0];

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

      const user = await User.findById(userId).select('stats');
      return { hint: text || 'Think about the main concept in the question.', stats: user.stats };
    } catch (err) {
      console.error(`[Gemini Error in generateHint - ${currentModelName}]:`, err.message);

      // 4. AUTOMATIC FALLBACK LOGIC
      if ((err.message.includes('503') || err.message.includes('429')) && tier < MODELS.length - 1) {
        console.log(`🔄 ${currentModelName} failed (Quota/Busy). Retrying with ${MODELS[tier + 1]}...`);
        return this.generateHint(userId, questionText, tier + 1);
      }

      await this._logUsage(userId, 'hint', currentModelName, false, err.message, 0, 0);

      // --- 🌟 THE PRO HANDLING 🌟 ---
      if (err.message.includes('503') || err.message.includes('429') || err.message.includes('demand')) {
        return { hint: "⏳ The AI servers are busy right now. Please try again in a few seconds!" };
      }

      if (err.message.includes('API key')) {
        return { hint: "⚠️ Configuration Error: The AI service API key is misconfigured or disabled." };
      }

      return { hint: 'Failed to generate a hint right now due to an unexpected error.' };
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

    const currentModelName = MODELS[tier] || MODELS[0];
    const currentModel = this.jsonModels[tier] || this.jsonModels[0];

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
      const user = await User.findById(userId).select('stats');
      return {
        score: Number(parsed.score) || 0,
        feedback: parsed.feedback || 'Good attempt.',
        improvement: parsed.improvement || 'N/A',
        stats: user.stats
      };
    } catch (err) {
      console.error(`[Gemini Error in evaluateShortAnswer - ${currentModelName}]:`, err.message);

      if ((err.message.includes('503') || err.message.includes('429')) && tier < MODELS.length - 1) {
        console.log(`🔄 ${currentModelName} failed (Quota/Busy). Retrying with ${MODELS[tier + 1]}...`);
        return this.evaluateShortAnswer(userId, questionText, expectedAnswer, rubric, userAnswer, maxMarks, tier + 1);
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
  async summarizeArticle(userId, content, title, tier = 0) {
    const currentModelName = MODELS[tier] || MODELS[0];
    const currentModel = this.textModels[tier] || this.textModels[0];

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

      const user = await User.findById(userId).select('stats');
      return { summary: text, shouldCache: true, stats: user.stats };
    } catch (err) {
      console.error(`[Gemini Error in summarizeArticle - ${currentModelName}]:`, err.message);

      // 4. AUTOMATIC FALLBACK LOGIC
      if ((err.message.includes('503') || err.message.includes('429')) && tier < MODELS.length - 1) {
        console.log(`🔄 ${currentModelName} failed (Quota/Busy). Retrying with ${MODELS[tier + 1]}...`);
        return this.summarizeArticle(userId, content, title, tier + 1);
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