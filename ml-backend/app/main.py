# =============================================================
# main.py — FastAPI entry point
# =============================================================

from dotenv import load_dotenv
load_dotenv()   # load .env before anything else reads os.getenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.dkt_service import load_all_models
from app.routes import quiz
from app.db import connect_db, close_db

app = FastAPI(title="TrailForge ML API")

# Allow both the React frontend and the Node.js backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # React frontend
        "http://localhost:5000",   # Node.js backend (server-side calls)
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    connect_db()        # open MongoDB connection
    load_all_models()   # load DKT .pt weights into memory


@app.on_event("shutdown")
async def shutdown():
    close_db()


# Routes
app.include_router(quiz.router)


@app.get("/")
def root():
    return {"status": "TrailForge ML API running"}
