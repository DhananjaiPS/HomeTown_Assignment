# API Documentation 📖

All API requests are prefixed with `/api/v1`.

---

## 🔐 Authentication
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/auth/signup` | No | - | Register a new user |
| POST | `/auth/login` | No | - | Authenticate and get JWT token |
| GET | `/auth/me` | Yes | - | Get current user profile |
| PUT | `/auth/me` | Yes | - | Update current user profile |
| POST | `/auth/logout` | No | - | Logout user |

---

## 📖 Articles
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/articles` | Yes | - | Fetch all published articles |
| GET | `/articles/:slug` | Yes | - | Get article details by slug |
| GET | `/articles/:id/ai-summary` | Yes | - | Generate or get cached AI summary |
| POST | `/articles/:id/progress` | Yes | - | Update reading progress (0-100) |
| POST | `/articles` | Yes | Admin/Author | Create a new article |
| PUT | `/articles/:id` | Yes | Admin/Author | Update an article |
| DELETE | `/articles/:id` | Yes | Admin/Author | Delete an article |

---

## ✍️ Assignments & Submissions
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/assignments/article/:articleId`| Yes | - | Get assignment for an article |
| POST | `/submissions` | Yes | - | Submit assignment for AI evaluation |
| GET | `/submissions/me` | Yes | - | Get user's submission history |
| GET | `/assignments/admin` | Yes | Admin/Author | List all assignments (Admin view) |
| POST | `/assignments` | Yes | Admin/Author | Create assignment for an article |

---

## 🤖 AI & Adaptive Learning
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/ai/chat` | Yes | - | Chat with Gemini (Support modes: Normal, Viva, etc.) |
| POST | `/ai/hint` | Yes | - | Get AI hint for a specific question |
| GET | `/adaptive/insights` | Yes | - | Get AI-generated learning insights |
| GET | `/adaptive/recommendations`| Yes | - | Get personalized content suggestions |
| GET | `/adaptive/dna` | Yes | - | Get detailed Learning DNA profile |
| POST | `/adaptive/mentor` | Yes | - | Direct chat with AI Learning Mentor |

---

## 🏆 Dashboard & Leaderboard
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/dashboard/me` | Yes | - | Get learner dashboard data |
| GET | `/dashboard/admin` | Yes | Admin | Get administrative dashboard stats |
| GET | `/leaderboard` | Yes | - | Get global student rankings |

---

## 📝 Request/Response Examples

### Submit Assignment
**POST** `/api/v1/submissions`
```json
{
  "articleId": "662f...",
  "assignmentId": "662f...",
  "answers": [
    { "questionId": "...", "selectedOption": "A" },
    { "questionId": "...", "userAnswer": "AI is the simulation of human intelligence..." }
  ],
  "timeTakenSeconds": 120
}
```

### AI Evaluation Response
```json
{
  "success": true,
  "data": {
    "submission": {
      "totalScore": 18,
      "percentage": 90,
      "status": "evaluated",
      "answers": [
        {
          "questionId": "...",
          "marksAwarded": 10,
          "aiEvaluation": {
            "score": 8,
            "feedback": "Strong explanation, but could be more concise.",
            "improvement": "Use bullet points for better clarity next time."
          }
        }
      ]
    },
    "stats": { "aiTokensUsed": 1540, "totalScore": 240 }
  }
}
```

---

## 🛡️ Rate Limiting
- Applied to all endpoints: **100 requests per 15 minutes** per IP.
- Custom limits may apply to AI endpoints to prevent abuse.
