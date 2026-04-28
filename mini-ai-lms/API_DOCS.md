# API Documentation

Base URL: `/api/v1`

## Auth Routes
- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login user, returns JWT
- `GET /auth/me` - Get current user profile (Auth required)
- `POST /auth/logout` - Logout (Client-side token clearing)

## Article Routes
- `GET /articles` - Get paginated articles
- `GET /articles/:slug` - Get article details
- `POST /articles` - Create article (Admin only)
- `PUT /articles/:id` - Update article (Admin only)
- `DELETE /articles/:id` - Delete article (Admin only)
- `POST /articles/:id/progress` - Update reading progress (Auth required)

## Assignment Routes
- `GET /assignments/article/:articleId` - Get assignment for an article
- `POST /assignments` - Create assignment (Admin only)

## Submission Routes
- `POST /submissions` - Submit assignment attempt (Auth required)
- `GET /submissions/me` - Get user's past submissions
- `GET /submissions/admin` - Get all submissions (Admin only)

## AI Routes
- `POST /ai/hint` - Generate AI hint for a question (Auth required)

## Dashboard & Leaderboard
- `GET /dashboard/me` - User stats and activity feed
- `GET /dashboard/admin` - Admin analytics
- `GET /leaderboard` - Paginated global leaderboard
