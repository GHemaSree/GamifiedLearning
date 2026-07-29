# =============================================================
# simulate.py — run this in Colab FIRST
# Generates synthetic student interaction dataset.
# Supports all 25 TrailForge topics automatically.
# Output: dkt_dataset.csv
# =============================================================

import numpy as np
import pandas as pd
import random
from skills import (
    TOPICS, DIFFICULTIES, DIFFICULTY_THRESHOLD,
    TOPIC_DIFFICULTY, get_concepts,
)

random.seed(42)
np.random.seed(42)

NUM_STUDENTS       = 2000
STEPS_PER_TOPIC    = (20, 50)
ABILITY_NOISE      = 0.15
ABILITY_GAIN       = 0.04
ABILITY_DROP       = 0.01
TOPICS_PER_STUDENT = 3        # each student picks 3 topics
OUTPUT_PATH        = "dkt_dataset.csv"

# Starting ability mean per topic difficulty tier
# Beginner topics → students start with higher ability (easier)
# Advanced topics → students start lower (harder)
TIER_ABILITY_MEAN = {
    "beginner":     0.30,
    "intermediate": 0.00,
    "advanced":    -0.30,
}

PERSONAS = [
    {"name": "fast_learner",    "ability_boost":  0.40, "improvement": (0.06, 0.12), "drop": (0.01, 0.02), "weight": 0.25},
    {"name": "average_learner", "ability_boost":  0.00, "improvement": (0.03, 0.07), "drop": (0.02, 0.04), "weight": 0.50},
    {"name": "slow_learner",    "ability_boost": -0.30, "improvement": (0.02, 0.05), "drop": (0.03, 0.06), "weight": 0.25},
]


def p_correct(ability, difficulty):
    threshold = DIFFICULTY_THRESHOLD[difficulty]
    logit     = (ability - threshold) * 2.5
    return float(1 / (1 + np.exp(-logit)))


def pick_difficulty(ability):
    if ability < -0.3:   weights = [0.80, 0.18, 0.02]
    elif ability < 0.2:  weights = [0.35, 0.55, 0.10]
    elif ability < 0.6:  weights = [0.15, 0.55, 0.30]
    else:                weights = [0.05, 0.35, 0.60]
    return random.choices(DIFFICULTIES, weights=weights)[0]


def simulate_student_topic(student_id, topic, persona):
    concepts   = get_concepts(topic)
    tier       = TOPIC_DIFFICULTY[topic]
    base_mean  = TIER_ABILITY_MEAN[tier] + persona["ability_boost"]

    # Independent ability per concept
    ability = {
        c: np.clip(np.random.normal(base_mean, 0.30), -1.5, 1.5)
        for c in concepts
    }

    n_steps     = random.randint(*STEPS_PER_TOPIC)
    rows        = []
    concept_ptr = 0

    for step in range(n_steps):
        lo      = max(0, concept_ptr - 2)
        hi      = min(len(concepts) - 1, concept_ptr + 1)
        concept = concepts[random.randint(lo, hi)]

        difficulty = pick_difficulty(ability[concept])
        pc         = p_correct(ability[concept], difficulty)
        pc         = np.clip(pc + np.random.normal(0, ABILITY_NOISE), 0.02, 0.98)
        correct    = int(random.random() < pc)

        if correct:
            ability[concept] = min(1.5, ability[concept] + random.uniform(*persona["improvement"]))
        else:
            ability[concept] = max(-1.5, ability[concept] - random.uniform(*persona["drop"]))

        if (concept_ptr < len(concepts) - 1
                and ability[concepts[concept_ptr]] > 0.4):
            concept_ptr += 1

        rows.append({
            "student_id": student_id,
            "topic":      topic,
            "concept":    concept,
            "difficulty": difficulty,
            "correct":    correct,
            "step":       step,
        })
    return rows


def generate_dataset():
    all_rows    = []
    topic_list  = list(TOPICS.keys())
    p_weights   = [p["weight"] for p in PERSONAS]

    print(f"Simulating {NUM_STUDENTS} students across {len(topic_list)} topics ...")
    print(f"Each student picks {TOPICS_PER_STUDENT} topics randomly.\n")

    for sid in range(NUM_STUDENTS):
        persona = random.choices(PERSONAS, weights=p_weights)[0]
        topics  = random.sample(topic_list, k=min(TOPICS_PER_STUDENT, len(topic_list)))
        for topic in topics:
            all_rows.extend(simulate_student_topic(sid, topic, persona))
        if (sid + 1) % 500 == 0:
            print(f"  {sid+1}/{NUM_STUDENTS} students done ...")

    df = pd.DataFrame(all_rows)
    print(f"\n✓ Generated {len(df):,} total interactions")
    return df


def print_stats(df):
    print(f"\n── Dataset summary ─────────────────────────────────────")
    print(f"  Students    : {df['student_id'].nunique():,}")
    print(f"  Total rows  : {len(df):,}")
    print(f"  Topics      : {df['topic'].nunique()}")
    print(f"  Avg correct : {df['correct'].mean()*100:.1f}%")

    print(f"\n  Correct rate by difficulty:")
    for d in DIFFICULTIES:
        r   = df[df["difficulty"] == d]["correct"].mean()
        bar = "█" * int(r * 25)
        print(f"    {d:>14}: {r*100:5.1f}%  {bar}")

    print(f"\n  Rows per topic (top 10):")
    counts = df.groupby("topic").size().sort_values(ascending=False).head(10)
    for topic, n in counts.items():
        print(f"    {topic:<45} {n:,}")
    print(f"────────────────────────────────────────────────────────")


if __name__ == "__main__":
    df = generate_dataset()
    print_stats(df)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"\n✓ Saved → {OUTPUT_PATH}")

    print("\nSample (student 0, first available topic, first 10 rows):")
    first_topic = df[df["student_id"] == 0]["topic"].iloc[0]
    sample = df[(df["student_id"]==0) & (df["topic"]==first_topic)].head(10)
    print(sample.to_string(index=False))
