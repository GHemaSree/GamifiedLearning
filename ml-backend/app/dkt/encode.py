# =============================================================
# encode.py
# Converts (concept, difficulty, correct) into tensors.
# Used by both Colab (training) and backend (inference).
# =============================================================

import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset
from .skills import (
    DIFFICULTIES, DIFFICULTY_TO_IDX, NUM_DIFFICULTIES,
    get_concepts, get_concept_to_idx, num_concepts,
)

MAX_SEQ_LEN = 60


def input_size(topic):
    return num_concepts(topic) + NUM_DIFFICULTIES + 1

def output_size(topic):
    return num_concepts(topic) * NUM_DIFFICULTIES


def encode_interaction(concept, difficulty, correct, concept_to_idx, n_concepts):
    vec = np.zeros(n_concepts + NUM_DIFFICULTIES + 1, dtype=np.float32)
    if concept in concept_to_idx:
        vec[concept_to_idx[concept]] = 1.0
    if difficulty in DIFFICULTY_TO_IDX:
        vec[n_concepts + DIFFICULTY_TO_IDX[difficulty]] = 1.0
    vec[n_concepts + NUM_DIFFICULTIES] = float(correct)
    return vec


def encode_sequence(interactions, topic):
    T   = len(interactions)
    c2i = get_concept_to_idx(topic)
    n_c = num_concepts(topic)

    if T < 2:
        return None, None, None

    inputs  = np.zeros((T-1, input_size(topic)),  dtype=np.float32)
    targets = np.zeros((T-1, output_size(topic)), dtype=np.float32)
    masks   = np.zeros((T-1, output_size(topic)), dtype=np.float32)

    for t in range(T-1):
        c, d, cor = interactions[t]
        inputs[t] = encode_interaction(c, d, cor, c2i, n_c)

        c_next, d_next, cor_next = interactions[t+1]
        if c_next in c2i:
            idx = c2i[c_next] * NUM_DIFFICULTIES + DIFFICULTY_TO_IDX[d_next]
            targets[t, idx] = float(cor_next)
            masks[t, idx]   = 1.0

    return inputs, targets, masks


def build_sequences(df):
    sequences = {}
    for topic in df["topic"].unique():
        tdf  = df[df["topic"] == topic].sort_values(["student_id", "step"])
        seqs = []
        for sid, grp in tdf.groupby("student_id"):
            interactions = list(zip(grp["concept"],
                                    grp["difficulty"],
                                    grp["correct"]))
            if len(interactions) >= 2:
                seqs.append((sid, interactions))
        sequences[topic] = seqs
        print(f"  {topic}: {len(seqs)} sequences")
    return sequences


class DKTDataset(Dataset):
    def __init__(self, sequences, topic):
        self.samples = []
        skipped = 0
        for sid, interactions in sequences:
            if len(interactions) > MAX_SEQ_LEN + 1:
                interactions = interactions[:MAX_SEQ_LEN + 1]
            inp, tgt, msk = encode_sequence(interactions, topic)
            if inp is None:
                skipped += 1
                continue
            self.samples.append((
                torch.tensor(inp, dtype=torch.float32),
                torch.tensor(tgt, dtype=torch.float32),
                torch.tensor(msk, dtype=torch.float32),
            ))
        print(f"  [{topic}] {len(self.samples)} samples ({skipped} skipped)")

    def __len__(self):   return len(self.samples)
    def __getitem__(self, i): return self.samples[i]


def collate_fn(batch):
    inputs, targets, masks = zip(*batch)
    max_len = max(x.shape[0] for x in inputs)
    def pad(tensors):
        out = torch.zeros(len(tensors), max_len, tensors[0].shape[1])
        for i, t in enumerate(tensors):
            out[i, :t.shape[0]] = t
        return out
    return pad(inputs), pad(targets), pad(masks)
