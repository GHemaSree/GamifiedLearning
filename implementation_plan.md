# Quiz Generation & Integration Plan

## Overview

Wire up the AI-powered quiz generation end-to-end:
1. **Backend** — a new `quiz.service.js` modelled after `moduleContent.service.js`, replacing the mock `generateQuiz` in `ai.service.js` with a real LLM call via `buildPrompt` + `generateResponse`.
2. **Route** — add `GET /modules/:id/generate-quiz` (or reuse the existing `GET /modules/:id/quiz` to auto-generate on first access).
3. **Database** — the existing `Quiz` model needs `explanation` and `difficulty` fields added to match the prompt output schema.
4. **Frontend** — the existing `Quiz.js` page already calls `getModuleQuiz` and `submitQuiz`; no page restructuring needed. We just need `getModuleQuiz` to trigger generation automatically.

---

## Proposed Changes

### Backend

#### [MODIFY] [Quiz.js](file:///d:/GamifiedLearning/backend/src/models/Quiz.js)
Add `explanation` and `difficulty` to the question subdocument (the prompt returns them; currently the model ignores them).

#### [NEW] [quiz.service.js](file:///d:/GamifiedLearning/backend/src/services/quiz.service.js)
New service — `getOrGenerateQuiz(studentId, moduleId)`:
- **Cache check**: `Quiz.findOne({ module: moduleId })` — return if exists (one quiz per module, currently static).
- **Load module / trail / topic** (same pattern as `moduleContent.service.js`).
- **Determine mode**: no prior `QuizAttempt` for this student → `quizDefault`, else → `quizAdaptive` with mastery snapshot.
- **Build prompt**: `buildPrompt('quizDefault'|'quizAdaptive', params)`.
- **Call LLM**: `generateResponse(prompt)`.
- **Parse**: `parseJSONObject(rawText)` → validate `questions` array.
- **Save**: `Quiz.create(...)` storing all fields including `explanation` + `difficulty`.
- **Return**: the saved quiz doc.

#### [MODIFY] [quiz.controller.js](file:///d:/GamifiedLearning/backend/src/controllers/quiz.controller.js)
Replace the `getQuizByModule` implementation to call `getOrGenerateQuiz(studentId, moduleId)` instead of `Quiz.findOne(...)` directly.

#### [MODIFY] [module.routes.js](file:///d:/GamifiedLearning/backend/src/routes/module.routes.js)
No route change needed — `GET /modules/:id/quiz` already exists and calls `getQuizByModule`.

---

### Frontend

#### [MODIFY] [moduleApi.js](file:///d:/GamifiedLearning/frontend/src/api/moduleApi.js)
`getModuleQuiz` already exists and hits `GET /modules/:id/quiz`. No change needed here — generation is now transparent.

#### [MODIFY] [Quiz.js](file:///d:/GamifiedLearning/frontend/src/pages/Quiz/Quiz.js)
- Add a **"Generating quiz…"** loading state (since the first call now triggers LLM generation, it will take a few seconds longer).
- Show a generating spinner/message distinct from the regular loading state.
- After submit, also pass `newBadges` to the Score page (it's already returned by `submitQuiz` but not forwarded).

---

## Data Flow

```
Frontend Quiz.js
  └─ getModuleQuiz(moduleId)          GET /modules/:id/quiz
       └─ getQuizByModule controller
            └─ getOrGenerateQuiz(studentId, moduleId)
                 ├─ Quiz.findOne() → return cached if exists
                 ├─ QuizAttempt.findOne() → determine mode
                 ├─ Mastery.findOne() → mastery snapshot (adaptive)
                 ├─ buildPrompt('quizDefault'|'quizAdaptive', params)
                 ├─ generateResponse(prompt) → Groq LLM
                 ├─ parseJSONObject(rawText)
                 └─ Quiz.create({ module, questions[] }) → DB
            └─ return { quizId, questions } (no correctAnswer!)
  └─ renders quiz UI (already done)
  └─ submitQuiz(quizId, answers)      POST /quiz/:id/submit
       └─ existing submitQuiz controller (unchanged)
```

---

## Verification Plan

### API test (manual, in terminal)
After implementation, test the generation endpoint:
```
GET /modules/<moduleId>/quiz   (with auth token)
```
- First call: LLM generates + stores quiz → returns questions.
- Second call: returns cached quiz instantly.

### Frontend
- Navigate to a module page → click "Take Quiz".
- First time: shows "Generating quiz…" spinner for a few seconds.
- Quiz loads with real AI-generated questions.
- Submit answers → Score page shows result.
