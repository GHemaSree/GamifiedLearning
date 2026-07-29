# =============================================================
# model.py
# DKT LSTM — one model per topic.
# Used by both Colab (training) and backend (inference).
# =============================================================

import torch
import torch.nn as nn
from .skills import NUM_DIFFICULTIES, num_concepts
from .encode import input_size, output_size


class DKT(nn.Module):
    def __init__(self, topic, hidden_size=128, num_layers=1, dropout=0.2):
        super().__init__()
        self.topic       = topic
        self.in_size     = input_size(topic)
        self.out_size    = output_size(topic)
        self.hidden_size = hidden_size
        self.num_layers  = num_layers

        self.lstm    = nn.LSTM(
            input_size  = self.in_size,
            hidden_size = hidden_size,
            num_layers  = num_layers,
            batch_first = True,
            dropout     = dropout if num_layers > 1 else 0.0,
        )
        self.dropout = nn.Dropout(dropout)
        self.fc      = nn.Linear(hidden_size, self.out_size)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.sigmoid(self.fc(self.dropout(out)))

    def count_parameters(self):
        return sum(p.numel() for p in self.parameters() if p.requires_grad)
