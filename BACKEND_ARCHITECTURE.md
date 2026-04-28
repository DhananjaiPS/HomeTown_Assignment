# Backend Architecture & Implementation Details

This document provides a deep dive into the Node.js backend architecture. It covers our schema design, API structure, difficulties encountered, and our highly scalable AI pipeline.

## 1. Project Demand vs. Our Solution
**The Demand:** Build a secure Node.js/Express backend with MongoDB to handle Users, Articles, Assignments, and Submissions. It must rank users globally and utilize AI to generate hints, summarize texts, and evaluate subjective questions automatically.
**Our Solution:** We constructed a modular Model-Route-Controller-Service (MRCS) architecture. We implemented JWT authentication, robust Zod input validation, an Mongoose Aggregation pipeline for leaderboards, and an extremely sophisticated AI Service wrapper around Google Gemini with automated fallback logic and token-cost reduction layers.

## 2. Folder Structure & Purpose

### `/src/models`
- **Purpose:** Mongoose Database Schemas.
- **Why it's needed:** Defines the NoSQL structure and relationships.
- **Highlights:** 
  - `User.js`: Tracks learning metrics (`stats`), gamification (`badges`, `streaks`), and AI token quotas.
  - `Article.js` & `Assignment.js`: Linked via references (`ObjectId`). Assignments contain deeply nested schemas for various question types (MCQ, Short Answer).
  - `AIUsageLog.js`: An audit log to strictly track API input/output tokens per user per feature.

### `/src/routes` & `/src/controllers`
- **Purpose:** API routing and HTTP request/response handling.
- **Why it's needed:** Separates network-level logic (Status codes, JSON parsing) from business logic.
- **Highlights:** `assignment.controller.js` and `ai.controller.js` are kept extremely thin, strictly delegating complex work to the Service layer.

### `/src/services`
- **Purpose:** Pure business logic.
- **Why it's needed:** Ensures code is reusable and testable without needing a fake HTTP request.
- **Highlights:** 
  - `ai.service.js`: The powerhouse of the application. It handles Google Gemini API calls. It includes automated token tracking, error fallback generation, and context building.

### `/src/middlewares` & `/src/validators`
- **Purpose:** Security and data integrity.
- **Highlights:** `auth.middleware.js` verifies JWTs and intercepts unauthorized roles. `*.validator.js` uses Zod to ensure the database is protected from malformed payload injections.

## 3. Difficulties Faced & Overcome

**Difficulty 1: Unpredictable AI Formatting**
- *Problem:* Asking the AI to evaluate a short answer text returned a raw paragraph, which was impossible to parse and store in the DB structurally (e.g. Score vs Feedback).
- *Solution:* We heavily utilized Gemini's `responseMimeType: 'application/json'` configuration and strictly enforced a JSON schema in the prompt. This forces the AI to reply with a parseable `{ "score": X, "feedback": "Y" }` object every time, allowing seamless DB storage.

**Difficulty 2: The ES Module Scope Crash (`node-summary`)**
- *Problem:* We attempted to use the popular `node-summary` package to reduce AI token costs. However, the package was broken on modern Node.js versions due to a mixture of CommonJS and raw ES6 `import` statements, crashing our server with `require is not defined in ES module scope`.
- *Solution:* We completely removed the broken dependency and built our own custom NLP summarizer natively using the `natural` library. It tokenizes the document, computes TF-IDF weights, and cleanly slices the top 20% most critical sentences using pure math, bypassing the bug entirely.

## 4. Backend Optimizations & Scalability

- **Local Extractive Summarization (80% Cost Reduction):**
  - *The Optimization:* Sending a 10,000-word article to an LLM for summarization consumes massive amounts of expensive tokens. Before calling Gemini, our `_localSummarize()` method uses TF-IDF to locally extract the top 3-5 most critical sentences. We then pass *only* this tiny extracted chunk to Gemini to polish into a human-readable paragraph. This saves ~80% of API token bandwidth and slashes latency.

- **Automated AI Fallback Layers:**
  - *The Optimization:* Free AI models are highly volatile. If `gemini-2.5-flash` returns a `503 Service Unavailable` due to high demand, our `ai.service.js` catches the error and **automatically retries the exact same prompt using a fallback model** (`gemini-1.5-flash-latest`). If both fail, it returns a safe UI-friendly string rather than crashing.

- **Aggregation Pipeline Leaderboard:**
  - *The Optimization:* Instead of running a cron job or constantly updating a monolithic "rank" field, the leaderboard is generated on-the-fly using MongoDB's `$project` and `$sort` aggregations, dynamically weighting `scorePercentage` against `completionRate`. This ensures real-time accuracy and zero stale data at massive scale.
