# Frontend Architecture 🖥️

The frontend is a high-performance Single Page Application (SPA) built with **React 18** and **Vite**, prioritizing speed, premium aesthetics, and real-time interactivity.

---

## 🏗️ Structure & Organization
- **Component-Driven Development**: UI is broken into reusable components (Admin, Chatbot, Dashboard, Layout).
- **Page-Based Routing**: Managed by **React Router Dom v6**.
- **Context API**: Handles global state for **Authentication** and **Theme**.

---

## 🚀 Data Fetching & State Management

### TanStack Query (React Query)
The application uses React Query for all server-state management:
- **Caching**: Automatic caching of articles and dashboard data.
- **Optimistic Updates**: UI feels snappy by updating states while background sync happens.
- **Mutations**: Handles complex AI requests (Summarization, Hints) with loading states and error handling.

### Custom Hooks
Business logic is abstracted into custom hooks for clean component code:
- `useAuth`: Handles login, signup, and user persistence.
- `useAIChat`: Manages the chatbot state, modes, and API calls.
- `useArticles/useAssignments`: Encapsulates CRUD and progress logic.

---

## 🎨 UI & UX Design
- **Tailwind CSS**: Utility-first styling for a custom, premium look.
- **Premium Aesthetics**: Use of glassmorphism, smooth gradients, and micro-animations (via CSS transitions).
- **Responsive Layouts**: Fully optimized for Mobile, Tablet, and Desktop.
- **Lucide Icons**: Consistent, modern iconography throughout the platform.

---

## 🤖 AI Interaction UI
- **Chatbot Window**: A floating, multi-mode chat interface with support for Markdown rendering (for code and formatted text).
- **Smart Progress Bars**: Visualizes reading progress and assignment scores.
- **AI Feedback Cards**: Displays Gemini-generated feedback with color-coded sentiment (Success/Improvement).

---

## 📡 Real-Time Integration
- **Socket.IO Client**: Listens for `leaderboard:update` events to keep rankings fresh without page reloads.
- **Hot Toasts**: Integrated with `react-hot-toast` for non-intrusive real-time notifications.

---

## 🛠️ Performance Optimization
- **Vite Bundling**: Fast builds and optimized asset delivery.
- **Lazy Loading**: (Planned) Code splitting for large routes.
- **Stale-While-Revalidate**: Ensures users see data instantly while fresh data is fetched.
