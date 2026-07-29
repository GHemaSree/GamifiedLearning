# TrailForge — ML Backend

Python/FastAPI service powering adaptive learning via Deep Knowledge Tracing (DKT).

## Tech Stack

- **FastAPI** — REST API framework
- **PyTorch** — DKT LSTM inference (CPU, no GPU needed)
- **Anthropic Claude** — lesson content generation
- **Uvicorn** — ASGI server

## Folder Structure

```
ml-backend/
├── app/                        ← FastAPI application package
│   ├── main.py                 ← Entry point (FastAPI app, CORS, startup)
│   ├── dkt/                    ← DKT inference package
│   │   ├── model.py            ← LSTM model architecture
│   │   ├── encode.py           ← Interaction → tensor encoding
│   │   ├── infer.py            ← Mastery inference functions
│   │   ├── skills.py           ← Topic/concept/difficulty definitions
│   │   └── weights/            ← Trained .pt model files (one per topic)
│   ├── routes/
│   │   ├── quiz.py             ← POST /quiz/submit (DKT inference after quiz)
│   │   └── module.py           ← GET /module/{user_id}/{topic} (Claude lesson)
│   └── services/
│       └── dkt_service.py      ← Single wrapper: loads models, exposes functions to routes
├── colab/                      ← Training code (Google Colab compatible, bare imports)
│   ├── TrailForge_Train.ipynb  ← Main training notebook
│   ├── model.py                ← Same architecture as app/dkt/model.py
│   ├── encode.py               ← Encoding utilities
│   ├── skills.py               ← Topic/concept/difficulty definitions
│   ├── train.py                ← Training loop
│   ├── simulate.py             ← Synthetic data generation
│   └── evaluate.py             ← Evaluation utilities
├── requirements.txt
├── .env.example
└── .gitignore
```

> **Note:** `colab/` files use bare imports (`from skills import ...`) intentionally — they run flat in Google Colab. Do not add relative imports there. `app/dkt/` uses proper relative imports for package compatibility.

## Setup

```bash
cd ml-backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment
copy .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

## Running the Server

```bash
# From the ml-backend/ directory
uvicorn app.main:app --reload --port 8000
```

Server starts at `http://localhost:8000`. On startup you'll see:

```
[DKT] Loading models ...
[DKT]   ✓ python_fundamentals
[DKT]   ✓ javascript_basics
...
[DKT] 20/20 models loaded
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/quiz/submit` | Run DKT inference after a quiz answer |
| GET | `/module/{user_id}/{topic}` | Generate a lesson via Claude |

## Model Weights

Trained `.pt` files live in `app/dkt/weights/`. One file per topic, named `dkt_model_{topic_slug}.pt`.

To train new weights, use the Colab notebook at `colab/TrailForge_Train.ipynb`, then download the `.pt` files and place them in `app/dkt/weights/`.
