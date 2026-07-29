# =============================================================
# db.py  — thin pymongo wrapper
# Reads MONGO_URI from environment, connects once at startup.
# Call get_db() anywhere to get the database handle.
# =============================================================

import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

_client: MongoClient | None = None
_db = None


def connect_db():
    """
    Open the MongoDB connection.
    Call once from main.py startup event.
    """
    global _client, _db

    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise EnvironmentError(
            "MONGO_URI is not set. Add it to ml-backend/.env"
        )

    _client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)

    # Force a server round-trip to validate connectivity
    try:
        _client.admin.command("ping")
        print("[DB] Connected to MongoDB [OK]")
    except ConnectionFailure as e:
        print(f"[DB] WARNING: MongoDB ping failed - {e}")

    # Extract the database name from the URI path, fall back to "trailforge"
    db_name = mongo_uri.rstrip("/").rsplit("/", 1)[-1].split("?")[0] or "trailforge"
    _db = _client[db_name]


def get_db():
    """Return the database handle. Must call connect_db() first."""
    if _db is None:
        raise RuntimeError("Database not initialised. Call connect_db() in startup.")
    return _db


def close_db():
    """Close the connection (called on shutdown)."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        print("[DB] MongoDB connection closed.")
