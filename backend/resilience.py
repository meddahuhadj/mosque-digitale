"""
resilience.py — Circuit breaker and retry logic for external API calls.

Provides:
- CircuitBreaker: prevents cascading failures when external APIs are down
- RetryConfig: configuration for retry behavior
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass
from enum import Enum
from typing import Any, Callable, TypeVar

T = TypeVar("T")


class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


@dataclass
class RetryConfig:
    max_attempts: int = 3
    initial_delay: float = 1.0
    max_delay: float = 10.0
    exponential_base: float = 2.0
    retryable_status: tuple[int, ...] = (429, 500, 502, 503, 504)


class CircuitBreaker:
    """Circuit breaker for external API calls."""

    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
        success_threshold: int = 2,
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold
        self.failure_count = 0
        self.success_count = 0
        self.state = CircuitState.CLOSED
        self.last_failure_time = 0.0

    def record_success(self) -> None:
        """Record a successful call."""
        self.failure_count = 0
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self.state = CircuitState.CLOSED
                self.success_count = 0

    def record_failure(self) -> None:
        """Record a failed call."""
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

    def can_attempt(self) -> bool:
        """Check if a call can be attempted."""
        if self.state == CircuitState.CLOSED:
            return True
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time >= self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
                return True
            return False
        if self.state == CircuitState.HALF_OPEN:
            return True
        return False


# Global circuit breakers for each provider
_breakers: dict[str, CircuitBreaker] = {}


def get_breaker(name: str) -> CircuitBreaker:
    """Get or create a circuit breaker for the given provider."""
    if name not in _breakers:
        _breakers[name] = CircuitBreaker(
            name=name,
            failure_threshold=5,
            recovery_timeout=30.0,
        )
    return _breakers[name]


async def call_with_circuit_breaker(
    breaker: CircuitBreaker,
    func: Callable[[], Any],
    fallback: Callable[[], Any] | None = None,
) -> Any:
    """Execute a function with circuit breaker protection."""
    if not breaker.can_attempt():
        if fallback:
            return await fallback() if asyncio.iscoroutinefunction(fallback) else fallback()
        raise Exception(f"Circuit breaker open for {breaker.name}")
    try:
        result = await func() if asyncio.iscoroutinefunction(func) else func()
        breaker.record_success()
        return result
    except Exception as exc:
        breaker.record_failure()
        if fallback:
            try:
                return await fallback() if asyncio.iscoroutinefunction(fallback) else fallback()
            except Exception:
                pass
        raise exc


async def call_with_retry(
    func: Callable[[], Any],
    config: RetryConfig | None = None,
    retryable: Callable[[Exception], bool] | None = None,
) -> Any:
    """Execute a function with retry logic."""
    config = config or RetryConfig()
    last_exception: Exception | None = None

    for attempt in range(config.max_attempts):
        try:
            return await func() if asyncio.iscoroutinefunction(func) else func()
        except Exception as exc:
            last_exception = exc
            if attempt + 1 >= config.max_attempts:
                break
            if retryable and not retryable(exc):
                break
            delay = min(
                config.initial_delay * (config.exponential_base ** attempt),
                config.max_delay,
            )
            await asyncio.sleep(delay)

    if last_exception:
        raise last_exception
    raise RuntimeError("Retry failed with no exception")
