# Mini AI Learning Management System (LMS) 🚀

A modern, high-performance Learning Management System powered by AI, designed for personalized learning experiences. Built with the MERN stack and integrated with Google's Gemini AI.

---

## 🌟 Key Features

### 📖 Learning & Content
- **Articles & Resources**: Rich educational content with reading time estimates.
- **AI-Powered Summarization**: Instantly generate simple, concise summaries of any article using Gemini AI.
- **Progress Tracking**: Real-time tracking of reading progress and article completion.

### ✍️ Intelligent Assignments
- **Diverse Question Types**: Supports MCQs, MSQs, and Short Answers.
- **AI Short Answer Evaluation**: Automated grading of short answers using Gemini, providing scores, feedback, and improvement tips.
- **Smart Hints**: Get context-aware AI hints when stuck on an assignment question.

### 🤖 AI Mentor & Chatbot
- **Context-Aware Chat**: Multi-mode chatbot (Normal, Strict Teacher, Viva, Interview).
- **Fuzzy Matching Optimization**: Advanced fuzzy search (Fuse.js + Natural NLP) to match common FAQs and reduce API costs.
- **RAG (Retrieval-Augmented Generation)**: Chatbot uses relevant article content to answer queries accurately.
- **Adaptive Viva Sessions**: Engage in AI-led oral examinations to test your knowledge.

### 🏆 Gamification & Analytics
- **Global Leaderboard**: Real-time rankings based on scores and article completions via Socket.IO.
- **Learning DNA**: AI-generated profile highlighting strengths, weaknesses, and retention rates.
- **Badges & Streaks**: Earn rewards for consistent learning and high scores.
- **Cognitive Load Index**: Adaptive insights into your learning effort.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, TanStack Query (React Query), Socket.IO Client.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO, Zod (Validation), Pino (Logging).
- **AI**: Google Generative AI (Gemini 1.5/2.0 Flash), Fuse.js, Natural NLP.
- **Security**: JWT Authentication, Role-Based Access Control (RBAC), Helmet, Express Rate Limit.

---

## 📂 Folder Structure

```text
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/            # Axios instance & interceptors
│   │   ├── components/     # UI Components (Admin, Chatbot, Layout, etc.)
│   │   ├── context/        # Auth & State Contexts
│   │   ├── hooks/          # Custom hooks (AI, Auth, Articles, etc.)
│   │   ├── pages/          # Application Pages
│   │   └── utils/          # Helpers & Constants
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/         # DB & Env Config
│   │   ├── controllers/    # Route Handlers
│   │   ├── middlewares/    # Auth, Validation, Error handling
│   │   ├── models/         # Mongoose Schemas
│   │   ├── routes/         # API Endpoints
│   │   ├── services/       # Core Logic (AI, Auth, Articles, etc.)
│   │   ├── sockets/        # Socket.IO handlers
│   │   └── utils/          # Shared utilities
```

---

## 🚀 Local Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Gemini API Key ([Get it here](https://aistudio.google.com/))

### 2. Environment Variables

**Server (`server/.env`):**
```env
PORT=5001
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key
CLIENT_URL=http://localhost:5173
```

**Client (`client/.env`):**
```env
VITE_API_URL=http://localhost:5001/api/v1
```

### 3. Installation & Run

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Seed Data (Demo users & content)
cd server && npm run seed

# Run Backend
npm run dev

# Run Frontend (New terminal)
cd client && npm run dev
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@lms.com | Admin@123 |
| **Learner** | user@lms.com | User@123 |

---

## 🏥 Health Check
- **Endpoint**: `GET /api/v1/auth/me` (Requires token)
- **Status**: Returns 200 OK if the system is alive and authenticated.

---

## 🌍 Deployment

- **Frontend**: Deploy `client` folder to **Vercel** or **Netlify**. Ensure `VITE_API_URL` is set.
- **Backend**: Deploy `server` folder to **Render**, **Railway**, or **AWS EC2**.
- **Production Tip**: Use `pm2` for process management and `Nginx` as a reverse proxy on EC2.

---

## 🛠️ Troubleshooting

- **AI Errors**: If you see `429 Too Many Requests`, you have hit the Gemini Free Tier limit. The system will automatically try fallback models.
- **Socket Connection**: Ensure `CLIENT_URL` in server `.env` matches your frontend URL precisely.
- **MongoDB Connection**: If using local Mongo, ensure the service is running.
