"""
logging_config.py — Structured JSON logging with correlation IDs.

Provides:
- JSON formatted logs for production
- Correlation ID propagation across async boundaries
- Request/response logging middleware
- WebSocket message logging
- Structured error logging with context
"""

from __future__ import annotations

import json
import logging
import os
import sys
import time
import uuid
from contextlib import asynccontextmanager
from contextvars import ContextVar
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Any, Optional

# --------------------------------------------------------------------------- #
# Context variables for correlation IDs
# --------------------------------------------------------------------------- #

correlation_id_var: ContextVar[Optional[str]] = ContextVar("correlation_id", default=None)
request_id_var: ContextVar[Optional[str]] = ContextVar("request_id", default=None)
room_code_var: ContextVar[Optional[str]] = ContextVar("room_code", default=None)
user_type_var: ContextVar[Optional[str]] = ContextVar("user_type", default=None)  # "broadcaster" | "listener"


def get_correlation_id() -> str:
    """Get or generate correlation ID for current context."""
    cid = correlation_id_var.get()
    if cid is None:
        cid = str(uuid.uuid4())[:8]
        correlation_id_var.set(cid)
    return cid


def set_correlation_id(cid: str) -> None:
    """Set correlation ID for current context."""
    correlation_id_var.set(cid)


def get_request_id() -> str:
    """Get or generate request ID for current context."""
    rid = request_id_var.get()
    if rid is None:
        rid = str(uuid.uuid4())[:12]
        request_id_var.set(rid)
    return rid


def set_request_id(rid: str) -> None:
    """Set request ID for current context."""
    request_id_var.set(rid)


def get_room_code() -> Optional[str]:
    """Get room code for current context."""
    return room_code_var.get()


def set_room_code(code: Optional[str]) -> None:
    """Set room code for current context."""
    room_code_var.set(code)


def get_user_type() -> Optional[str]:
    """Get user type for current context."""
    return user_type_var.get()


def set_user_type(u_type: Optional[str]) -> None:
    """Set user type for current context."""
    user_type_var.set(u_type)


# --------------------------------------------------------------------------- #
# Structured log record
# --------------------------------------------------------------------------- #

@dataclass
class LogContext:
    """Structured log context."""
    timestamp: str
    level: str
    logger: str
    message: str
    correlation_id: Optional[str] = None
    request_id: Optional[str] = None
    room_code: Optional[str] = None
    user_type: Optional[str] = None
    # Extra fields
    duration_ms: Optional[float] = None
    status_code: Optional[int] = None
    method: Optional[str] = None
    path: Optional[str] = None
    error: Optional[str] = None
    provider: Optional[str] = None
    lang: Optional[str] = None
    seq: Optional[int] = None
    listeners: Optional[int] = None

    def to_dict(self) -> dict:
        """Convert to dictionary, excluding None values."""
        result = {}
        for key, value in asdict(self).items():
            if value is not None:
                result[key] = value
        # Add any extra kwargs
        for key, value in self.__dict__.items():
            if key not in result and value is not None:
                result[key] = value
        return result


# --------------------------------------------------------------------------- #
# JSON Formatter
# --------------------------------------------------------------------------- #

class JSONFormatter(logging.Formatter):
    """JSON log formatter with context enrichment."""

    def format(self, record: logging.LogRecord) -> str:
        # Build base context
        context = LogContext(
            timestamp=datetime.utcnow().isoformat() + "Z",
            level=record.levelname,
            logger=record.name,
            message=record.getMessage(),
            correlation_id=get_correlation_id(),
            request_id=get_request_id(),
            room_code=get_room_code(),
            user_type=get_user_type(),
        )

        # Add record attributes
        if hasattr(record, "duration_ms"):
            context.duration_ms = record.duration_ms
        if hasattr(record, "status_code"):
            context.status_code = record.status_code
        if hasattr(record, "method"):
            context.method = record.method
        if hasattr(record, "path"):
            context.path = record.path
        if hasattr(record, "error"):
            context.error = record.error
        if hasattr(record, "provider"):
            context.provider = record.provider
        if hasattr(record, "lang"):
            context.lang = record.lang
        if hasattr(record, "seq"):
            context.seq = record.seq
        if hasattr(record, "listeners"):
            context.listeners = record.listeners

        # Add exception info
        if record.exc_info:
            context.error = self.formatException(record.exc_info)

        return json.dumps(context.to_dict(), ensure_ascii=False)


class HumanFormatter(logging.Formatter):
    """Human-readable formatter for development."""

    def format(self, record: logging.LogRecord) -> str:
        cid = get_correlation_id()
        rid = get_request_id()
        room = get_room_code()
        utype = get_user_type()
        
        prefix_parts = []
        if cid:
            prefix_parts.append(f"cid={cid}")
        if rid:
            prefix_parts.append(f"rid={rid}")
        if room:
            prefix_parts.append(f"room={room}")
        if utype:
            prefix_parts.append(f"user={utype}")
        
        prefix = f"[{' '.join(prefix_parts)}] " if prefix_parts else ""
        
        msg = super().format(record)
        return f"{prefix}{msg}"


# --------------------------------------------------------------------------- #
# Logger setup
# --------------------------------------------------------------------------- #

def setup_logging(
    level: str = "INFO",
    json_format: bool = False,
    include_uvicorn: bool = True,
) -> logging.Logger:
    """Configure application logging."""
    
    log_level = getattr(logging, level.upper(), logging.INFO)
    
    # Create root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Clear existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)
    
    # Choose formatter
    if json_format or os.getenv("LOG_JSON", "").lower() == "true":
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(HumanFormatter(
            fmt="%(asctime)s %(levelname)-8s %(name)s %(message)s",
            datefmt="%H:%M:%S"
        ))
    
    root_logger.addHandler(handler)
    
    # Configure uvicorn loggers
    if include_uvicorn:
        for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
            uvicorn_logger = logging.getLogger(name)
            uvicorn_logger.handlers = []
            uvicorn_logger.propagate = True
    
    # Reduce noise from some libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("websockets").setLevel(logging.WARNING)
    
    return root_logger


# --------------------------------------------------------------------------- #
# Middleware for request logging
# --------------------------------------------------------------------------- #

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log HTTP requests/responses with correlation IDs."""

    async def dispatch(self, request: Request, call_next):
        # Generate correlation ID
        cid = request.headers.get("x-correlation-id") or str(uuid.uuid4())[:8]
        set_correlation_id(cid)
        set_request_id(str(uuid.uuid4())[:12])
        
        # Extract room code from path if present
        room_code = None
        if "/ws/" in request.url.path:
            parts = request.url.path.split("/")
            for i, part in enumerate(parts):
                if part in ("broadcast", "listen") and i + 1 < len(parts):
                    room_code = parts[i + 1].split("?")[0]
                    break
        elif "/api/session/" in request.url.path:
            parts = request.url.path.split("/")
            for i, part in enumerate(parts):
                if part == "session" and i + 1 < len(parts):
                    room_code = parts[i + 1].split("?")[0]
                    break
        set_room_code(room_code)
        
        start_time = time.perf_counter()
        
        # Log request
        logger = logging.getLogger("http.request")
        logger.info(
            "HTTP request",
            extra={
                "method": request.method,
                "path": request.url.path,
                "query": str(request.query_params),
                "client": request.client.host if request.client else None,
            }
        )
        
        try:
            response = await call_next(request)
            duration_ms = (time.perf_counter() - start_time) * 1000
            
            # Log response
            logger.info(
                "HTTP response",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": round(duration_ms, 2),
                }
            )
            
            # Add correlation ID to response headers
            response.headers["x-correlation-id"] = cid
            
            return response
            
        except Exception as exc:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                "HTTP error",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": round(duration_ms, 2),
                    "error": str(exc),
                },
                exc_info=True
            )
            raise


# --------------------------------------------------------------------------- #
# WebSocket logging helpers
# --------------------------------------------------------------------------- #

def log_ws_message(direction: str, message_type: str, **extra):
    """Log WebSocket message with context."""
    logger = logging.getLogger("ws.message")
    logger.info(
        f"WS {direction}: {message_type}",
        extra={
            "direction": direction,
            "message_type": message_type,
            **extra
        }
    )


def log_ws_connection(event: str, **extra):
    """Log WebSocket connection event."""
    logger = logging.getLogger("ws.connection")
    logger.info(
        f"WS {event}",
        extra={
            "event": event,
            **extra
        }
    )


# --------------------------------------------------------------------------- #
# Translation/STT logging helpers
# --------------------------------------------------------------------------- #

def log_translation(provider: str, latency_ms: float, success: bool, **extra):
    """Log translation request."""
    logger = logging.getLogger("translation")
    logger.info(
        f"Translation {'success' if success else 'failed'}",
        extra={
            "provider": provider,
            "duration_ms": round(latency_ms, 2),
            "success": success,
            **extra
        }
    )


def log_stt(provider: str, latency_ms: float, success: bool, **extra):
    """Log STT request."""
    logger = logging.getLogger("stt")
    logger.info(
        f"STT {'success' if success else 'failed'}",
        extra={
            "provider": provider,
            "duration_ms": round(latency_ms, 2),
            "success": success,
            **extra
        }
    )


def log_provider_fallback(from_provider: str, to_provider: str, reason: str):
    """Log provider fallback."""
    logger = logging.getLogger("translation.fallback")
    logger.warning(
        f"Provider fallback: {from_provider} -> {to_provider}",
        extra={
            "from_provider": from_provider,
            "to_provider": to_provider,
            "reason": reason,
        }
    )


# --------------------------------------------------------------------------- #
# Context managers for correlation ID
# --------------------------------------------------------------------------- #

@asynccontextmanager
async def correlation_context(cid: Optional[str] = None):
    """Context manager to set correlation ID for async operations."""
    old_cid = correlation_id_var.get()
    new_cid = cid or str(uuid.uuid4())[:8]
    correlation_id_var.set(new_cid)
    try:
        yield new_cid
    finally:
        if old_cid:
            correlation_id_var.set(old_cid)
        else:
            correlation_id_var.set(None)


@asynccontextmanager
async def request_context(rid: Optional[str] = None):
    """Context manager to set request ID."""
    old_rid = request_id_var.get()
    new_rid = rid or str(uuid.uuid4())[:12]
    request_id_var.set(new_rid)
    try:
        yield new_rid
    finally:
        if old_rid:
            request_id_var.set(old_rid)
        else:
            request_id_var.set(None)


# --------------------------------------------------------------------------- #
# Convenience functions
# --------------------------------------------------------------------------- #

def log_info(message: str, **extra):
    """Log info with current context."""
    logging.getLogger("app").info(message, extra=extra)


def log_warning(message: str, **extra):
    """Log warning with current context."""
    logging.getLogger("app").warning(message, extra=extra)


def log_error(message: str, **extra):
    """Log error with current context."""
    logging.getLogger("app").error(message, extra=extra)


def log_debug(message: str, **extra):
    """Log debug with current context."""
    logging.getLogger("app").debug(message, extra=extra)


def log_exception(message: str, **extra):
    """Log exception with current context."""
    logging.getLogger("app").exception(message, extra=extra)