# TrailForge — Backend

Node.js + Express API for TrailForge. Handles authentication, and (from Week 2 onward) topics, trails, modules, and progress tracking, with a concept-level adaptive learning design built in from the start.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken) for authentication
- bcryptjs for password hashing

## Folder Structure
```
backend/
├── src/
│   ├── config/
│   │   └── db.js                       → MongoDB connection
│   ├── models/
│   │   ├── User.js                     → name, email, password, role, xp, level, streak, lastActiveDate
│   │   ├── Topic.js                    → title, description, icon, level, order, fixed concept sequence
│   │   ├── Trail.js                    → user, topic, title, status
│   │   ├── Module.js                   → trail, concept, title, content, objective, keyPoints, summary, duration, difficulty, order
│   │   ├── Progress.js                 → user, trail, module, completionStatus
│   │   └── Mastery.js                  → user, topic, concept, per-difficulty scores, currentDifficulty
│   ├── controllers/
│   │   ├── auth.controller.js          → register/login logic
│   │   ├── topic.controller.js         → topic CRUD (admin) + public list
│   │   ├── trail.controller.js         → trail generation (AI-driven) + fetch
│   │   ├── module.controller.js        → module fetch (self-only access)
│   │   └── progress.controller.js      → progress fetch (self/admin access)
│   ├── routes/
│   │   ├── auth.routes.js              → /auth/register, /auth/login, /auth/me
│   │   ├── topics.routes.js            → /topics — admin CRUD + public list
│   │   ├── trail.routes.js             → /trails — create + fetch
│   │   ├── module.routes.js            → /modules — fetch by ID
│   │   ├── progress.routes.js          → /progress — own + by userId
│   │   ├── profile.routes.js           → /profile — placeholder, full build pending
│   │   ├── quiz.routes.js              → stub, Week 3
│   │   └── recommendations.routes.js   → stub, Week 3
│   ├── middleware/
│   │   ├── auth.middleware.js          → JWT verification (protect route)
│   │   └── admin.middleware.js         → role check for admin-only routes
│   ├── services/
│   │   └── ai.service.js               → mocked bridge to the AI & Adaptive Learning layer (Gemini + DKT)
│   ├── utils/
│   │   └── generateToken.js            → JWT signing helper
│   └── server.js                       → app entry point
├── .env                                 → local secrets (not committed)
└── package.json
```

## Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend` (get real values from Bhaavya, never commit this file):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_string
```

Run it:

```bash
npm run dev
```

Server runs at `http://localhost:5000`. You should see:
```
Server running on port 5000
MongoDB Connected: ...
```

## Core Design: Two-Axis Adaptive Learning

TrailForge separates **what to teach** from **how deep to teach it** — this shapes every model below.

- **Curriculum position (fixed, backend-owned):** every Topic has an ordered list of `concepts` (e.g. for Java: Variables → Data Types → Operators → Loops → ...). This order never changes based on performance. A learner cannot skip ahead in the sequence.
- **Depth per concept (adaptive, DKT-owned):** for whichever concept a learner is currently on, difficulty (beginner / intermediate / advanced) is decided independently by DKT, based on quiz performance on that concept specifically. Mastery is tracked **per concept**, not per topic — a learner's Loops mastery has no bearing on their Recursion mastery.

Practical effect: a learner always sees the full concept roadmap for a topic upfront (from `Topic.concepts` — names only), but actual learning content (`Module` documents) is generated **incrementally, one concept at a time**, only as the learner earns their way there. A trail's `modules` array starts with just one module and grows over time — it is never fully pre-generated at trail creation.

## API Design (current + planned)

| Method | Endpoint | Auth | Purpose | Status |
|---|---|---|---|---|
| POST | `/auth/register` | No | Register a new user | ✅ Built |
| POST | `/auth/login` | No | Authenticate user and return JWT | ✅ Built |
| GET | `/auth/me` | Yes | Get logged in user profile | ✅ Built |
| GET | `/topics` | No | Fetch list of predefined topics | ✅ Built |
| POST | `/topics` | Admin | Create a new topic (with `concepts` array, `icon`, `level`) | ✅ Built |
| PUT | `/topics/{id}` | Admin | Update a topic | ✅ Built |
| DELETE | `/topics/{id}` | Admin | Delete a topic | ✅ Built |
| POST | `/trails` | Yes | Generate a trail — creates the first concept's Beginner module via the AI service | ✅ Built |
| GET | `/trails/{id}` | Self/Admin | Fetch trail details, generated modules, and the full concept roadmap | ✅ Built |
| GET | `/modules/{id}` | Self/Admin | Fetch module content | ✅ Built |
| GET | `/progress` | Yes | Get the learner's own overall progress | ✅ Built |
| GET | `/progress/{userId}` | Self/Admin | Get detailed progress per trail | ✅ Built |
| GET | `/profile` | Yes | Get profile info | 🟡 Placeholder only |
| GET | `/modules/{id}/quiz` | Yes | Fetch quiz for a module | ⏳ Week 3 |
| POST | `/quiz/{id}/submit` | Yes | Submit quiz answers, trigger DKT update, decide next module | ⏳ Week 3 |
| GET | `/recommendations` | Yes | Get personalized recommendations | ⏳ Week 3 |
| GET | `/achievements` | Yes | Fetch earned badges and XP | ⏳ Week 3 |

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
```
Authorization: Bearer <token>
```

## Data Model Reference

**Topic**
```
title, description, icon, level: "beginner"|"intermediate"|"advanced",
order, concepts: [{ name, order }], createdBy
```

**Trail**
```
user, topic, title, status: "generating" | "active" | "completed" | "failed"
```

**Module**
```
trail, concept, title, content, objective, keyPoints: [String], summary,
duration (minutes), difficulty: "beginner" | "intermediate" | "advanced", order
```

**Progress**
```
user, trail, module, completionStatus: "locked" | "in_progress" | "completed"
```

**Mastery** (one record per user, per topic, per concept)
```
user, topic, concept,
beginner: Number (0-1), intermediate: Number (0-1), advanced: Number (0-1),
currentDifficulty: "beginner" | "intermediate" | "advanced"
```
All three scores start neutral at `0.5` (cold start) when a concept is first reached, and are updated after each quiz attempt via DKT.

## AI & Adaptive Learning Layer

Per the architecture diagram, AI/DKT logic is a **separate service**, not embedded in the backend. The backend talks to it exclusively through `src/services/ai.service.js`, which currently contains a mock implementation:

- `generateModuleContent(topicTitle, concept, difficulty)` — simulates Gemini generating structured content (title, objective, keyPoints, content, summary, duration) for one concept at one difficulty tier
- `getDKTPrediction(priorMastery, difficulty, isCorrect)` — simulates DKT updating a concept's mastery scores and recommending the next difficulty

**Design note:** the DKT model is being built **concept-agnostic** — it learns only on `(difficulty, correct/incorrect)` sequences per concept, never on the concept's identity/name. This means new topics/concepts added later by an admin work immediately with the trained model, with no retraining required.

Once Sirivally's real Gemini + DKT service is live, only this one file needs to change — no other part of the backend depends on the mock vs. real distinction.

## Team Decisions (resolved)

- **Topics** are a predefined, admin-managed list with a **fixed concept sequence** and a display-only `level` tag — never reordered based on performance.
- **Curriculum order is fixed; difficulty is adaptive per concept.** DKT decides depth within a concept, never which concept comes next.
- **A learner doesn't need full mastery of every difficulty tier to advance** — crossing a "good enough" threshold on the current concept is sufficient to move to the next one in the sequence.
- **Modules are generated incrementally, one at a time** — not all upfront at trail creation — since later modules depend on how the learner performs on earlier ones.
- **Locked concepts show name only, no fabricated content or duration** — the frontend distinguishes between real generated `Module` documents (full detail) and unreached `Topic.concepts` entries (name only), merged into one display list.
- **Quiz scoring happens server-side only** — correct answers are never sent to the client in the questions payload (Week 3 implementation requirement).
- **GET /progress/{userId}**, **GET /trails/{id}**, and **GET /modules/{id}** are self-only unless the requester is an admin.
- **Admin role** is set manually in MongoDB for MVP purposes (no self-serve admin signup/promotion flow needed yet).
- **Badges and streaks are in MVP scope** — `User.streak` and `User.lastActiveDate` fields are in place; full unlock logic and increment logic land in Week 3.
- **Module completion threshold:** 85% quiz score, per the design doc — enforced in Week 3's submit logic.

## Status

- ✅ Week 1: Auth (register, login, JWT middleware, protected routes) — complete
- ✅ Week 2: Topics (with concept sequences, icon, level), Trail generation, Module fetch (with frontend-required fields), Progress tracking, Mastery model — complete
- ⏳ Week 3: Quiz + QuizAttempt models, `/quiz/:id/submit` (DKT integration, module advancement/remediation logic), XP/level updates, Badge model + unlock logic, streak increment logic, `/recommendations` (concepts to revise + suggested revision + next topics)
- ⏳ Week 4: Integration, testing, deployment

## Notes for Frontend Integration

- User identifier is MongoDB's `_id`, returned as `id` in API responses — there is no separate `user_id` field.
- The registration form's `confirmPassword` field should **not** be sent to the API — it's frontend-only validation.
- Field names are aligned: frontend's `fullName` maps to backend's `name` — resolved.
- `Topic` now includes `icon` and `level` for the Topics page's display cards.
- `Module` now includes `objective`, `keyPoints` (array), `summary`, and `duration` (minutes) — matches the Module page's content cards and duration badge — alongside the existing `concept` and `difficulty` fields.
- `POST /topics` requires an `icon`, `level`, and a `concepts` array: `[{ "name": "Variables", "order": 0 }, ...]` — any admin-facing topic creation UI needs to collect these.
- `POST /trails` returns only **one module** (the first concept, at Beginner difficulty) — not a full pre-generated list. Expect the `modules` array to grow over time as the learner progresses.
- `GET /trails/:id` returns three things: `trail`, `modules` (real generated content, full detail), and `concepts` (the full topic roadmap — name + order only). **For the Trail page's module list:** merge these — for each entry in `concepts`, show full detail if a matching `module` exists (by `concept` name), otherwise show a locked placeholder with just the concept name (no fabricated duration or content, since it hasn't been generated yet).
- The "modules" count shown on Topic cards should be read as **concept count** (`concepts.length`), not an exact generated-module count — actual module count varies per learner depending on how many difficulty tiers they cycle through per concept.
- Quiz questions (Week 3) will **not** include `correctAnswer` in the response — scoring happens entirely server-side via `POST /quiz/:id/submit`.