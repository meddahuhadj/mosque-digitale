"""
redis_store.py — Redis-backed session store for multi-instance deployments.

Provides async Redis operations for Room state persistence:
- Room metadata (code, token, status, config)
- Room history (bounded list of phrases)
- Room listeners count and language breakdown
- Atomic operations for thread safety across instances
"""

from __future__ import annotations

import asyncio
import json
import os
import time
from typing import Any, Optional

import redis.asyncio as redis
from redis.asyncio.connection import ConnectionPool

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
ROOM_TTL = int(os.getenv("ROOM_TTL", str(12 * 60 * 60)))  # 12 hours
MAX_HISTORY = int(os.getenv("MAX_HISTORY", "40"))

_pool: ConnectionPool | None = None
_client: redis.Redis | None = None

# Key prefixes
ROOM_KEY = "khutbah:room:"
ROOM_HISTORY_KEY = "khutbah:room:{code}:history"
ROOM_LISTENERS_KEY = "khutbah:room:{code}:listeners"
ROOM_LOCK_KEY = "khutbah:room:{code}:lock"


def get_pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        _pool = ConnectionPool.from_url(
            REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=50,
        )
    return _pool


def get_client() -> redis.Redis:
    global _client
    if _client is None:
        _client = redis.Redis(connection_pool=get_pool())
    return _client


async def close_pool():
    global _pool, _client
    if _client:
        await _client.aclose()
        _client = None
    if _pool:
        await _pool.disconnect()
        _pool = None


# --------------------------------------------------------------------------- #
# Room persistence
# --------------------------------------------------------------------------- #

async def save_room(room_data: dict) -> bool:
    """Save room metadata to Redis."""
    client = get_client()
    code = room_data["code"].upper()
    key = f"{ROOM_KEY}{code}"

    # Prepare serializable data
    data = {
        "code": room_data["code"],
        "token": room_data["token"],
        "created_at": room_data["created_at"],
        "last_activity": room_data["last_activity"],
        "status": room_data["status"],
        "seq": room_data["seq"],
        "dropped_segments": room_data["dropped_segments"],
        "glossary": room_data["glossary"],
        "mosque_name": room_data["mosque_name"],
        "default_langs": json.dumps(room_data["default_langs"]),
        "listener_count": room_data["listener_count"],
        "lang_breakdown": json.dumps(room_data["lang_breakdown"]),
    }

    try:
        await client.hset(key, mapping=data)
        await client.expire(key, ROOM_TTL)
        return True
    except Exception as exc:
        print(f"[redis_store] save_room error: {exc!r}")
        return False


async def load_room(code: str) -> Optional[dict]:
    """Load room metadata from Redis."""
    client = get_client()
    key = f"{ROOM_KEY}{code.upper()}"

    try:
        data = await client.hgetall(key)
        if not data:
            return None

        # Parse JSON fields
        data["default_langs"] = json.loads(data.get("default_langs", "[]"))
        data["lang_breakdown"] = json.loads(data.get("lang_breakdown", "{}"))
        # Convert numeric fields
        for field in ("created_at", "last_activity", "seq", "dropped_segments", "listener_count"):
            if field in data:
                data[field] = float(data[field]) if field in ("created_at", "last_activity") else int(data[field])
        return data
    except Exception as exc:
        print(f"[redis_store] load_room error: {exc!r}")
        return None


async def delete_room(code: str) -> bool:
    """Delete room and all associated data from Redis."""
    client = get_client()
    code = code.upper()
    keys = [
        f"{ROOM_KEY}{code}",
        f"{ROOM_HISTORY_KEY.format(code=code)}",
        f"{ROOM_LISTENERS_KEY.format(code=code)}",
    ]
    try:
        await client.delete(*keys)
        return True
    except Exception as exc:
        print(f"[redis_store] delete_room error: {exc!r}")
        return False


async def room_exists(code: str) -> bool:
    """Check if room exists in Redis."""
    client = get_client()
    key = f"{ROOM_KEY}{code.upper()}"
    try:
        return await client.exists(key) > 0
    except Exception:
        return False


async def get_all_room_codes() -> list[str]:
    """Get all active room codes from Redis."""
    client = get_client()
    try:
        keys = await client.keys(f"{ROOM_KEY}*")
        return [k.replace(ROOM_KEY, "") for k in keys]
    except Exception as exc:
        print(f"[redis_store] get_all_room_codes error: {exc!r}")
        return []


# --------------------------------------------------------------------------- #
# History persistence
# --------------------------------------------------------------------------- #

async def save_history(code: str, history: list[dict]) -> bool:
    """Save room history to Redis (bounded list)."""
    client = get_client()
    key = f"{ROOM_HISTORY_KEY.format(code=code.upper())}"

    try:
        # Use pipeline for atomic operation
        pipe = client.pipeline()
        pipe.delete(key)
        if history:
            # Store as JSON strings
            items = [json.dumps(item, ensure_ascii=False) for item in history[-MAX_HISTORY:]]
            pipe.rpush(key, *items)
        pipe.expire(key, ROOM_TTL)
        await pipe.execute()
        return True
    except Exception as exc:
        print(f"[redis_store] save_history error: {exc!r}")
        return False


async def load_history(code: str, limit: int = MAX_HISTORY) -> list[dict]:
    """Load room history from Redis."""
    client = get_client()
    key = f"{ROOM_HISTORY_KEY.format(code=code.upper())}"

    try:
        items = await client.lrange(key, -limit, -1)
        return [json.loads(item) for item in items]
    except Exception as exc:
        print(f"[redis_store] load_history error: {exc!r}")
        return []


async def append_history(code: str, record: dict) -> bool:
    """Append a single record to room history."""
    client = get_client()
    key = f"{ROOM_HISTORY_KEY.format(code=code.upper())}"

    try:
        pipe = client.pipeline()
        pipe.rpush(key, json.dumps(record, ensure_ascii=False))
        pipe.ltrim(key, -MAX_HISTORY, -1)
        pipe.expire(key, ROOM_TTL)
        await pipe.execute()
        return True
    except Exception as exc:
        print(f"[redis_store] append_history error: {exc!r}")
        return False


async def update_history_record(code: str, seq: int, updated_record: dict) -> bool:
    """Update a specific record in history by seq."""
    client = get_client()
    key = f"{ROOM_HISTORY_KEY.format(code=code.upper())}"

    try:
        # Get all items, find and update the one with matching seq
        items = await client.lrange(key, 0, -1)
        if not items:
            return False

        records = [json.loads(item) for item in items]
        updated = False
        for i, rec in enumerate(records):
            if rec.get("seq") == seq:
                records[i] = updated_record
                updated = True
                break

        if not updated:
            return False

        # Rewrite the entire list
        pipe = client.pipeline()
        pipe.delete(key)
        if records:
            pipe.rpush(key, *[json.dumps(r, ensure_ascii=False) for r in records])
        pipe.expire(key, ROOM_TTL)
        await pipe.execute()
        return True
    except Exception as exc:
        print(f"[redis_store] update_history_record error: {exc!r}")
        return False


# --------------------------------------------------------------------------- #
# Listener tracking
# --------------------------------------------------------------------------- #

async def save_listener_info(code: str, lang: str, count: int) -> bool:
    """Save listener count per language."""
    client = get_client()
    key = f"{ROOM_LISTENERS_KEY.format(code=code.upper())}"

    try:
        if count > 0:
            await client.hset(key, lang, count)
        else:
            await client.hdel(key, lang)
        await client.expire(key, ROOM_TTL)
        return True
    except Exception as exc:
        print(f"[redis_store] save_listener_info error: {exc!r}")
        return False


async def get_listener_info(code: str) -> dict[str, int]:
    """Get listener count per language."""
    client = get_client()
    key = f"{ROOM_LISTENERS_KEY.format(code=code.upper())}"

    try:
        data = await client.hgetall(key)
        return {k: int(v) for k, v in data.items()}
    except Exception as exc:
        print(f"[redis_store] get_listener_info error: {exc!r}")
        return {}


# --------------------------------------------------------------------------- #
# Distributed locking
# --------------------------------------------------------------------------- #

async def acquire_lock(code: str, owner: str, ttl: int = 10) -> bool:
    """Acquire a distributed lock for a room."""
    client = get_client()
    key = f"{ROOM_LOCK_KEY.format(code=code.upper())}"
    try:
        return await client.set(key, owner, nx=True, ex=ttl)
    except Exception:
        return False


async def release_lock(code: str, owner: str) -> bool:
    """Release a distributed lock if owned by us."""
    client = get_client()
    key = f"{ROOM_LOCK_KEY.format(code=code.upper())}"
    try:
        # Use Lua script for atomic check-and-delete
        lua = """
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
        """
        await client.eval(lua, 1, key, owner)
        return True
    except Exception:
        return False


# --------------------------------------------------------------------------- #
# Health check
# --------------------------------------------------------------------------- #

async def redis_health() -> dict[str, Any]:
    """Check Redis connectivity and return info."""
    client = get_client()
    try:
        start = time.time()
        await client.ping()
        latency_ms = int((time.time() - start) * 1000)
        info = await client.info("memory")
        return {
            "connected": True,
            "latency_ms": latency_ms,
            "used_memory_human": info.get("used_memory_human"),
            "connected_clients": info.get("connected_clients"),
        }
    except Exception as exc:
        return {"connected": False, "error": str(exc)}