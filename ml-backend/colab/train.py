# =============================================================
# train.py  — run this in Colab SECOND
# Trains one DKT model per topic.
# Downloads: dkt_model_<topic>.pt  for each topic
# =============================================================

import json
import time
import random
import pickle
import torch
import torch.nn as nn
import pandas as pd
from torch.utils.data import DataLoader

from skills import TOPICS
from encode import build_sequences, DKTDataset, collate_fn
from model  import DKT

CONFIG = {
    "hidden_size":   128,
    "num_layers":    1,
    "dropout":       0.2,
    "learning_rate": 0.001,
    "batch_size":    64,
    "epochs":        40,
    "val_split":     0.10,
    "test_split":    0.10,
    "patience":      6,
    "dataset_path":  "dkt_dataset.csv",
    "log_path":      "training_log.json",
}

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def student_split(sequences, val_frac=0.10, test_frac=0.10):
    ids = list({sid for sid, _ in sequences})
    random.shuffle(ids)
    n       = len(ids)
    n_test  = max(1, int(n * test_frac))
    n_val   = max(1, int(n * val_frac))
    n_train = n - n_val - n_test
    train_ids = set(ids[:n_train])
    val_ids   = set(ids[n_train:n_train+n_val])
    test_ids  = set(ids[n_train+n_val:])
    return (
        [(s, q) for s, q in sequences if s in train_ids],
        [(s, q) for s, q in sequences if s in val_ids],
        [(s, q) for s, q in sequences if s in test_ids],
    )


def run_epoch(model, loader, optimizer, loss_fn, training=True):
    model.train() if training else model.eval()
    total_loss, total_items = 0.0, 0
    ctx = torch.enable_grad() if training else torch.no_grad()
    with ctx:
        for inputs, targets, masks in loader:
            inputs, targets, masks = (
                inputs.to(DEVICE), targets.to(DEVICE), masks.to(DEVICE)
            )
            preds = model(inputs)
            loss  = loss_fn(preds * masks, targets * masks)
            if training:
                optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                optimizer.step()
            n            = masks.sum().item()
            total_loss  += loss.item() * n
            total_items += n
    return total_loss / total_items if total_items > 0 else 0.0


def train_topic(topic, sequences):
    print(f"\n{'='*50}")
    print(f"  TOPIC: {topic.upper()}")
    print(f"{'='*50}")

    train_s, val_s, test_s = student_split(sequences)
    print(f"  train={len(train_s)} val={len(val_s)} test={len(test_s)}")

    train_ds = DKTDataset(train_s, topic)
    val_ds   = DKTDataset(val_s,   topic)

    train_loader = DataLoader(train_ds, batch_size=CONFIG["batch_size"],
                              shuffle=True,  collate_fn=collate_fn)
    val_loader   = DataLoader(val_ds,   batch_size=CONFIG["batch_size"],
                              shuffle=False, collate_fn=collate_fn)

    model = DKT(topic=topic, hidden_size=CONFIG["hidden_size"],
                num_layers=CONFIG["num_layers"],
                dropout=CONFIG["dropout"]).to(DEVICE)

    print(f"\n  in={model.in_size} → hidden={model.hidden_size} "
          f"→ out={model.out_size}  params={model.count_parameters():,}\n")

    optimizer = torch.optim.Adam(model.parameters(), lr=CONFIG["learning_rate"])
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, patience=3, factor=0.5, verbose=False)
    loss_fn   = nn.BCELoss()

    best_val  = float("inf")
    patience  = 0
    log       = {"train_loss": [], "val_loss": []}

    print(f"  {'Epoch':>5}  {'Train':>10}  {'Val':>10}  {'Time':>6}")
    print(f"  {'─'*36}")

    for epoch in range(1, CONFIG["epochs"]+1):
        t0   = time.time()
        tr   = run_epoch(model, train_loader, optimizer, loss_fn, True)
        val  = run_epoch(model, val_loader,   optimizer, loss_fn, False)
        scheduler.step(val)
        log["train_loss"].append(round(tr, 6))
        log["val_loss"].append(round(val, 6))

        marker = " ✓" if val < best_val else ""
        print(f"  {epoch:>5}  {tr:>10.6f}  {val:>10.6f}  "
              f"{time.time()-t0:>5.1f}s{marker}")

        if val < best_val:
            best_val = val
            patience = 0
            path     = f"dkt_model_{topic}.pt"
            torch.save({
                "epoch": epoch, "topic": topic,
                "model_state": model.state_dict(),
                "config": CONFIG, "val_loss": val,
            }, path)
        else:
            patience += 1
            if patience >= CONFIG["patience"]:
                print(f"\n  Early stop at epoch {epoch}")
                break

    print(f"\n  Best val loss: {best_val:.6f}")
    print(f"  Saved: dkt_model_{topic}.pt")
    return log, test_s


def train():
    print(f"Device: {DEVICE}\n")
    df = pd.read_csv(CONFIG["dataset_path"])
    print(f"Loaded {len(df):,} rows from {CONFIG['dataset_path']}\n")

    print("Building sequences ...")
    all_sequences = build_sequences(df)

    full_log   = {}
    test_store = {}

    for topic, sequences in all_sequences.items():
        log, test_s         = train_topic(topic, sequences)
        full_log[topic]     = log
        test_store[topic]   = test_s

    with open(CONFIG["log_path"], "w") as f:
        json.dump(full_log, f)
    with open("test_sequences.pkl", "wb") as f:
        pickle.dump(test_store, f)

    print(f"\n✓ All topics trained.")
    print(f"  training_log.json saved")
    print(f"  test_sequences.pkl saved")


if __name__ == "__main__":
    train()
