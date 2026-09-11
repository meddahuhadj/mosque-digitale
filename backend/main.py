"""
main.py — Backend FastAPI + WebSocket pour la traduction en direct du prêche (khutbah).

Lancement :
    cd backend
    pip install -r requirements.txt
    cp .env.example .env        # puis renseigner GEMINI_API_KEY
    python main.py              # ou : uvicorn main:app --host 0.0.0.0 --port 8000

Vues servies :
    GET /                       -> frontend PWA (un seul fichier ../frontend/index.html)
    GET /?s=CODE                -> auditeur pré-rempli
Endpoints REST :
    POST /api/session           -> crée une session { code, broadcaster_token, join_url }
    GET  /api/session/{code}    -> état d'une session
    GET  /api/session/{code}/qr.png  -> QR code (image PNG) vers la page auditeur
    GET  /api/languages         -> langues supportées
    GET  /healthz
WebSocket :
    /ws/broadcast/{code}?token=...   -> diffuseur (un seul par session)
    /ws/listen/{code}?lang=fr        -> auditeur (des centaines possibles)
"""

from __future__ import annotations

import asyncio
import io
import json
import logging
import os
import secrets
import time
from collections import deque
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response

import quran_index
import translator
import redis_store
import redis_pubsub
import metrics
import logging_config

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #

FRONTEND_DIR = (Path(__file__).resolve().parent.parent / "frontend")
INDEX_HTML = FRONTEND_DIR / "index.html"
# In Docker, frontend files are directly in /app/frontend (copied from dist/)
# Locally, they may be in frontend/dist/ (Vite build output)
if not INDEX_HTML.exists():
    DIST_DIR = FRONTEND_DIR / "dist"
    if (DIST_DIR / "index.html").exists():
        FRONTEND_DIR = DIST_DIR
        INDEX_HTML = FRONTEND_DIR / "index.html"

PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").strip().rstrip("/")
DEFAULT_TARGET_LANGS = [
    x.strip() for x in os.getenv("DEFAULT_TARGET_LANGS", "").split(",") if x.strip()
]
MAX_HISTORY = int(os.getenv("MAX_HISTORY", "40"))
MAX_LISTENERS = int(os.getenv("MAX_LISTENERS", "1500"))
MAX_AUDIO_BYTES = int(os.getenv("MAX_AUDIO_BYTES", "2000000"))
ALLOW_NO_API_KEY = os.getenv("ALLOW_NO_API_KEY", "1") == "1"
SESSION_TTL = 60 * 60 * 12          # 12 h sans activité -> purge
IDLE_ROOM_TTL = int(os.getenv("IDLE_ROOM_TTL", str(20 * 60)))  # session jamais démarrée
MAX_ROOMS = int(os.getenv("MAX_ROOMS", "300"))     # plafond global (anti-DoS mémoire)
SEG_QUEUE_MAX = int(os.getenv("SEG_QUEUE_MAX", "24"))  # backlog max de segments par room

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
ROOM_TTL = int(os.getenv("ROOM_TTL", str(12 * 60 * 60)))  # 12 hours

# Langues proposées par l'interface. `ar` = flux original sans traduction.
SUPPORTED_LANGUAGES: dict[str, str] = {
    "ar": "العربية (original)",
    "fr": "Français",
    "en": "English",
    "nl": "Nederlands",
    "darija": "Darija — الدارجة",
    "tr": "Türkçe",
    "ur": "اردو",
    "es": "Español",
    "de": "Deutsch",
    "wo": "Wolof",
    "bn": "বাংলা",
    "ha": "Hausa",
}

# --------------------------------------------------------------------------- #
# Logging setup
# --------------------------------------------------------------------------- #

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_JSON = os.getenv("LOG_JSON", "").lower() == "true"

logging_config.setup_logging(level=LOG_LEVEL, json_format=LOG_JSON)
logger = logging.getLogger(__name__)
logger.info("Khutbah backend starting", extra={"version": "1.2.0"})

# --------------------------------------------------------------------------- #
# Modèle de session (Room)
# --------------------------------------------------------------------------- #


def _gen_code(n: int = 6) -> str:
    # Sans caractères ambigus (0/O, 1/I).
    alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
    return "".join(secrets.choice(alphabet) for _ in range(n))


class Room:
    def __init__(self, code: str, *, from_redis: dict | None = None):
        self.code = code
        if from_redis:
            self.token = from_redis["token"]
            self.created_at = from_redis["created_at"]
            self.last_activity = from_redis["last_activity"]
            self.status = from_redis["status"]
            self.seq = from_redis["seq"]
            self.dropped_segments = from_redis["dropped_segments"]
            self.glossary = from_redis["glossary"]
            self.mosque_name = from_redis["mosque_name"]
            self.default_langs = from_redis["default_langs"]
        else:
            self.token = secrets.token_urlsafe(18)
            self.created_at = time.time()
            self.last_activity = time.time()
            self.status = "idle"
            self.seq = 0
            self.dropped_segments = 0
            self.glossary = ""
            self.mosque_name = ""
            self.default_langs = list(DEFAULT_TARGET_LANGS)

        self.broadcaster: WebSocket | None = None
        self.listeners: dict[str, set[WebSocket]] = {}
        self.ws_lang: dict[WebSocket, str] = {}
        self.history: deque[dict] = deque(maxlen=MAX_HISTORY)
        self.audio_source_level = 0.0
        self._lock = asyncio.Lock()
        self._seg_q: asyncio.Queue = asyncio.Queue(maxsize=SEG_QUEUE_MAX)
        self._worker: asyncio.Task | None = None
        self._redis_dirty = False
        # --- Khutbah Live Intelligence : statistiques temps réel ----------
        self.live_started_at: float | None = None
        self.peak_listeners = 0
        self.peak_at = 0.0
        self.total_joins = 0
        self.stats_series: deque[dict] = deque(maxlen=720)   # échantillon / 5 s -> 60 min
        self.stats_task: asyncio.Task | None = None

    async def _sync_to_redis(self):
        """Persist room state to Redis."""
        if not self._redis_dirty:
            return
        try:
            data = {
                "code": self.code,
                "token": self.token,
                "created_at": self.created_at,
                "last_activity": self.last_activity,
                "status": self.status,
                "seq": self.seq,
                "dropped_segments": self.dropped_segments,
                "glossary": self.glossary,
                "mosque_name": self.mosque_name,
                "default_langs": self.default_langs,
                "listener_count": self.listener_count,
                "lang_breakdown": self.lang_breakdown(),
            }
            await redis_store.save_room(data)
            # Also persist history
            await redis_store.save_history(self.code, list(self.history))
            self._redis_dirty = False
        except Exception as exc:
            print(f"[redis sync] {self.code}: {exc!r}")

    def touch(self):
        self.last_activity = time.time()
        self._redis_dirty = True

    def mark_dirty(self):
        self._redis_dirty = True

    # --- comptage ------------------------------------------------------------
    @property
    def listener_count(self) -> int:
        return sum(len(s) for s in self.listeners.values())

    def lang_breakdown(self) -> dict[str, int]:
        return {k: len(v) for k, v in self.listeners.items() if v}

    def active_target_langs(self) -> list[str]:
        langs = {l for l in self.listeners if self.listeners[l] and l != "ar"}
        langs.update(self.default_langs)
        langs.discard("ar")
        return sorted(langs)

    # --- file de segments ordonnée ---------------------------------------
    def submit_segment(self, *, text: str | None = None, manual: bool = False,
                       audio: bytes | None = None, mime: str = "audio/webm") -> None:
        item = {"text": text, "manual": manual, "audio": audio, "mime": mime}
        if self._worker is None or self._worker.done():
            self._worker = asyncio.create_task(self._seg_worker())
        try:
            self._seg_q.put_nowait(item)
        except asyncio.QueueFull:
            try:
                self._seg_q.get_nowait()
                self._seg_q.task_done()
                self.dropped_segments += 1
            except asyncio.QueueEmpty:
                pass
            try:
                self._seg_q.put_nowait(item)
            except asyncio.QueueFull:
                self.dropped_segments += 1

    async def _seg_worker(self) -> None:
        while True:
            item = await self._seg_q.get()
            try:
                text = item["text"]
                if item["audio"] is not None:
                    try:
                        text = await translator.transcribe_audio(item["audio"], item["mime"])
                    except Exception as exc:
                        print(f"[stt] {exc!r}")
                        text = None
                    if text:
                        await self.notify_broadcaster({"type": "stt", "text": text})
                if text:
                    await process_final_segment(self, text, manual=item["manual"])
            except Exception as exc:
                print(f"[seg_worker {self.code}] {exc!r}")
            finally:
                self._seg_q.task_done()

    def stop_worker(self) -> None:
        if self._worker and not self._worker.done():
            self._worker.cancel()
        self._worker = None

    # --- envoi -------------------------------------------------------------
    async def send_to(self, ws: WebSocket, payload: dict):
        try:
            await ws.send_text(json.dumps(payload, ensure_ascii=False))
        except Exception:
            await self.drop_listener(ws)

    async def broadcast_lang(self, lang: str, payload: dict):
        for ws in list(self.listeners.get(lang, ())):
            await self.send_to(ws, payload)

    async def broadcast_all(self, payload: dict):
        for lang in list(self.listeners.keys()):
            await self.broadcast_lang(lang, payload)

    async def notify_broadcaster(self, payload: dict):
        if self.broadcaster is not None:
            try:
                await self.broadcaster.send_text(json.dumps(payload, ensure_ascii=False))
            except Exception:
                pass

    async def push_stats(self):
        await self.notify_broadcaster(
            {
                "type": "stats",
                "listeners": self.listener_count,
                "languages": self.lang_breakdown(),
                "status": self.status,
                "seq": self.seq,
            }
        )

    # --- gestion des connexions -----------------------------------------
    async def add_listener(self, ws: WebSocket, lang: str):
        self.total_joins += 1
        self.note_peak()
        self.listeners.setdefault(lang, set()).add(ws)
        self.ws_lang[ws] = lang
        self.touch()
        self.mark_dirty()
        await self.push_stats()

    async def change_lang(self, ws: WebSocket, lang: str):
        old = self.ws_lang.get(ws)
        if old == lang:
            return
        if old and old in self.listeners:
            self.listeners[old].discard(ws)
        self.listeners.setdefault(lang, set()).add(ws)
        self.ws_lang[ws] = lang
        self.touch()
        self.mark_dirty()
        await self.push_stats()

    async def drop_listener(self, ws: WebSocket):
        lang = self.ws_lang.pop(ws, None)
        if lang and lang in self.listeners:
            self.listeners[lang].discard(ws)
            if not self.listeners[lang]:
                self.listeners.pop(lang, None)
        try:
            await ws.close()
        except Exception:
            pass
        self.mark_dirty()
        await self.push_stats()

    # --- statistiques live ---------------------------------------------------
    def note_peak(self):
        n = self.listener_count
        if n > self.peak_listeners:
            self.peak_listeners = n
            self.peak_at = time.time()

    async def start_stats(self):
        self.stop_stats()
        self.stats_task = asyncio.create_task(self._stats_sampler())

    def stop_stats(self):
        if self.stats_task and not self.stats_task.done():
            self.stats_task.cancel()
        self.stats_task = None

    async def _stats_sampler(self):
        try:
            while True:
                self.note_peak()
                self.stats_series.append({
                    "t": int(time.time()),
                    "n": self.listener_count,
                    "langs": self.lang_breakdown(),
                })
                await asyncio.sleep(5)
        except asyncio.CancelledError:
            pass

    def stats_summary(self) -> dict:
        live_min = 0.0
        if self.live_started_at:
            live_min = round(max(0.0, time.time() - self.live_started_at) / 60.0, 1)
        return {
            "status": self.status,
            "live_minutes": live_min,
            "listeners_now": self.listener_count,
            "peak_listeners": self.peak_listeners,
            "peak_at": self.peak_at,
            "total_joins": self.total_joins,
            "seq": self.seq,
            "dropped_segments": self.dropped_segments,
            "per_language": self.lang_breakdown(),
            "series": [
                {"t": p["t"], "n": p["n"], "langs": p["langs"]}
                for p in self.stats_series
            ],
        }

    def history_for(self, lang: str, limit: int = 15) -> list[dict]:
        items = list(self.history)[-limit:]
        return [_phrase_payload(rec, lang) for rec in items]

    def history_since(self, lang: str, since_seq: int) -> list[dict]:
        """Phrases manquées depuis `since_seq` (reprise de séquence à la reconnexion)."""
        return [
            _phrase_payload(rec, lang)
            for rec in list(self.history)
            if rec["seq"] > since_seq
        ]

    def find_record(self, seq: int) -> dict | None:
        for rec in self.history:
            if rec["seq"] == seq:
                return rec
        return None


def _phrase_payload(rec: dict, lang: str) -> dict:
    """Projette un enregistrement d'historique pour une langue donnée."""
    if lang == "ar":
        text = rec["arabic"]
    else:
        text = rec["translations"].get(lang, "")
    return {
        "type": "phrase",
        "seq": rec["seq"],
        "ts": rec["ts"],
        "lang": lang,
        "text": text,
        "arabic": rec["arabic"],
        "is_quran": rec["is_quran"],
        "quran_ref": rec["quran_ref"],
        "quran_ref_guessed": rec.get("quran_ref_guessed", False),
        "is_hadith": rec.get("is_hadith", False),
        "degraded": rec.get("degraded", False),
        "corrected": rec.get("corrected", False),
    }


# --------------------------------------------------------------------------- #
# Gestionnaire global des sessions
# --------------------------------------------------------------------------- #

ROOMS: dict[str, Room] = {}


async def _load_rooms_from_redis() -> int:
    """Load all active rooms from Redis on startup."""
    loaded = 0
    codes = await redis_store.get_all_room_codes()
    for code in codes:
        if code in ROOMS:
            continue
        data = await redis_store.load_room(code)
        if data:
            # Load history
            history = await redis_store.load_history(code)
            room = Room(code, from_redis=data)
            room.history = deque(history, maxlen=MAX_HISTORY)
            ROOMS[code] = room
            loaded += 1
    return loaded


def get_room(code: str) -> Room | None:
    return ROOMS.get(code.upper())


async def get_room_or_load(code: str) -> Room | None:
    """Get room from memory or load from Redis."""
    code = code.upper()
    if code in ROOMS:
        return ROOMS[code]
    # Try loading from Redis
    data = await redis_store.load_room(code)
    if data:
        history = await redis_store.load_history(code)
        room = Room(code, from_redis=data)
        room.history = deque(history, maxlen=MAX_HISTORY)
        ROOMS[code] = room
        return room
    return None


async def _drop_room(code: str) -> None:
    room = ROOMS.pop(code, None)
    if room:
        room.stop_worker()
    await redis_store.delete_room(code)
    await redis_pubsub.unsubscribe_room(code)
    await redis_pubsub.broadcast_room_deleted(code)


async def _purge_stale(now: float | None = None) -> int:
    """Retire les rooms inactives (jamais démarrées, ou sans personne depuis longtemps)."""
    now = now or time.time()
    removed = 0
    for code, room in list(ROOMS.items()):
        empty = room.broadcaster is None and room.listener_count == 0
        if not empty:
            continue
        idle_never_started = room.status == "idle" and now - room.created_at > IDLE_ROOM_TTL
        long_inactive = now - room.last_activity > SESSION_TTL
        if idle_never_started or long_inactive:
            await _drop_room(code)
            removed += 1
    return removed


async def create_room() -> Room:
    if len(ROOMS) >= MAX_ROOMS:
        await _purge_stale()
    if len(ROOMS) >= MAX_ROOMS:
        raise HTTPException(503, "Trop de sessions actives, réessayez plus tard")
    for _ in range(20):
        code = _gen_code()
        if code not in ROOMS:
            room = Room(code)
            ROOMS[code] = room
            # Subscribe to room channel and notify other instances
            asyncio.create_task(redis_pubsub.subscribe_room(code))
            asyncio.create_task(redis_pubsub.broadcast_room_created(code, {
                "code": room.code,
                "token": room.token,
                "created_at": room.created_at,
                "mosque_name": room.mosque_name,
                "default_langs": room.default_langs,
            }))
            return room
    raise RuntimeError("Impossible de générer un code de session unique")


async def _janitor():
    """Purge périodique des sessions inactives + sync Redis."""
    while True:
        await asyncio.sleep(120)
        try:
            # Purge stale rooms
            await _purge_stale()
            # Sync dirty rooms to Redis
            for room in ROOMS.values():
                if getattr(room, '_redis_dirty', False):
                    await room._sync_to_redis()
        except Exception as exc:
            print(f"[janitor] {exc!r}")


# --------------------------------------------------------------------------- #
# Pipeline de traduction d'un segment final
# --------------------------------------------------------------------------- #


async def process_final_segment(room: Room, arabic_text: str, *, manual: bool = False):
    arabic_text = (arabic_text or "").strip()
    if not arabic_text:
        return
    room.touch()
    room.seq += 1
    seq = room.seq
    ts = int(time.time() * 1000)

    target_langs = room.active_target_langs()
    result = None
    if target_langs and translator.has_api_key():
        try:
            result = await translator.translate_segment(
                arabic_text, target_langs, room.glossary
            )
        except Exception as exc:  # défensif : jamais casser le flux
            print(f"[translate] exception: {exc!r}")
            result = None

    degraded = result is None
    if degraded:
        rec = {
            "seq": seq, "ts": ts, "arabic": arabic_text, "translations": {},
            "is_quran": False, "quran_ref": None, "is_hadith": False,
            "degraded": True, "corrected": False,
        }
    else:
        rec = {
            "seq": seq, "ts": ts,
            "arabic": result.get("arabic") or arabic_text,
            "translations": result.get("translations", {}),
            "is_quran": result.get("is_quran", False),
            "quran_ref": result.get("quran_ref"),
            "is_hadith": result.get("is_hadith", False),
            "degraded": False, "corrected": False,
        }
        _fill_quran_ref(rec)
    room.history.append(rec)
    room.mark_dirty()
    await _broadcast_record(room, rec, manual=manual)
    await room._sync_to_redis()


def _fill_quran_ref(rec: dict) -> None:
    """Repli : verset coranique reconnu mais sans référence -> recherche dans l'index local."""
    if rec.get("is_quran") and not rec.get("quran_ref"):
        try:
            ref = quran_index.find_ref(rec.get("arabic") or "")
        except Exception as exc:
            print(f"[quran_index] {exc!r}")
            ref = None
        if ref:
            rec["quran_ref"] = ref
            rec["quran_ref_guessed"] = True


async def recorrect_segment(room: Room, seq: int, arabic_text: str):
    """Le diffuseur corrige l'arabe d'un segment déjà diffusé : on re-traduit et
    on re-pousse la phrase (les auditeurs remplacent la version affichée)."""
    arabic_text = (arabic_text or "").strip()
    rec = room.find_record(seq)
    if not rec or not arabic_text:
        return
    room.touch()
    target_langs = room.active_target_langs()
    result = None
    if target_langs and translator.has_api_key():
        try:
            result = await translator.translate_segment(
                arabic_text, target_langs, room.glossary, use_cache=False
            )
        except Exception as exc:
            print(f"[recorrect] {exc!r}")
    rec["arabic"] = (result or {}).get("arabic") or arabic_text
    if result:
        rec["translations"] = result.get("translations", {})
        rec["is_quran"] = result.get("is_quran", False)
        rec["quran_ref"] = result.get("quran_ref")
        rec["is_hadith"] = result.get("is_hadith", False)
        rec["degraded"] = False
        rec.pop("quran_ref_guessed", None)
        _fill_quran_ref(rec)
    rec["corrected"] = True
    rec["ts"] = int(time.time() * 1000)
    room.mark_dirty()
    await _broadcast_record(room, rec, corrected=True)
    await room._sync_to_redis()
    # Also update the specific record in Redis
    await redis_store.update_history_record(room.code, seq, rec)


async def _broadcast_record(room: Room, rec: dict, *, manual: bool = False,
                            corrected: bool = False):
    for lang in list(room.listeners.keys()):
        payload = _phrase_payload(rec, lang)
        payload["corrected"] = corrected or rec.get("corrected", False)
        await room.broadcast_lang(lang, payload)

    # Publish to Redis Pub/Sub for other instances
    await redis_pubsub.broadcast_segment(room.code, rec)

    _pref = (room.default_langs[0] if room.default_langs else "fr")
    _preview = rec["translations"].get(_pref) or next(
        (v for v in rec["translations"].values() if v), ""
    )
    await room.notify_broadcaster({
        "type": "monitor",
        "seq": rec["seq"], "ts": rec["ts"],
        "arabic": rec["arabic"],
        "preview": _preview,
        "is_quran": rec["is_quran"],
        "quran_ref": rec["quran_ref"],
        "degraded": rec.get("degraded", False),
        "degraded_reason": (translator.last_error() if rec.get("degraded") else ""),
        "provider": ("" if rec.get("degraded") else translator.last_provider()),
        "corrected": corrected,
        "manual": manual,
    })


# --------------------------------------------------------------------------- #
# Redis Pub/Sub handlers for horizontal scaling
# --------------------------------------------------------------------------- #


async def _handle_pubsub_segment(data: dict):
    """Handle incoming segment from another instance."""
    code = data.get("code")
    segment = data.get("segment")
    if not code or not segment:
        return
    room = get_room(code)
    if room:
        for lang in list(room.listeners.keys()):
            payload = _phrase_payload(segment, lang)
            payload["corrected"] = segment.get("corrected", False)
            await room.broadcast_lang(lang, payload)


async def _handle_pubsub_interim(data: dict):
    """Handle incoming interim text from another instance."""
    code = data.get("code")
    arabic = data.get("arabic")
    if not code or not arabic:
        return
    room = get_room(code)
    if room:
        await room.broadcast_all({"type": "interim", "arabic": arabic})


async def _handle_pubsub_session_status(data: dict):
    """Handle session status change from another instance."""
    code = data.get("code")
    status = data.get("status")
    if not code or not status:
        return
    room = get_room(code)
    if room:
        room.status = status
        await room.broadcast_all({"type": "session", "status": status})


async def _handle_pubsub_listener_change(data: dict):
    """Handle listener count change from another instance."""
    code = data.get("code")
    lang = data.get("lang")
    count = data.get("count")
    if not code or lang is None or count is None:
        return
    room = get_room(code)
    if room:
        await room.push_stats()


async def _handle_pubsub_config_update(data: dict):
    """Handle config update from another instance."""
    code = data.get("code")
    glossary = data.get("glossary")
    target_langs = data.get("target_langs")
    if not code:
        return
    room = get_room(code)
    if room:
        if glossary is not None:
            room.glossary = glossary
        if target_langs is not None:
            room.default_langs = target_langs
        room.mark_dirty()


async def _handle_pubsub_correction(data: dict):
    """Handle segment correction from another instance."""
    code = data.get("code")
    seq = data.get("seq")
    segment = data.get("segment")
    if not code or seq is None or not segment:
        return
    room = get_room(code)
    if room:
        for i, rec in enumerate(room.history):
            if rec.get("seq") == seq:
                room.history[i] = segment
                break
        for lang in list(room.listeners.keys()):
            payload = _phrase_payload(segment, lang)
            payload["corrected"] = True
            await room.broadcast_lang(lang, payload)


async def _handle_pubsub_room_created(data: dict):
    """Handle room created on another instance."""
    code = data.get("code")
    if not code:
        return
    await redis_pubsub.subscribe_room(code)


async def _handle_pubsub_room_deleted(data: dict):
    """Handle room deleted on another instance."""
    code = data.get("code")
    if not code:
        return
    await redis_pubsub.unsubscribe_room(code)


# --------------------------------------------------------------------------- #
# Application FastAPI
# --------------------------------------------------------------------------- #


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load rooms from Redis on startup
    loaded = await _load_rooms_from_redis()
    if loaded:
        print(f"[startup] Loaded {loaded} rooms from Redis")
    
    # Start Redis Pub/Sub subscriber for horizontal scaling
    await redis_pubsub.start_subscriber()
    redis_pubsub.register_handler("segment", _handle_pubsub_segment)
    redis_pubsub.register_handler("interim", _handle_pubsub_interim)
    redis_pubsub.register_handler("session_status", _handle_pubsub_session_status)
    redis_pubsub.register_handler("listener_change", _handle_pubsub_listener_change)
    redis_pubsub.register_handler("config_update", _handle_pubsub_config_update)
    redis_pubsub.register_handler("correction", _handle_pubsub_correction)
    redis_pubsub.register_handler("room_created", _handle_pubsub_room_created)
    redis_pubsub.register_handler("room_deleted", _handle_pubsub_room_deleted)
    
    # Subscribe to existing rooms' channels
    for code in ROOMS.keys():
        await redis_pubsub.subscribe_room(code)
    
    task = asyncio.create_task(_janitor())
    yield
    task.cancel()
    for room in list(ROOMS.values()):
        room.stop_worker()
        await room._sync_to_redis()
    await translator.aclose()
    await redis_store.close_pool()
    await redis_pubsub.close_pubsub()


CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "*"
).split(",")

app = FastAPI(title="Khutbah Live Translation", version="1.2.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class SecurityHeadersMiddleware:
    """Add security headers to all responses."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_with_headers(message):
            if message["type"] == "http.response.start":
                headers = dict(message.setdefault("headers", []))
                b = lambda s: s.encode("utf-8")
                headers.update({
                    b("x-content-type-options"): b("nosniff"),
                    b("x-frame-options"): b("DENY"),
                    b("x-xss-protection"): b("1; mode=block"),
                    b("referrer-policy"): b("strict-origin-when-cross-origin"),
                    b("permissions-policy"): b("camera=(), microphone=()"),
                })
                message["headers"] = list(headers.items())
            await send(message)

        await self.app(scope, receive, send_with_headers)


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(logging_config.LoggingMiddleware)

# Content API router (auth, quran, prayer times, mosques, announcements, events, admin)
from content import router as content_router  # noqa: E402
app.include_router(content_router)


# ----------------------------- REST --------------------------------------- #

import socket

from starlette.requests import Request  # noqa: E402

from schemas import (  # noqa: E402
    SessionCreateRequest, SessionResponse, HealthResponse, LanguagesResponse, ReportRequest,
    AskRequest,
)

_LOCAL_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]", ""}


def _lan_ip() -> str | None:
    """IP LAN de cette machine (celle par laquelle un téléphone du même Wi-Fi peut la joindre)."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.connect(("8.8.8.8", 80))       # n'envoie rien : sélectionne juste la route sortante
            ip = s.getsockname()[0]
        finally:
            s.close()
        if ip and not ip.startswith("127."):
            return ip
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ip = info[4][0]
            if ip and not ip.startswith("127."):
                return ip
    except OSError:
        pass
    return None


def base_url(request: Request) -> str:
    """URL publique de base.

    Priorité : PUBLIC_BASE_URL > en-têtes de proxy (X-Forwarded-*) > Host.
    Cas particulier : si l'imam ouvre l'appli sur `localhost`, le lien/QR partagé
    serait inutilisable ailleurs → on le réécrit avec l'IP LAN de la machine.
    """
    if PUBLIC_BASE_URL:
        return PUBLIC_BASE_URL
    proto = request.headers.get("x-forwarded-proto") or request.url.scheme
    fwd_host = request.headers.get("x-forwarded-host")
    host = fwd_host or request.headers.get("host") \
        or f"{request.url.hostname}:{request.url.port or 8000}"

    if not fwd_host:  # pas derrière un proxy : on peut tenter la réécriture LAN
        hostname, _, port = host.partition(":")
        if hostname.lower() in _LOCAL_HOSTS:
            ip = _lan_ip()
            if ip:
                return f"{proto}://{ip}:{port or (str(request.url.port) if request.url.port else '8000')}"
    return f"{proto}://{host}"


@app.get("/healthz")
async def healthz():
    live = sum(1 for r in ROOMS.values() if r.status == "live")
    redis_health = await redis_store.redis_health()
    return HealthResponse(
        ok=True,
        rooms=len(ROOMS),
        rooms_live=live,
        rooms_idle=sum(1 for r in ROOMS.values() if r.status == "idle"),
        listeners=sum(r.listener_count for r in ROOMS.values()),
        segments_total=sum(r.seq for r in ROOMS.values()),
        segments_dropped=sum(r.dropped_segments for r in ROOMS.values()),
        translate_last_error=translator.last_error() or None,
        translate_last_provider=translator.last_provider() or None,
        model=translator.MODEL,
        redis=redis_health,
    )


@app.get("/metrics")
async def metrics_endpoint():
    """Prometheus metrics endpoint."""
    from main import ROOMS
    metrics.update_room_metrics(ROOMS)
    output, headers = await metrics.metrics_endpoint(None)
    return Response(content=output, media_type=metrics.CONTENT_TYPE_LATEST)


@app.get("/api/languages")
async def api_languages():
    return LanguagesResponse(
        languages=[{"code": c, "name": n} for c, n in SUPPORTED_LANGUAGES.items()]
    )


# Rate limiting mémoire : créations de session par IP (fenêtre glissante).
_RL_WINDOW = 60.0
_RL_MAX = 12
_rl_hits: dict[str, deque] = {}


def _rate_ok(ip: str) -> bool:
    now = time.time()
    dq = _rl_hits.setdefault(ip, deque())
    while dq and now - dq[0] > _RL_WINDOW:
        dq.popleft()
    if len(dq) >= _RL_MAX:
        return False
    dq.append(now)
    return True


@app.post("/api/session")
async def api_create_session(request: Request, body: SessionCreateRequest):
    if not translator.has_api_key() and not ALLOW_NO_API_KEY:
        raise HTTPException(503, "GEMINI_API_KEY non configurée")
    ip = (request.headers.get("x-forwarded-for", "").split(",")[0].strip()
          or (request.client.host if request.client else "?"))
    if not _rate_ok(ip):
        raise HTTPException(429, "Trop de sessions créées, réessayez dans une minute")

    room = await create_room()
    room.glossary = body.glossary
    room.mosque_name = body.mosque_name
    if body.target_langs:
        room.default_langs = [
            l for l in body.target_langs if l in SUPPORTED_LANGUAGES and l != "ar"
        ] or list(DEFAULT_TARGET_LANGS)

    base = base_url(request)
    join_url = f"{base}/?s={room.code}"
    _bh = base.split("://", 1)[-1].partition(":")[0].lower()
    return {
        "code": room.code,
        "broadcaster_token": room.token,
        "created_at": room.created_at,
        "join_url": join_url,
        "shareable": _bh not in _LOCAL_HOSTS,
        "gemini": translator.has_api_key(),
        "mosque_name": room.mosque_name,
        "target_langs": room.default_langs,
    }


@app.get("/api/session/{code}")
async def api_get_session(code: str):
    room = await get_room_or_load(code)
    if not room:
        raise HTTPException(404, "Session introuvable ou terminée")
    return {
        "code": room.code,
        "status": room.status,
        "listeners": room.listener_count,
        "languages": room.lang_breakdown(),
        "seq": room.seq,
        "has_broadcaster": room.broadcaster is not None,
        "mosque_name": room.mosque_name,
    }


@app.get("/api/session/{code}/qr.png")
async def api_session_qr(code: str, request: Request):
    room = await get_room_or_load(code)
    if not room:
        raise HTTPException(404, "Session introuvable")
    import qrcode

    join_url = f"{base_url(request)}/?s={room.code}"
    img = qrcode.make(join_url, box_size=10, border=2)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return Response(buf.getvalue(), media_type="image/png",
                    headers={"Cache-Control": "no-store"})


@app.post("/api/session/{code}/report")
async def api_session_report(code: str, body: ReportRequest,
                             token: str = ""):
    """Rapport automatique de la session (résumé de la khutbah).

    Génération restreinte : token diffuseur valide, OU session déjà close
    (les fidèles peuvent alors récupérer le rapport à la fin du prêche).
    """
    room = await get_room_or_load(code)
    if not room:
        raise HTTPException(404, "Session introuvable ou terminée")
    if not (room.status == "stopped" or (token and token == room.token)):
        raise HTTPException(403, "Token diffuseur requis")

    transcript = body.transcript or list(room.history)
    segs: list[dict] = []
    for r in transcript:
        if not isinstance(r, dict) or not str(r.get("arabic") or "").strip():
            continue
        segs.append({
            "arabic": str(r["arabic"]).strip()[:4000],
            "ts": r.get("ts"),
            "is_quran": bool(r.get("is_quran")),
            "quran_ref": r.get("quran_ref"),
            "is_hadith": bool(r.get("is_hadith")),
        })
    if len(segs) < 2:
        raise HTTPException(400, "Pas assez de segments pour un rapport")

    cached = getattr(room, "_report_cache", None)
    if cached and cached[0] == body.lang and cached[1] == len(segs):
        return cached[2]

    if not translator.has_api_key():
        raise HTTPException(503, "Aucun fournisseur d'IA configuré")

    report = await translator.summarize_session(
        segs, lang=body.lang, mosque=room.mosque_name, glossary=room.glossary
    )
    if report is None:
        err = translator.last_error() or "erreur inconnue"
        raise HTTPException(502, f"Génération du rapport impossible ({err})")

    room._report_cache = (body.lang, len(segs), report)
    return report


@app.post("/api/session/{code}/ask")
async def api_session_ask(code: str, body: AskRequest, request: Request):
    """Ask My Mosque : réponse IA à un fidèle, ancrée sur la session en cours.

    Cost-control : rate limit par IP (comme la création de session) et question bornée.
    """
    room = await get_room_or_load(code)
    if not room:
        raise HTTPException(404, "Session introuvable ou terminée")
    ip = (request.headers.get("x-forwarded-for", "").split(",")[0].strip()
          or (request.client.host if request.client else "?"))
    if not _rate_ok(ip):
        raise HTTPException(429, "Trop de questions, réessayez dans une minute")

    question = (body.question or "").strip()
    if len(question) < 3:
        raise HTTPException(400, "Question trop courte")
    if not translator.has_api_key():
        raise HTTPException(503, "Aucun fournisseur d'IA configuré")

    answer = await translator.ask_question(
        question, list(room.history), lang=body.lang,
        mosque=room.mosque_name, glossary=room.glossary,
    )
    if answer is None:
        err = translator.last_error() or "erreur inconnue"
        raise HTTPException(502, f"Réponse impossible ({err})")
    return answer


@app.get("/api/session/{code}/stats")
async def api_session_stats(code: str):
    """Khutbah Live Intelligence : statistiques de diffusion (publiques, agrégées)."""
    room = await get_room_or_load(code)
    if not room:
        raise HTTPException(404, "Session introuvable ou terminée")
    return room.stats_summary()


@app.post("/api/ai/assistant/plan")
async def api_ai_plan(body: AskRequest, request: Request):
    """Assistant imam : génère un plan structuré de khutbah sur un sujet donné.

    Retourne {topic, introduction, mainPoints[], references[], conclusion, warnings[]}.
    """
    topic = (body.question or "").strip()
    if len(topic) < 3:
        raise HTTPException(400, "Sujet trop court")
    ip = (request.headers.get("x-forwarded-for", "").split(",")[0].strip()
          or (request.client.host if request.client else "?"))
    if not _rate_ok(ip):
        raise HTTPException(429, "Trop de requêtes, réessayez dans une minute")
    if not translator.has_api_key():
        raise HTTPException(503, "Aucun fournisseur d'IA configuré")

    answer = await translator.ask_question(
        f"Génère un plan structuré de khutbah (sermon) sur le sujet : « {topic} ». "
        "Réponds en JSON avec les clés : introduction, mainPoints (liste de 3 à 5 points), "
        "references (versets coraniques et hadiths), conclusion, warnings (pièges à éviter). "
        "Réponds en français.", [], lang="fr",
    )
    if answer is None:
        err = translator.last_error() or "erreur inconnue"
        raise HTTPException(502, f"Plan impossible ({err})")

    raw = answer.get("answer") or ""
    data = _parse_plan_json(raw)
    data.setdefault("topic", topic)
    # Normaliser les champs attendus par le frontend
    data.setdefault("introduction", "")
    data.setdefault("mainPoints", [])
    data.setdefault("references", [])
    data.setdefault("conclusion", "")
    data.setdefault("warnings", [])
    return data


def _parse_plan_json(raw: str) -> dict:
    """Extrait un dict depuis la réponse IA (JSON entre balises ou brut)."""
    import json as _json
    text = raw.strip()
    # Tente d'isoler un bloc JSON
    import re as _re
    m = _re.search(r"\{.*\}", text, _re.S)
    if m:
        try:
            parsed = _json.loads(m.group(0))
            if isinstance(parsed, dict):
                return parsed
        except _json.JSONDecodeError:
            pass
    # Fallback : structure simple à partir du texte brut
    points = [ln.strip("•- ") for ln in text.splitlines() if ln.strip().lstrip("•- ")]
    return {"introduction": points[:1], "mainPoints": points[1:6]}


# ----------------------------- Frontend / PWA ---------------------------- #

_ASSETS_DIR = (FRONTEND_DIR / "assets").resolve()
_ASSET_TYPES = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".webp": "image/webp", ".svg": "image/svg+xml", ".avif": "image/avif",
    ".woff2": "font/woff2", ".css": "text/css", ".txt": "text/plain",
}


@app.get("/assets/{name}")
async def assets(name: str):
    p = (_ASSETS_DIR / name).resolve()
    if _ASSETS_DIR not in p.parents or not p.is_file():
        raise HTTPException(404, "Ressource introuvable")
    media = _ASSET_TYPES.get(p.suffix.lower(), "application/octet-stream")
    return FileResponse(p, media_type=media,
                        headers={"Cache-Control": "public, max-age=604800"})


@app.get("/")
async def index():
    if INDEX_HTML.exists():
        return FileResponse(INDEX_HTML, media_type="text/html")
    return JSONResponse({"error": "frontend/index.html introuvable"}, status_code=500)


@app.get("/manifest.webmanifest")
async def manifest():
    data = {
        "name": "Traduction du prêche",
        "short_name": "Khutbah",
        "description": "Traduction en direct du prêche (khutbah) sur votre téléphone.",
        "start_url": "./",
        "scope": "./",
        "display": "standalone",
        "display_override": ["standalone", "window-controls-overlay", "minimal-ui"],
        "orientation": "portrait",
        "categories": ["utilities", "education"],
        "background_color": "#080e1a",
        "theme_color": "#1a6b4a",
        "lang": "fr",
        "dir": "auto",
        "icons": [
            {"src": "./api/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "./api/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"},
        ],
    }
    return JSONResponse(data, media_type="application/manifest+json")


@app.get("/sw.js")
async def service_worker():
    sw = FRONTEND_DIR / "sw.js"
    if sw.exists():
        return FileResponse(sw, media_type="application/javascript",
                            headers={"Cache-Control": "no-cache"})
    return Response("", media_type="application/javascript")


@app.get("/modules/{path:path}")
async def serve_modules(path: str):
    p = (FRONTEND_DIR / "modules" / path).resolve()
    if FRONTEND_DIR not in p.parents or not p.is_file():
        raise HTTPException(404, "Module introuvable")
    media = "application/javascript" if p.suffix == ".js" else "application/json"
    return FileResponse(p, media_type=media,
                        headers={"Cache-Control": "public, max-age=3600"})


@app.get("/lang/{path:path}")
async def serve_lang(path: str):
    p = (FRONTEND_DIR / "lang" / path).resolve()
    if FRONTEND_DIR not in p.parents or not p.is_file():
        raise HTTPException(404, "Langue introuvable")
    return FileResponse(p, media_type="application/json",
                        headers={"Cache-Control": "public, max-age=3600"})


@app.get("/core/{path:path}")
async def serve_core(path: str):
    p = (FRONTEND_DIR / "core" / path).resolve()
    if FRONTEND_DIR not in p.parents or not p.is_file():
        raise HTTPException(404, "Core introuvable")
    media = "application/javascript" if p.suffix == ".js" else "text/plain"
    return FileResponse(p, media_type=media,
                        headers={"Cache-Control": "public, max-age=3600"})


_ICON_CACHE: dict[int, bytes] = {}


def _make_icon(size: int) -> bytes:
    if size in _ICON_CACHE:
        return _ICON_CACHE[size]
    from PIL import Image, ImageDraw

    # Palette islamique : fond nuit profond, vert émeraude, croissant doré.
    img = Image.new("RGBA", (size, size), (12, 21, 36, 255))
    d = ImageDraw.Draw(img)
    pad = int(size * 0.14)
    d.rounded_rectangle([pad, pad, size - pad, size - pad],
                        radius=int(size * 0.16), fill=(26, 107, 74, 255))
    # Croissant stylisé (doré).
    cx, cy, r = size * 0.52, size * 0.5, size * 0.24
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(244, 226, 160, 255))
    off = size * 0.09
    d.ellipse([cx - r + off, cy - r, cx + r + off, cy + r], fill=(26, 107, 74, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    _ICON_CACHE[size] = buf.getvalue()
    return _ICON_CACHE[size]


@app.get("/api/icon-{size}.png")
async def api_icon(size: int):
    size = max(48, min(size, 512))
    return Response(_make_icon(size), media_type="image/png",
                    headers={"Cache-Control": "public, max-age=86400"})


# ----------------------------- WebSocket : diffuseur -------------------- #


@app.websocket("/ws/broadcast/{code}")
async def ws_broadcast(ws: WebSocket, code: str, token: str = Query("")):
    room = await get_room_or_load(code)
    if not room or token != room.token:
        await ws.close(code=4403)
        return
    await ws.accept()

    # Un seul diffuseur : on remplace l'ancien s'il existe.
    if room.broadcaster is not None:
        try:
            await room.broadcaster.close(code=4409)
        except Exception:
            pass
    room.broadcaster = ws
    if room.status in ("idle", "stopped"):
        room.status = "live"
        room.live_started_at = time.time()
    await room.start_stats()
    room.touch()
    await ws.send_text(json.dumps({
        "type": "hello", "code": room.code, "status": room.status,
        "listeners": room.listener_count, "languages": room.lang_breakdown(),
        "gemini": translator.has_api_key(),
        "supported_languages": SUPPORTED_LANGUAGES,
        "mosque_name": room.mosque_name,
        "glossary": room.glossary,
        "target_langs": room.default_langs,
    }, ensure_ascii=False))
    await room.broadcast_all({"type": "session", "status": room.status})

    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue
            mtype = msg.get("type")
            room.touch()

            if mtype == "transcript":
                text = (msg.get("text") or "").strip()
                if msg.get("is_final"):
                    if text:
                        room.submit_segment(text=text, manual=bool(msg.get("manual")))
                else:
                    # Intérimaire : arabe live poussé à tous, sans traduction.
                    await room.broadcast_all({"type": "interim", "arabic": text})
                    await redis_pubsub.broadcast_interim(room.code, text)

            elif mtype == "audio":
                b64 = msg.get("data") or ""
                mime = msg.get("mime") or "audio/webm"
                import base64
                try:
                    audio = base64.b64decode(b64)
                except Exception:
                    audio = b""
                if 0 < len(audio) <= MAX_AUDIO_BYTES and translator.has_api_key():
                    room.submit_segment(audio=audio, mime=mime)
                elif len(audio) > MAX_AUDIO_BYTES:
                    await ws.send_text(json.dumps({"type": "error",
                                                   "message": "chunk audio trop volumineux"}))

            elif mtype == "correct":
                try:
                    cseq = int(msg.get("seq"))
                except (TypeError, ValueError):
                    cseq = 0
                ctext = (msg.get("arabic") or msg.get("text") or "").strip()
                if cseq and ctext:
                    asyncio.create_task(recorrect_segment(room, cseq, ctext))

            elif mtype == "config":
                # Mise à jour à chaud du glossaire / des langues par défaut.
                if "glossary" in msg:
                    room.glossary = str(msg.get("glossary") or "").strip()[:4000]
                langs = msg.get("target_langs")
                if isinstance(langs, list):
                    room.default_langs = [
                        l for l in langs if l in SUPPORTED_LANGUAGES and l != "ar"
                    ]
                await ws.send_text(json.dumps({
                    "type": "config_ok", "glossary": room.glossary,
                    "target_langs": room.default_langs,
                }, ensure_ascii=False))

            elif mtype == "control":
                action = msg.get("action")
                if action == "pause":
                    room.status = "paused"
                elif action == "resume":
                    room.status = "live"
                elif action == "stop":
                    room.status = "stopped"
                await room.broadcast_all({"type": "session", "status": room.status})
                await redis_pubsub.broadcast_session_status(room.code, room.status)
                await room.push_stats()

            elif mtype == "level":
                try:
                    room.audio_source_level = float(msg.get("value") or 0.0)
                except (TypeError, ValueError):
                    pass

            elif mtype == "ping":
                await ws.send_text(json.dumps({"type": "pong", "t": msg.get("t")}))

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        print(f"[ws_broadcast] {exc!r}")
    finally:
        room.stop_stats()
        if room.broadcaster is ws:
            room.broadcaster = None
            room.status = "paused" if room.status == "live" else room.status
            await room.broadcast_all({"type": "session", "status": room.status,
                                      "broadcaster_gone": True})
            await redis_pubsub.broadcast_session_status(room.code, room.status, broadcaster_gone=True)


# ----------------------------- WebSocket : auditeur -------------------- #


@app.websocket("/ws/listen/{code}")
async def ws_listen(ws: WebSocket, code: str, lang: str = Query("fr"),
                    since: int = Query(0)):
    room = await get_room_or_load(code)
    if not room:
        await ws.close(code=4404)
        return
    if room.listener_count >= MAX_LISTENERS:
        await ws.close(code=4429)
        return
    if lang not in SUPPORTED_LANGUAGES:
        lang = "fr"
    await ws.accept()
    await room.add_listener(ws, lang)

    # Reprise de séquence : si le client se reconnecte avec `since`, on ne renvoie
    # que les phrases manquées ; sinon les dernières (nouvel arrivant).
    if since > 0:
        missed = room.history_since(lang, since)
    else:
        missed = room.history_for(lang)

    await ws.send_text(json.dumps({
        "type": "hello",
        "code": room.code,
        "status": room.status,
        "lang": lang,
        "history": missed,
        "resumed": since > 0,
        "seq": room.seq,
        "mosque_name": room.mosque_name,
        "supported_languages": SUPPORTED_LANGUAGES,
    }, ensure_ascii=False))

    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue
            mtype = msg.get("type")

            if mtype == "set_lang":
                new_lang = msg.get("lang")
                if new_lang in SUPPORTED_LANGUAGES:
                    await room.change_lang(ws, new_lang)
                    await ws.send_text(json.dumps({
                        "type": "lang_changed",
                        "lang": new_lang,
                        "history": room.history_for(new_lang),
                    }, ensure_ascii=False))

            elif mtype == "history":
                cur = room.ws_lang.get(ws, lang)
                await ws.send_text(json.dumps({
                    "type": "history",
                    "items": room.history_for(cur, limit=MAX_HISTORY),
                }, ensure_ascii=False))

            elif mtype == "ping":
                await ws.send_text(json.dumps({"type": "pong", "t": msg.get("t")}))

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        print(f"[ws_listen] {exc!r}")
    finally:
        await room.drop_listener(ws)


# --------------------------------------------------------------------------- #
# Point d'entrée
# --------------------------------------------------------------------------- #

if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    print(f"http://{host}:{port}  (Gemini: {'OK' if translator.has_api_key() else 'ABSENT - degraded mode'})", flush=True)
    uvicorn.run("main:app", host=host, port=port, reload=False, ws_ping_interval=20,
                ws_ping_timeout=20)
