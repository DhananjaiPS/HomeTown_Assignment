# Frontend Architecture & Implementation Details

This document provides an in-depth breakdown of the Frontend architecture for the Mini AI LMS. It outlines the specific demands of the project, our solutions, the folder structure, the difficulties faced, and our UI/UX optimizations.

## 1. Project Demand vs. Our Solution
**The Demand:** Build a clean, responsive, fast UI where Users can browse learning materials, submit assignments, view leaderboards, and utilize AI tools. Admins need a portal to perform CRUD operations on the content.
**Our Solution:** We built a Single Page Application (SPA) using React (Vite) and Tailwind CSS. We implemented role-based routing, real-time feedback mechanisms, and integrated Google Gemini AI seamlessly into the reading/assignment flow to provide dynamic hints and summaries.

## 2. Folder Structure & Purpose

### `/src/api`
- **Purpose:** Centralized Axios instance configuration.
- **Why it's needed:** We needed to automatically attach JWT tokens to every outgoing request and handle global 401 Unauthorized errors (e.g., logging the user out if their token expires).
- **Code Highlights:** `axios.js` sets the `Authorization` header dynamically and configures standard interceptors.

### `/src/components`
- **Purpose:** Reusable UI elements split by domain (`/admin`, `/layout`, `/common`).
- **Why it's needed:** Prevents code duplication and keeps complex pages (like the Admin portal) modular.
- **Highlights:** 
  - `Navbar.jsx`: Contains dynamic role-based links and the real-time **AI Quota Tracking Widget** showing tokens consumed vs. limits.
  - `AdminArticles.jsx`: A complex form and table component that manages draft/publish states dynamically.

### `/src/context`
- **Purpose:** React Context API (`AuthContext.jsx`).
- **Why it's needed:** Auth state (`user`, `token`, `role`) needs to be accessed globally by the Navbar, Protected Routes, and API requests without prop-drilling.

### `/src/hooks`
- **Purpose:** Custom React Query (`@tanstack/react-query`) hooks for fetching data.
- **Why it's needed:** Standard `useEffect` fetching lacks caching, background updates, and loading states. We used React Query to vastly improve performance and UX. 
- **Highlights:** `useArticles.js` and `useSubmissions.js` handle polling, mutations, and cache invalidation.

### `/src/pages`
- **Purpose:** High-level route views.
- **Why it's needed:** Represents physical pages the user navigates to.
- **Highlights:** 
  - `ArticleDetail.jsx`: The most complex page. It fetches the article, handles the "AI Magic Summary", tracks reading progress, and renders the Assignment form beneath the article. It intercepts AI 503/429 errors to display highly custom "High Demand" UI toasts instead of crashing.

### `/src/routes`
- **Purpose:** App routing logic.
- **Why it's needed:** Ensures users cannot access `/admin` or `/dashboard` unless they are authenticated and hold the proper roles. `ProtectedRoute.jsx` intercepts unauthorized access and redirects to `/login`.

## 3. Difficulties Faced & Overcome

**Difficulty 1: Markdown Rendering from AI**
- *Problem:* Gemini AI originally returned summaries containing markdown syntax (`**bold**` or `* bullets`), which rendered ugly raw text in our standard `<div>`.
- *Solution:* Instead of installing heavy markdown-parsing libraries that bloat the bundle size, we engineered the AI prompt in the backend to explicitly forbid markdown, forcing it to return perfectly structured plain-text paragraphs. The frontend then utilizes `whitespace-pre-wrap` in Tailwind to perfectly align the text.

**Difficulty 2: Handling AI API Failures Gracefully**
- *Problem:* Free AI APIs like Gemini often throw `503 Service Unavailable` or `429 Too Many Requests`. This initially crashed the frontend loading states.
- *Solution:* We built a highly robust error-catching system. If the backend detects a 503, it sends a specific emoji/string (like ⏳). The frontend intercepts this in `ArticleDetail.jsx`, skips the standard "Failed" error, and displays a friendly user-facing toast explaining that the AI is under high demand and they should try again later.

## 4. Frontend Optimizations & Scalability

- **API Caching:** By using TanStack query, repeated visits to the same article instantly load from local memory while fetching fresh data in the background.
- **Optimistic UI:** When a user clicks "Generate Hint", the button immediately enters a disabled spinner state to prevent double-submissions, ensuring a snappy feel.
- **Bundle Size:** We relied heavily on native CSS features and `lucide-react` for SVG icons rather than pulling in massive component libraries like Material UI, ensuring the application loads instantly even on slow 3G networks.
