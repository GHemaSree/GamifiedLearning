# TrailForge — Backend

Node.js + Express API for TrailForge. Handles authentication, and (from Week 2 onward) topics, trails, modules, quizzes, and progress tracking.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken) for authentication
- bcryptjs for password hashing

## Folder Structure
backend/
├── src/
│   ├── config/
│   │   └── db.js                    → MongoDB connection
│   ├── models/
│   │   └── User.js                  → User schema (name, email, password, role, xp, level)
│   ├── controllers/
│   │   └── auth.controller.js       → register/login logic
│   ├── routes/
│   │   ├── auth.routes.js           → /auth/register, /auth/login, /auth/me
│   │   ├── topics.routes.js         → stub, Week 2 (Admin CRUD + public list)
│   │   ├── trail.routes.js          → stub, Week 2
│   │   ├── module.routes.js         → stub, Week 2
│   │   ├── quiz.routes.js           → stub, Week 3
│   │   ├── progress.routes.js       → stub, Week 3
│   │   └── recommendations.routes.js → stub, Week 3
│   ├── middleware/
│   │   └── auth.middleware.js       → JWT verification (protect route)
│   ├── utils/
│   │   └── generateToken.js         → JWT signing helper
│   └── server.js                    → app entry point
├── .env                              → local secrets (not committed)
└── package.json

> Note: `admin.middleware.js` (role-check for Topic CRUD) will be added once Topic routes are actively built in Week 2 — not needed until then.

## Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend` (get real values from Bhaavya, never commit this file):

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_string

Run it:

```bash
npm run dev
```

Server runs at `http://localhost:5000`. You should see:
Server running on port 5000
MongoDB Connected: ...

## API Design (full, per latest design doc)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Authenticate user and return JWT |
| GET | `/auth/me` | Yes | Get logged in user profile |
| GET | `/topics` | No | Fetch list of predefined topics |
| POST | `/topics` | Admin | Create a new topic |
| PUT | `/topics/{id}` | Admin | Update a topic |
| DELETE | `/topics/{id}` | Admin | Delete a topic |
| POST | `/trails` | Yes | Generate a new trail from topic input |
| GET | `/trails/{id}` | Yes | Fetch trail details |
| GET | `/modules/{id}` | Yes | Fetch module content |
| GET | `/modules/{id}/quiz` | Yes | Fetch quiz for a module |
| POST | `/quiz/{id}/submit` | Yes | Submit quiz answers and calculate score |
| GET | `/progress` | Yes | Get the learner's own overall progress |
| GET | `/progress/{userId}` | Yes (self or admin) | Get detailed progress per trail |
| GET | `/recommendations` | Yes | Get personalized recommendations |
| GET | `/achievements` | Yes | Fetch earned badges and XP — *pending scope confirmation (MVP vs Stretch)* |

**Currently implemented:** `/auth/register`, `/auth/login`, `/auth/me`. Everything else is routed as a stub returning a placeholder, to be built out Week 2–3.

**Register/Login response shape:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "learner",
    "xp": 0,
    "level": 1
  }
}
```

**Protected routes** require this header:
Authorization: Bearer <token>

## Team Decisions (resolved)

- **Topics** are a predefined, admin-managed list (per requirements doc: "select a predefined learning topic") — not user-generated. Week 2 will add a lightweight `Topic` model (`topic_id, title, description`) seeded/managed via the admin CRUD endpoints.
- **GET /progress/{userId}** is self-only unless the requester is an admin — a learner cannot view another learner's progress.
- **Admin role** is set manually in MongoDB for MVP purposes (no self-serve admin signup/promotion flow needed yet).
- **GET /achievements** is on hold pending scope clarification (MVP Core vs Stretch Goal) — not being built until confirmed.

## Status

- ✅ Week 1: Auth (register, login, JWT middleware, protected routes) — complete
- ⏳ Week 2: Topics, Trail, Module APIs, Progress model — in progress
- ⏳ Week 3: Quiz APIs, XP calculation, DKT-based recommendations
- ⏳ Week 4: Integration, testing, deployment

## Notes for Frontend Integration

- User identifier is MongoDB's `_id`, returned as `id` in API responses — there is no separate `user_id` field.
- The registration form's `confirmPassword` field should **not** be sent to the API — it's frontend-only validation.
- Map any frontend field names to match this contract exactly (e.g. `fullName` in a form → `name` in the request body).