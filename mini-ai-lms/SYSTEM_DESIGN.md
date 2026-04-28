# System Design

## Architecture
The Mini AI LMS uses a Modular Monolith architecture. The backend is separated into functional layers:
- **Controllers**: Handle HTTP requests and responses only.
- **Services**: Contain all complex business logic.
- **Models**: Define the MongoDB schemas and methods.
- **Middlewares**: Enforce authentication, rate-limiting, and validation.

## Request Flow
1. **Client** sends request (e.g., submit assignment).
2. **Rate Limiter** checks IP request limits.
3. **Route** directs to appropriate middleware.
4. **Auth Middleware** verifies JWT.
5. **Validator** checks payload against Zod schema.
6. **Controller** calls the **Service**.
7. **Service** executes logic (e.g., calculate MCQ score, call AI for short answer).
8. **Service** updates DB and calls **Socket.io** to emit events.
9. **Controller** formats the response using the `apiResponse` util.

## Real-Time Updates Flow (Socket.IO)
1. User submits an assignment.
2. Backend evaluates and saves the score.
3. Backend emits a `leaderboard:update` event to all connected sockets.
4. Frontend `useLeaderboard` hook listens for the event.
5. Frontend invalidates the TanStack query cache `['leaderboard']`.
6. TanStack automatically refetches the latest leaderboard data in the background and updates the UI seamlessly.
