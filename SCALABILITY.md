# Scalability Considerations

## MongoDB Schema Decisions
- **References over Embedded Arrays**: Submissions, ReadingProgress, and Activity are stored in separate collections rather than embedded within the User or Article documents. This prevents unbounded array growth, which is a common MongoDB anti-pattern leading to 16MB document limit errors and slow queries.
- **Denormalized Stats**: Basic user stats (totalScore, assignmentsAttempted) are denormalized onto the User model. This makes rendering the Dashboard extremely fast, avoiding expensive aggregations on every page load. The source of truth remains the Submissions collection.

## Leaderboard Aggregation
The leaderboard does not store permanent ranks. Instead, it uses a MongoDB Aggregation Pipeline to dynamically calculate the rank based on a complex formula (`0.7 * score + 0.3 * completion rate`).
- **Why?** Storing ranks permanently would require recalculating every user's rank whenever one user submits an assignment, causing massive write loads. Aggregation calculates it on the fly efficiently.
- **Scaling further**: If the user base grows > 100k, this aggregation will become slow. The next step is to cache the aggregation results in **Redis** and only run the pipeline periodically via a cron job, or use a Redis Sorted Set (ZSET) for instant rank queries.

## Caching Strategy
- **TanStack Query (Client-side)**: Aggressively caches API responses (articles, dashboards). Reduces backend load by fulfilling identical requests from the local cache.
- **AI Summary Caching**: The AI summary result is stored on the Article document. This saves significant latency and API costs since the AI model only needs to be called once per article.

## Heavy AI Evaluations
Currently, AI evaluation happens synchronously during the request cycle.
- **Future Scale**: If the AI API takes > 10 seconds or fails under load, the request will timeout.
- **Solution**: Move evaluations to a background Queue (e.g., BullMQ + Redis). Return a "processing" status immediately to the frontend. The frontend can use WebSockets to listen for the "evaluation_complete" event.
