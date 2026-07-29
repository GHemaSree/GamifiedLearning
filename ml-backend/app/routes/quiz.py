# =============================================================
# routes/quiz.py
# POST /quiz/submit  — fires DKT after every quiz answer
# Now wired to real MongoDB via app.db
# =============================================================

from datetime import datetime, timezone
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.dkt_service import process_quiz_answer, is_concept_complete
from app.dkt.skills import get_concepts
from app.db import get_db

router = APIRouter(prefix="/quiz", tags=["quiz"])


class QuizSubmit(BaseModel):
    user_id:    str
    topic:      str
    concept:    str
    difficulty: str
    correct:    int   # 1 = correct, 0 = wrong


def find_matching_concept(incoming_concept: str, available_concepts: list) -> str:
    """
    Fuzzy matches incoming concept name against skills.py concept list.
    """
    if incoming_concept in available_concepts:
        return incoming_concept

    def norm(s: str) -> str:
        s = s.lower().replace('&', 'and')
        return re.sub(r'[^a-z0-9]', '', s)

    incoming_norm = norm(incoming_concept)

    # 1. Normalized exact match
    for c in available_concepts:
        if norm(c) == incoming_norm:
            return c

    # 2. Normalized prefix/inclusion match
    for c in available_concepts:
        c_norm = norm(c)
        if c_norm in incoming_norm or incoming_norm in c_norm:
            return c

    # Fallback to first concept
    return available_concepts[0] if available_concepts else incoming_concept


@router.post("/submit")
async def submit_quiz(payload: QuizSubmit):
    """
    Called by the Node.js backend when a student submits a quiz answer.

    Steps:
    1. Resolve normalized concept name matching skills.py definition
    2. Save interaction to MongoDB (quiz_interactions collection)
    3. Pull full interaction history for this user+topic (ordered by timestamp ASC)
    4. Run DKT inference → mastery + next_level
    5. Return result; Node.js backend writes the authoritative Mastery document
    """

    db = get_db()

    # ── Step 0: Resolve Concept Mapping ──────────────────────────────────────
    try:
        concepts = get_concepts(payload.topic)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    matched_concept = find_matching_concept(payload.concept, concepts)

    # ── Step 1: Save this interaction ────────────────────────────────────────
    db["quiz_interactions"].insert_one({
        "user_id":    payload.user_id,
        "topic":      payload.topic,
        "concept":    matched_concept,
        "difficulty": payload.difficulty,
        "correct":    payload.correct,
        "timestamp":  datetime.now(timezone.utc),
    })

    # ── Step 2: Pull full interaction history (oldest first) ─────────────────
    rows = list(
        db["quiz_interactions"]
        .find(
            {"user_id": payload.user_id, "topic": payload.topic},
            {"_id": 0, "concept": 1, "difficulty": 1, "correct": 1},
        )
        .sort("timestamp", 1)   # ascending = oldest first
    )

    # history BEFORE this answer (all rows including the one just inserted,
    # but process_quiz_answer appends the current answer internally)
    # We pass history EXCLUDING the last item (the one we just inserted)
    # so DKT gets the pre-answer history and appends the new one itself.
    user_history = [
        (r["concept"], r["difficulty"], r["correct"])
        for r in rows[:-1]   # all but the last (just inserted) interaction
    ]

    # ── Step 3: Run DKT inference ─────────────────────────────────────────────
    try:
        mastery, next_level = process_quiz_answer(
            user_history = user_history,
            topic        = payload.topic,
            concept      = matched_concept,
            difficulty   = payload.difficulty,
            correct      = payload.correct,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # ── Step 4: Check if concept is mastered ──────────────────────────────────
    concept_complete = is_concept_complete(mastery, matched_concept)

    # ── Step 5: XP calculation (mirrors Node.js logic) ────────────────────────
    xp_map = {"beginner": 10, "intermediate": 20, "advanced": 30}
    xp     = xp_map.get(payload.difficulty, 10) if payload.correct else 5

    # ── Step 6: Return to Node.js backend ─────────────────────────────────────
    return {
        "xp_earned":        xp,
        "next_level":       next_level,
        "concept_complete": concept_complete,
        "mastery":          mastery[matched_concept],   # just this concept's scores
        "full_mastery":     mastery,                    # all concepts in topic
    }
