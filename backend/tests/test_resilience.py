"""Tests for resilience.py — circuit breaker and retry logic."""
import asyncio

import pytest

from resilience import (
    CircuitBreaker,
    CircuitState,
    call_with_circuit_breaker,
    call_with_retry,
    get_breaker,
)


class Counter:
    def __init__(self):
        self.v = 0

    def inc(self):
        self.v += 1


@pytest.mark.asyncio
async def test_circuit_breaker_closed_on_success():
    cb = CircuitBreaker("test", failure_threshold=3)
    assert cb.state == CircuitState.CLOSED
    cb.record_success()
    assert cb.state == CircuitState.CLOSED


@pytest.mark.asyncio
async def test_circuit_breaker_opens_after_failures():
    cb = CircuitBreaker("test", failure_threshold=3)
    cb.record_failure()
    cb.record_failure()
    assert cb.state == CircuitState.CLOSED
    cb.record_failure()
    assert cb.state == CircuitState.OPEN
    assert not cb.can_attempt()


@pytest.mark.asyncio
async def test_circuit_breaker_half_open_after_timeout():
    cb = CircuitBreaker("test", failure_threshold=2, recovery_timeout=0.1)
    cb.record_failure()
    cb.record_failure()
    assert cb.state == CircuitState.OPEN
    assert not cb.can_attempt()
    await asyncio.sleep(0.15)
    assert cb.can_attempt()
    assert cb.state == CircuitState.HALF_OPEN


@pytest.mark.asyncio
async def test_circuit_breaker_closes_after_success_in_half_open():
    cb = CircuitBreaker("test", failure_threshold=2, recovery_timeout=0.1, success_threshold=2)
    cb.record_failure()
    cb.record_failure()
    await asyncio.sleep(0.15)
    assert cb.can_attempt()  # triggers transition to HALF_OPEN
    assert cb.state == CircuitState.HALF_OPEN
    cb.record_success()
    assert cb.state == CircuitState.HALF_OPEN
    cb.record_success()
    assert cb.state == CircuitState.CLOSED


@pytest.mark.asyncio
async def test_call_with_circuit_breaker_success():
    cb = CircuitBreaker("test")
    called = Counter()
    result = await call_with_circuit_breaker(cb, lambda: (called.inc(), "ok")[1])
    assert result == "ok"
    assert cb.state == CircuitState.CLOSED


@pytest.mark.asyncio
async def test_call_with_circuit_breaker_failure():
    cb = CircuitBreaker("test", failure_threshold=2)

    async def fail():
        called.inc()
        raise RuntimeError("boom")

    called = Counter()
    with pytest.raises(RuntimeError):
        await call_with_circuit_breaker(cb, fail)
    assert cb.failure_count == 1


@pytest.mark.asyncio
async def test_call_with_circuit_breaker_fallback():
    cb = CircuitBreaker("test", failure_threshold=1)
    fb_called = Counter()

    async def fail():
        raise RuntimeError("boom")

    async def fallback():
        fb_called.inc()
        return "fallback"

    result = await call_with_circuit_breaker(cb, fail, fallback=fallback)
    assert result == "fallback"
    assert fb_called.v == 1


@pytest.mark.asyncio
async def test_get_breaker_returns_same_instance():
    b1 = get_breaker("same")
    b2 = get_breaker("same")
    assert b1 is b2


@pytest.mark.asyncio
async def test_retry_succeeds_after_failure():
    call_count = 0

    async def flaky():
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise RuntimeError("fail")
        return "ok"

    result = await call_with_retry(flaky)
    assert result == "ok"
    assert call_count == 3


@pytest.mark.asyncio
async def test_retry_raises_after_max():
    async def always_fail():
        raise RuntimeError("always")

    with pytest.raises(RuntimeError):
        await call_with_retry(always_fail, config=None)
