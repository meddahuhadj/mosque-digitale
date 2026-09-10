"""
redis_pubsub.py — Redis Pub/Sub for multi-instance horizontal scaling.

Enables fan-out across multiple backend instances:
- Each instance subscribes to room channels
- Broadcaster publishes segments to channel
- All instances receive and deliver to their local listeners
- Room state changes (listener count, status) are broadcast
"""

from __future__ import annotations

import asyncio
import json
import os
from typing import Any, Callable, Optional

import redis.asyncio as redis
from redis.asyncio.connection import ConnectionPool

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
PUBSUB_CHANNEL_PREFIX = "khutbah:pubsub:"
PUBSUB_ROOM_CHANNEL = PUBSUB_CHANNEL_PREFIX + "room:{code}"
PUBSUB_GLOBAL_CHANNEL = PUBSUB_CHANNEL_PREFIX + "global"

_pool: ConnectionPool | None = None
_pubsub: redis.client.PubSub | None = None
_subscriber_task: asyncio.Task | None = None
_message_handlers: dict[str, Callable] = {}


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


async def get_pubsub() -> redis.client.PubSub:
    global _pubsub
    if _pubsub is None:
        client = redis.Redis(connection_pool=get_pool())
        _pubsub = client.pubsub()
    return _pubsub


async def close_pubsub():
    global _pubsub, _subscriber_task, _pool
    if _subscriber_task and not _subscriber_task.done():
        _subscriber_task.cancel()
        try:
            await _subscriber_task
        except asyncio.CancelledError:
            pass
    if _pubsub:
        await _pubsub.aclose()
        _pubsub = None
    if _pool:
        await _pool.disconnect()
        _pool = None


# --------------------------------------------------------------------------- #
# Channel helpers
# --------------------------------------------------------------------------- #

def room_channel(code: str) -> str:
    return PUBSUB_ROOM_CHANNEL.format(code=code.upper())


# --------------------------------------------------------------------------- #
# Publishing
# --------------------------------------------------------------------------- #

async def publish_room_event(code: str, event: dict) -> bool:
    """Publish an event to a room's channel."""
    client = redis.Redis(connection_pool=get_pool())
    channel = room_channel(code)
    try:
        payload = json.dumps(event, ensure_ascii=False)
        await client.publish(channel, payload)
        return True
    except Exception as exc:
        print(f"[redis_pubsub] publish error: {exc!r}")
        return False


async def publish_global_event(event: dict) -> bool:
    """Publish an event to the global channel."""
    client = redis.Redis(connection_pool=get_pool())
    try:
        payload = json.dumps(event, ensure_ascii=False)
        await client.publish(PUBSUB_GLOBAL_CHANNEL, payload)
        return True
    except Exception as exc:
        print(f"[redis_pubsub] publish_global error: {exc!r}")
        return False


# --------------------------------------------------------------------------- #
# Subscription & message handling
# --------------------------------------------------------------------------- #

def register_handler(event_type: str, handler: Callable) -> None:
    """Register a handler for a specific event type."""
    _message_handlers[event_type] = handler


async def _handle_message(message: dict) -> None:
    """Route message to appropriate handler."""
    if message.get("type") != "message":
        return
    
    try:
        data = json.loads(message["data"])
        event_type = data.get("event")
        handler = _message_handlers.get(event_type)
        if handler:
            await handler(data)
        else:
            print(f"[redis_pubsub] No handler for event: {event_type}")
    except Exception as exc:
        print(f"[redis_pubsub] handle_message error: {exc!r}")


async def subscribe_room(code: str) -> bool:
    """Subscribe to a room's channel."""
    pubsub = await get_pubsub()
    channel = room_channel(code)
    try:
        await pubsub.subscribe(channel)
        return True
    except Exception as exc:
        print(f"[redis_pubsub] subscribe error: {exc!r}")
        return False


async def unsubscribe_room(code: str) -> bool:
    """Unsubscribe from a room's channel."""
    pubsub = await get_pubsub()
    channel = room_channel(code)
    try:
        await pubsub.unsubscribe(channel)
        return True
    except Exception as exc:
        print(f"[redis_pubsub] unsubscribe error: {exc!r}")
        return False


async def subscribe_global() -> bool:
    """Subscribe to the global channel."""
    pubsub = await get_pubsub()
    try:
        await pubsub.subscribe(PUBSUB_GLOBAL_CHANNEL)
        return True
    except Exception as exc:
        print(f"[redis_pubsub] subscribe_global error: {exc!r}")
        return False


async def start_subscriber() -> None:
    """Start the background subscriber task."""
    global _subscriber_task
    if _subscriber_task and not _subscriber_task.done():
        return
    
    pubsub = await get_pubsub()
    await subscribe_global()
    
    async def _run():
        try:
            async for message in pubsub.listen():
                await _handle_message(message)
        except asyncio.CancelledError:
            pass
        except Exception as exc:
            print(f"[redis_pubsub] subscriber error: {exc!r}")
    
    _subscriber_task = asyncio.create_task(_run())


# --------------------------------------------------------------------------- #
# High-level event publishers
# --------------------------------------------------------------------------- #

async def broadcast_segment(code: str, segment: dict) -> None:
    """Broadcast a translated segment to all instances."""
    await publish_room_event(code, {
        "event": "segment",
        "code": code.upper(),
        "segment": segment,
    })


async def broadcast_interim(code: str, arabic: str) -> None:
    """Broadcast interim Arabic text to all instances."""
    await publish_room_event(code, {
        "event": "interim",
        "code": code.upper(),
        "arabic": arabic,
    })


async def broadcast_session_status(code: str, status: str, **extra) -> None:
    """Broadcast session status change."""
    event = {
        "event": "session_status",
        "code": code.upper(),
        "status": status,
    }
    event.update(extra)
    await publish_room_event(code, event)


async def broadcast_listener_change(code: str, lang: str, count: int) -> None:
    """Broadcast listener count change for a language."""
    await publish_room_event(code, {
        "event": "listener_change",
        "code": code.upper(),
        "lang": lang,
        "count": count,
    })


async def broadcast_config_update(code: str, glossary: str, target_langs: list[str]) -> None:
    """Broadcast config update (glossary, target langs)."""
    await publish_room_event(code, {
        "event": "config_update",
        "code": code.upper(),
        "glossary": glossary,
        "target_langs": target_langs,
    })


async def broadcast_correction(code: str, seq: int, corrected_segment: dict) -> None:
    """Broadcast a segment correction."""
    await publish_room_event(code, {
        "event": "correction",
        "code": code.upper(),
        "seq": seq,
        "segment": corrected_segment,
    })


async def broadcast_room_created(code: str, room_data: dict) -> None:
    """Notify all instances of new room."""
    await publish_global_event({
        "event": "room_created",
        "code": code.upper(),
        "room": room_data,
    })


async def broadcast_room_deleted(code: str) -> None:
    """Notify all instances of room deletion."""
    await publish_global_event({
        "event": "room_deleted",
        "code": code.upper(),
    })


# --------------------------------------------------------------------------- #
# Health check
# --------------------------------------------------------------------------- #

async def pubsub_health() -> dict[str, Any]:
    """Check Pub/Sub connectivity."""
    client = redis.Redis(connection_pool=get_pool())
    try:
        start = asyncio.get_event_loop().time()
        await client.ping()
        latency_ms = int((asyncio.get_event_loop().time() - start) * 1000)
        return {"connected": True, "latency_ms": latency_ms}
    except Exception as exc:
        return {"connected": False, "error": str(exc)}