# =============================================================
# dkt_service.py
# Single wrapper your routes import.
# Loads all models once at startup. Routes call functions here.
# =============================================================

import os
from pathlib import Path
from app.dkt.infer import (
    load_model, get_mastery, on_quiz_submit,
    decide_level, should_advance_concept,
)
from app.dkt.skills import TOPICS

# Path to folder containing .pt files
WEIGHTS_DIR = Path(__file__).parent.parent / "dkt" / "weights"

# Global model store — loaded once at server startup
_models: dict = {}


def load_all_models():
    """
    Call this once in main.py startup event.
    Loads every topic's .pt file into memory.
    """
    global _models
    print("\n[DKT] Loading models ...")
    for topic in TOPICS:
        try:
            _models[topic] = load_model(topic, WEIGHTS_DIR)
            print(f"[DKT]   OK  {topic}")
        except FileNotFoundError as e:
            print(f"[DKT]   !!  {topic} - {e}")
    print(f"[DKT] {len(_models)}/{len(TOPICS)} models loaded\n")


def get_model(topic: str):
    if topic not in _models:
        raise ValueError(
            f"No model loaded for topic '{topic}'. "
            f"Available: {list(_models.keys())}"
        )
    return _models[topic]


# ── Functions your routes call ────────────────────────────────

def compute_mastery(user_history: list, topic: str) -> dict:
    """
    Returns full mastery dict for all concepts in this topic.

    user_history: list of (concept, difficulty, correct)
                  pulled from DB ordered by timestamp ASC
    """
    return get_mastery(get_model(topic), user_history, topic)


def process_quiz_answer(
    user_history: list,
    topic:        str,
    concept:      str,
    difficulty:   str,
    results:      list,
) -> tuple:
    """
    Runs DKT after a quiz answer.
    Returns (mastery_dict, next_level).
    """
    return on_quiz_submit(
        get_model(topic), user_history, topic, concept, difficulty, results
    )


def get_next_level(mastery: dict, concept: str) -> str:
    return decide_level(mastery, concept)


def is_concept_complete(mastery: dict, concept: str) -> bool:
    return should_advance_concept(mastery, concept)
