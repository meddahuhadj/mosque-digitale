"""
metrics.py — Prometheus metrics for the khutbah translation service.

Provides counters, gauges, and histograms for monitoring:
- Room and session metrics
- Translation provider metrics
- WebSocket connection metrics
- Latency and error tracking
"""

from __future__ import annotations

from prometheus_client import Counter, Gauge, Histogram, CollectorRegistry, generate_latest, CONTENT_TYPE_LATEST

# Create a custom registry
registry = CollectorRegistry()

# --------------------------------------------------------------------------- #
# Room/Session metrics
# --------------------------------------------------------------------------- #

rooms_total = Gauge(
    "khutbah_rooms_total",
    "Total number of rooms (sessions) currently in memory",
    registry=registry
)

rooms_live = Gauge(
    "khutbah_rooms_live",
    "Number of rooms currently live (broadcasting)",
    registry=registry
)

rooms_idle = Gauge(
    "khutbah_rooms_idle",
    "Number of rooms in idle state (created but not started)",
    registry=registry
)

listeners_total = Gauge(
    "khutbah_listeners_total",
    "Total number of listeners across all rooms",
    registry=registry
)

listeners_by_lang = Gauge(
    "khutbah_listeners_by_lang",
    "Number of listeners per language",
    ["lang"],
    registry=registry
)

segments_total = Counter(
    "khutbah_segments_total",
    "Total number of segments processed",
    registry=registry
)

segments_dropped = Counter(
    "khutbah_segments_dropped_total",
    "Total number of segments dropped due to backlog",
    registry=registry
)

# --------------------------------------------------------------------------- #
# Translation metrics
# --------------------------------------------------------------------------- #

translation_requests = Counter(
    "khutbah_translation_requests_total",
    "Total number of translation requests",
    ["provider", "status"],  # status: success, error, degraded
    registry=registry
)

translation_latency = Histogram(
    "khutbah_translation_latency_seconds",
    "Translation latency in seconds",
    ["provider"],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0],
    registry=registry
)

translation_provider_active = Gauge(
    "khutbah_translation_provider_active",
    "Currently active translation provider (1 = active, 0 = inactive)",
    ["provider"],
    registry=registry
)

gemini_quota_exhausted = Counter(
    "khutbah_gemini_quota_exhausted_total",
    "Number of times Gemini quota was exhausted",
    registry=registry
)

provider_fallback = Counter(
    "khutbah_provider_fallback_total",
    "Number of times translation fell back to another provider",
    ["from_provider", "to_provider"],
    registry=registry
)

# --------------------------------------------------------------------------- #
# STT metrics
# --------------------------------------------------------------------------- #

stt_requests = Counter(
    "khutbah_stt_requests_total",
    "Total number of STT requests",
    ["provider", "status"],
    registry=registry
)

stt_latency = Histogram(
    "khutbah_stt_latency_seconds",
    "STT latency in seconds",
    ["provider"],
    buckets=[0.5, 1.0, 2.0, 5.0, 10.0, 30.0],
    registry=registry
)

# --------------------------------------------------------------------------- #
# WebSocket metrics
# --------------------------------------------------------------------------- #

ws_connections_active = Gauge(
    "khutbah_ws_connections_active",
    "Currently active WebSocket connections",
    ["type"],  # broadcaster, listener
    registry=registry
)

ws_connections_total = Counter(
    "khutbah_ws_connections_total",
    "Total WebSocket connections established",
    ["type"],
    registry=registry
)

ws_messages_received = Counter(
    "khutbah_ws_messages_received_total",
    "Total WebSocket messages received",
    ["type", "message_type"],
    registry=registry
)

ws_errors = Counter(
    "khutbah_ws_errors_total",
    "Total WebSocket errors",
    ["type", "error_type"],
    registry=registry
)

# --------------------------------------------------------------------------- #
# Redis metrics
# --------------------------------------------------------------------------- #

redis_connected = Gauge(
    "khutbah_redis_connected",
    "Redis connection status (1 = connected, 0 = disconnected)",
    registry=registry
)

redis_latency = Histogram(
    "khutbah_redis_latency_seconds",
    "Redis operation latency in seconds",
    ["operation"],
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0],
    registry=registry
)

redis_errors = Counter(
    "khutbah_redis_errors_total",
    "Total Redis errors",
    ["operation"],
    registry=registry
)

# --------------------------------------------------------------------------- #
# HTTP metrics
# --------------------------------------------------------------------------- #

http_requests = Counter(
    "khutbah_http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"],
    registry=registry
)

http_latency = Histogram(
    "khutbah_http_latency_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
    registry=registry
)

# --------------------------------------------------------------------------- #
# Helper functions
# --------------------------------------------------------------------------- #

def update_room_metrics(rooms: dict) -> None:
    """Update room-related gauges from in-memory rooms."""
    rooms_total.set(len(rooms))
    live_count = sum(1 for r in rooms.values() if r.status == "live")
    idle_count = sum(1 for r in rooms.values() if r.status == "idle")
    rooms_live.set(live_count)
    rooms_idle.set(idle_count)

    total_listeners = sum(r.listener_count for r in rooms.values())
    listeners_total.set(total_listeners)

    # Aggregate by language
    lang_counts = {}
    for room in rooms.values():
        for lang, count in room.lang_breakdown().items():
            lang_counts[lang] = lang_counts.get(lang, 0) + count
    for lang, count in lang_counts.items():
        listeners_by_lang.labels(lang=lang).set(count)


def record_translation(provider: str, latency: float, success: bool, degraded: bool = False) -> None:
    """Record a translation request."""
    status = "success" if success else ("degraded" if degraded else "error")
    translation_requests.labels(provider=provider, status=status).inc()
    translation_latency.labels(provider=provider).observe(latency)


def record_stt(provider: str, latency: float, success: bool) -> None:
    """Record an STT request."""
    status = "success" if success else "error"
    stt_requests.labels(provider=provider, status=status).inc()
    stt_latency.labels(provider=provider).observe(latency)


def record_provider_fallback(from_provider: str, to_provider: str) -> None:
    """Record a provider fallback."""
    provider_fallback.labels(from_provider=from_provider, to_provider=to_provider).inc()


def set_active_provider(provider: str) -> None:
    """Set the currently active translation provider."""
    for p in ["gemini", "groq", "openrouter", "azure"]:
        translation_provider_active.labels(provider=p).set(1 if p == provider else 0)


def record_ws_connection(ws_type: str, delta: int = 1) -> None:
    """Record WebSocket connection change (delta: +1 for connect, -1 for disconnect)."""
    if delta > 0:
        ws_connections_total.labels(type=ws_type).inc()
    ws_connections_active.labels(type=ws_type).inc(delta)


def record_ws_message(ws_type: str, message_type: str) -> None:
    """Record a WebSocket message."""
    ws_messages_received.labels(type=ws_type, message_type=message_type).inc()


def record_ws_error(ws_type: str, error_type: str) -> None:
    """Record a WebSocket error."""
    ws_errors.labels(type=ws_type, error_type=error_type).inc()


def record_redis_operation(operation: str, latency: float, success: bool) -> None:
    """Record a Redis operation."""
    redis_latency.labels(operation=operation).observe(latency)
    if not success:
        redis_errors.labels(operation=operation).inc()


def set_redis_connected(connected: bool) -> None:
    """Set Redis connection status."""
    redis_connected.set(1 if connected else 0)


def record_http_request(method: str, endpoint: str, status: int, latency: float) -> None:
    """Record an HTTP request."""
    http_requests.labels(method=method, endpoint=endpoint, status=str(status)).inc()
    http_latency.labels(method=method, endpoint=endpoint).observe(latency)


async def metrics_endpoint(request) -> tuple[bytes, dict]:
    """Generate Prometheus metrics output."""
    # Update dynamic metrics before generating output
    from main import ROOMS
    update_room_metrics(ROOMS)

    return generate_latest(registry), {"Content-Type": CONTENT_TYPE_LATEST}