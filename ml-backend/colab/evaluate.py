# =============================================================
# evaluate.py  — upload this to Colab and run it
# Evaluates all trained DKT models on held-out test sets.
# Reports AUC and accuracy per topic and per concept.
# =============================================================

import pickle
import torch
import numpy as np
from torch.utils.data import DataLoader
from sklearn.metrics  import roc_auc_score, accuracy_score

from model  import DKT
from encode import DKTDataset, collate_fn
from skills import (
    TOPICS, DIFFICULTIES,
    get_concepts, get_concept_to_idx,
    num_concepts, NUM_DIFFICULTIES,
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ── Load one trained model ────────────────────────────────────
def load_model(topic):
    path = f"dkt_model_{topic}.pt"
    ckpt = torch.load(path, map_location=DEVICE)
    cfg  = ckpt["config"]
    model = DKT(
        topic       = topic,
        hidden_size = cfg["hidden_size"],
        num_layers  = cfg["num_layers"],
        dropout     = cfg["dropout"],
    ).to(DEVICE)
    model.load_state_dict(ckpt["model_state"])
    model.eval()
    return model, ckpt


# ── Collect all predictions from a DataLoader ─────────────────
def collect_predictions(model, loader):
    all_preds, all_labels = [], []

    with torch.no_grad():
        for inputs, targets, masks in loader:
            inputs  = inputs.to(DEVICE)
            preds   = model(inputs).cpu().numpy()
            tgts    = targets.numpy()
            msks    = masks.numpy()

            flat_p = preds.reshape(-1)
            flat_t = tgts.reshape(-1)
            flat_m = msks.reshape(-1)
            idx    = flat_m == 1.0

            all_preds.append(flat_p[idx])
            all_labels.append(flat_t[idx])

    return np.concatenate(all_preds), np.concatenate(all_labels)


# ── Per-concept AUC and accuracy ──────────────────────────────
def per_concept_metrics(model, loader, topic):
    concepts = get_concepts(topic)
    c2i      = get_concept_to_idx(topic)
    n_c      = num_concepts(topic)

    concept_preds  = {c: [] for c in concepts}
    concept_labels = {c: [] for c in concepts}

    with torch.no_grad():
        for inputs, targets, masks in loader:
            inputs  = inputs.to(DEVICE)
            preds   = model(inputs).cpu().numpy()
            tgts    = targets.numpy()
            msks    = masks.numpy()

            for c_idx, concept in enumerate(concepts):
                for d_idx in range(NUM_DIFFICULTIES):
                    slot     = c_idx * NUM_DIFFICULTIES + d_idx
                    msk_flat = msks[:, :, slot].reshape(-1)
                    p_flat   = preds[:, :, slot].reshape(-1)
                    t_flat   = tgts[:, :, slot].reshape(-1)
                    idx      = msk_flat == 1.0
                    concept_preds[concept].extend(p_flat[idx].tolist())
                    concept_labels[concept].extend(t_flat[idx].tolist())

    results = {}
    for concept in concepts:
        labels = concept_labels[concept]
        preds  = concept_preds[concept]

        if len(set(labels)) < 2 or len(labels) < 5:
            results[concept] = None
            continue

        auc = roc_auc_score(labels, preds)
        acc = accuracy_score(labels, (np.array(preds) >= 0.5).astype(int))
        results[concept] = {"auc": auc, "accuracy": acc, "samples": len(labels)}

    return results


# ── Evaluate one topic ────────────────────────────────────────
def evaluate_topic(topic, test_seqs):
    print(f"\n── {topic.upper()} {'─' * (48 - len(topic))}")

    try:
        model, ckpt = load_model(topic)
    except FileNotFoundError:
        print(f"  [!] dkt_model_{topic}.pt not found — skipping")
        return None

    test_ds = DKTDataset(test_seqs, topic)
    loader  = DataLoader(
        test_ds, batch_size=64,
        shuffle=False, collate_fn=collate_fn
    )

    preds, labels = collect_predictions(model, loader)

    if len(set(labels)) < 2:
        print("  [!] Not enough label variety for AUC")
        return None

    auc = roc_auc_score(labels, preds)
    acc = accuracy_score(labels, (preds >= 0.5).astype(int))

    print(f"  Model epoch   : {ckpt['epoch']}")
    print(f"  Val loss      : {ckpt['val_loss']:.6f}")
    print(f"  Test samples  : {len(labels):,}")
    print(f"  Overall AUC   : {auc:.4f}   {'✓ good' if auc >= 0.70 else '✗ below target'}")
    print(f"  Overall Acc   : {acc:.4f}")

    # Per-concept breakdown
    print(f"\n  Per-concept metrics:")
    print(f"  {'Concept':<30} {'AUC':>6}  {'Acc':>6}  {'Samples':>8}  Chart")
    print(f"  {'─'*70}")

    concept_results = per_concept_metrics(model, loader, topic)
    valid = [(c, r) for c, r in concept_results.items() if r is not None]
    valid.sort(key=lambda x: x[1]["auc"], reverse=True)

    for concept, r in valid:
        bar = "█" * int(r["auc"] * 20)
        print(f"  {concept:<30} {r['auc']:>6.4f}  {r['accuracy']:>6.4f}  "
              f"{r['samples']:>8,}  {bar}")

    skipped = [c for c, r in concept_results.items() if r is None]
    if skipped:
        print(f"\n  Skipped (not enough data): {skipped}")

    if valid:
        mean_auc = np.mean([r["auc"] for _, r in valid])
        mean_acc = np.mean([r["accuracy"] for _, r in valid])
        print(f"\n  Mean concept AUC : {mean_auc:.4f}")
        print(f"  Mean concept Acc : {mean_acc:.4f}")

    return {"auc": auc, "accuracy": acc}


# ── Main — evaluate all topics ────────────────────────────────
def evaluate():
    print(f"[Device] {DEVICE}\n")
    print("Loading test sequences from test_sequences.pkl ...")

    try:
        with open("test_sequences.pkl", "rb") as f:
            test_store = pickle.load(f)
        print(f"Found {len(test_store)} topics in test set\n")
    except FileNotFoundError:
        print("[!] test_sequences.pkl not found.")
        print("    This file is generated by train.py — did training complete?")
        return

    summary = {}
    for topic, test_seqs in test_store.items():
        result = evaluate_topic(topic, test_seqs)
        if result:
            summary[topic] = result

    # ── Overall summary table ─────────────────────────────────
    if summary:
        print(f"\n\n{'='*60}")
        print(f"  SUMMARY — all topics")
        print(f"{'='*60}")
        print(f"  {'Topic':<45} {'AUC':>6}  {'Acc':>6}")
        print(f"  {'─'*58}")

        for topic, r in sorted(summary.items(),
                                key=lambda x: x[1]["auc"],
                                reverse=True):
            flag = " ✓" if r["auc"] >= 0.70 else " ✗"
            print(f"  {topic:<45} {r['auc']:>6.4f}  "
                  f"{r['accuracy']:>6.4f}{flag}")

        all_aucs = [r["auc"] for r in summary.values()]
        all_accs = [r["accuracy"] for r in summary.values()]
        print(f"  {'─'*58}")
        print(f"  {'MEAN':<45} {np.mean(all_aucs):>6.4f}  "
              f"{np.mean(all_accs):>6.4f}")
        print(f"  {'─'*58}")
        print(f"\n  Topics ≥ 0.70 AUC : "
              f"{sum(1 for a in all_aucs if a >= 0.70)}/{len(all_aucs)}")


if __name__ == "__main__":
    evaluate()
