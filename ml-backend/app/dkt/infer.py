# =============================================================
# infer.py  — lives in your backend
# Loads trained .pt files and runs mastery inference.
# Does NOT need GPU. Runs on any CPU.
# =============================================================

import os
import torch
import numpy as np
from .model  import DKT
from .encode import encode_interaction
from .skills import (
    TOPICS, DIFFICULTIES, DIFFICULTY_TO_IDX,
    get_concepts, get_concept_to_idx, num_concepts,
    NUM_DIFFICULTIES,
)

DEVICE = torch.device("cpu")   # CPU is fine for inference


def load_model(topic: str, weights_dir: str) -> DKT:
    """
    Loads a trained DKT model from a .pt file.

    Args:
        topic:       e.g. "java"
        weights_dir: path to folder containing .pt files

    Returns:
        loaded DKT model ready for inference
    """
    path = os.path.join(weights_dir, f"dkt_model_{topic}.pt")

    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Model file not found: {path}\n"
            f"Did you download the .pt file from Colab and paste it here?"
        )

    ckpt  = torch.load(path, map_location=DEVICE)
    cfg   = ckpt["config"]
    model = DKT(
        topic       = topic,
        hidden_size = cfg["hidden_size"],
        num_layers  = cfg["num_layers"],
        dropout     = cfg["dropout"],
    ).to(DEVICE)
    model.load_state_dict(ckpt["model_state"])
    model.eval()
    return model


def get_mastery(model: DKT, history: list, topic: str) -> dict:
    """
    Returns per-concept per-difficulty mastery scores.

    Args:
        model:   loaded DKT model for this topic
        history: list of (concept, difficulty, correct) tuples
                 ordered oldest → newest
        topic:   e.g. "java"

    Returns:
        {
          "loops":     { "beginner": 0.88, "intermediate": 0.61, "advanced": 0.29 },
          "recursion": { "beginner": 0.50, "intermediate": 0.50, "advanced": 0.50 },
          ...
        }
    """
    concepts = get_concepts(topic)
    c2i      = get_concept_to_idx(topic)
    n_c      = num_concepts(topic)

    # Cold start — return neutral prior
    if len(history) == 0:
        return {c: {d: 0.50 for d in DIFFICULTIES} for c in concepts}

    # Encode history into tensor
    encoded = np.array(
        [encode_interaction(c, d, cor, c2i, n_c) for c, d, cor in history],
        dtype=np.float32,
    )
    x = torch.tensor(encoded).unsqueeze(0)   # (1, T, input_size)

    with torch.no_grad():
        output = model(x)   # (1, T, output_size)

    # Read last timestep — most current estimate
    last   = output[0, -1, :].numpy()                  # (n_concepts * 3,)
    matrix = last.reshape(n_c, NUM_DIFFICULTIES)        # (n_concepts, 3)

    result = {}
    for c_idx, concept in enumerate(concepts):
        result[concept] = {
            diff: float(round(matrix[c_idx, d_idx], 4))
            for d_idx, diff in enumerate(DIFFICULTIES)
        }

    return result


def decide_level(mastery: dict, concept: str) -> str:
    """
    Decides the difficulty level for the next module
    based on mastery scores for a concept.

    Thresholds:
      intermediate < 0.40 → beginner
      intermediate < 0.75 → intermediate
      intermediate ≥ 0.75 → advanced
    """
    scores = mastery.get(concept, {d: 0.5 for d in DIFFICULTIES})
    mid    = scores["intermediate"]

    if mid < 0.40:   return "beginner"
    elif mid < 0.75: return "intermediate"
    else:            return "advanced"


def should_advance_concept(mastery: dict, concept: str) -> bool:
    """
    Returns True when student has mastered this concept
    enough to move to the next one in the curriculum.
    Advanced mastery ≥ 0.75 = concept complete.
    """
    return mastery.get(concept, {}).get("advanced", 0.0) >= 0.75


def on_quiz_submit(
    model:      DKT,
    history:    list,
    topic:      str,
    concept:    str,
    difficulty: str,
    results:    list,
) -> tuple:
    """
    Main function called by your quiz route after every quiz.

    Args:
        model:      DKT model for this topic
        history:    (concept, difficulty, correct) list BEFORE this answer batch
        topic:      "java" | "python" | "sql"
        concept:    "loops" | "recursion" | ...
        difficulty: "beginner" | "intermediate" | "advanced"
        results:    list of 1s and 0s for each question

    Returns:
        mastery    full mastery dict (all concepts)
        next_level "beginner" | "intermediate" | "advanced"
    """
    updated_history = history.copy()
    for res in results:
        updated_history.append((concept, difficulty, res))
    mastery         = get_mastery(model, updated_history, topic)
    next_level      = decide_level(mastery, concept)
    return mastery, next_level
