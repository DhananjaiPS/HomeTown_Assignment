# Mini AI Learning Management System

A robust, full-stack, production-ready Learning Management System that leverages AI to enhance the learning experience. Built with a modern SaaS-style UI, it includes automated and AI-driven subjective assignment evaluation, article summarization, real-time leaderboards via Socket.IO, and more.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, TanStack Query, Axios, React Router, Socket.IO Client.
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose, Socket.IO.
- **AI Integration**: Google Gemini API (`@google/generative-ai`).
- **Security & Auth**: JWT, bcrypt, Helmet, express-rate-limit, Zod for validation.

## Features
- **User Roles**: Learner and Admin dashboards.
- **AI Tools**: Summarize articles, get hints for questions, and subjective answer grading.
- **Real-Time Leaderboard**: Live updates when students submit assignments.
- **Gamification**: Badges for milestones like First Submission, Consistency Streak, etc.
- **Caching**: Frontend state and API caching via TanStack Query.
- **Resiliency**: Graceful fallbacks for missing AI keys (mock mode) and robust error handling.

## Running Locally

1. **Clone & Setup**:
   Navigate to the repository.

2. **Database & Env Setup**:
   Create a local `.env` file in `/server` based on `.env.example`.
   Create a local `.env` file in `/client` based on `.env.example`.
   Make sure MongoDB is running locally or provide a Mongo URI.
   Provide a `GEMINI_API_KEY` (if empty, the app will run in Mock AI mode).

3. **Install Dependencies**:
   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```

4. **Seed the Database**:
   ```bash
   cd server
   npm run seed
   ```
   *Demo Credentials*:
   Admin: `admin@lms.com` / `Admin@123`
   Learner: `user@lms.com` / `User@123`

5. **Start Dev Servers**:
   Terminal 1 (Backend):
   ```bash
   cd server
   npm run dev
   ```
   Terminal 2 (Frontend):
   ```bash
   cd client
   npm run dev
   ```

## Leaderboard Logic
Rank calculation is handled entirely in MongoDB via the aggregation pipeline:
`finalRankScore = scorePercentage * 0.7 + completionRate * 0.3`
No permanent rank is stored in the DB, making it highly scalable and accurate.

## Deployment Steps
- **Backend (Render)**: Set env variables, use `npm install` and `npm start`.
- **Frontend (Vercel)**: Set Vite env variables, deploy from the `client` folder.
- **Database**: Host on MongoDB Atlas.
