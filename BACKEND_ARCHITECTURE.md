# Backend Architecture 🏗️

The Mini AI LMS backend is a robust Node.js application built with a focus on modularity, scalability, and seamless AI integration.

---

## 🏗️ Core Architecture: Service-Oriented Pattern
We follow a strict **Controller-Service-Model** pattern to separate concerns:
1. **Routes**: Define endpoints and apply middleware.
2. **Controllers**: Handle HTTP requests, extract data, and call appropriate services.
3. **Services**: Contain the core business logic, AI interactions, and complex database queries.
4. **Models**: Define data structure using Mongoose schemas.

---

## 🔐 Security & Auth Flow
- **JWT Authentication**: Secure stateless authentication using JSON Web Tokens.
- **RBAC (Role-Based Access Control)**: Middleware (`authorize`) ensures only specific roles (Admin, Author, Learner) can access certain routes.
- **Validation**: Every request is validated against **Zod** schemas before reaching the controller, ensuring data integrity.
- **Security Headers**: Integrated with **Helmet** and **CORS** for web security.

---

## 🤖 AI Logic & Optimization

### Gemini AI Integration
The system integrates with **Google Gemini 1.5/2.0 Flash** for:
- Summarizing articles.
- Evaluating short answers with rubric-based scoring.
- Generating context-aware hints.
- Powering the adaptive Viva and Mentor sessions.

### Chatbot Optimization (The Efficiency Engine)
To minimize API costs and latency, we use a **Multi-Stage Matching Flow**:
1. **Normalization**: Cleaning user input (removing noise, filler words).
2. **Exact/Keyword Match**: Checking `PredefinedQA` for instant matches.
3. **Fuzzy Matching**: Using `Fuse.js` and `Natural` NLP to find similar questions in the database.
4. **RAG (Retrieval-Augmented Generation)**: If no match is found, we retrieve relevant article chunks from MongoDB and send them to Gemini for a grounded response.
5. **Caching**: AI summaries and responses are cached to avoid redundant calls.

---

## 📊 Real-Time Features
- **Socket.IO**: Used for real-time leaderboard updates. When a student submits an assignment, the system calculates the impact and emits an event to all connected clients.
- **Activity Logging**: Every major action (Article created, Assignment submitted) is logged to generate a personalized activity feed.

---

## 📈 Leaderboard & Stats
- **Aggregation**: User stats (Total Score, Articles Completed) are denormalized in the `User` model for fast reading, but recalculated/validated during submissions.
- **Streaks**: Automated logic calculates daily learning streaks and rewards consistency.

---

## 🛠️ Error Handling & Logging
- **Global Error Handler**: A centralized middleware catches all errors and returns standardized JSON responses.
- **Pino Logger**: High-performance logging with `pino-http` for production-grade observability and debugging.
