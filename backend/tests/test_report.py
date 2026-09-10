"""Tests de l'endpoint /api/session/{code}/report (rapport automatique)."""
import pytest
from fastapi.testclient import TestClient

import main
import translator


async def _fake_summarize(transcript, *, lang="fr", mosque="", glossary=""):
    _fake_summarize.calls.append({"lang": lang, "n": len(transcript)})
    return {
        "sujet": "La taqwa",
        "langue": lang,
        "duree_min": 12,
        "versets": ["Sourate 2:153"],
        "hadiths": [],
        "points_principaux": ["La patience dans l'Ã©preuve"],
        "a_retentir": ["Invoquer Allah avant la rÃ©solution"],
        "avertissements": [],
    }


@pytest.fixture
def fake_report(monkeypatch, app_client):
    fake_report.calls = []
    _fake_summarize.calls = fake_report.calls
    monkeypatch.setattr(main.translator, "summarize_session", _fake_summarize)
    return fake_report


def _create_session(client: TestClient) -> dict:
    r = client.post("/api/session", json={"mosque_name": "MosquÃ©e d'Essalam"})
    assert r.status_code == 200, r.text
    return r.json()


def _transcript(n: int = 2) -> list[dict]:
    return [
        {"arabic": f"Phrase arabe {i}", "ts": 1700000000000 + i * 60000,
         "is_quran": i == 0, "quran_ref": "2:153" if i == 0 else None}
        for i in range(n)
    ]


def test_report_requires_token_unless_stopped(app_client, fake_report):
    client = app_client
    s = _create_session(client)
    r = client.post(f"/api/session/{s['code']}/report",
                    json={"transcript": _transcript(), "lang": "fr"})
    assert r.status_code == 403


def test_report_too_few_segments(app_client, fake_report):
    client = app_client
    s = _create_session(client)
    r = client.post(f"/api/session/{s['code']}/report",
                    params={"token": s["broadcaster_token"]},
                    json={"transcript": [_transcript()[0]], "lang": "fr"})
    assert r.status_code == 400


def test_report_generates_and_caches(app_client, fake_report):
    client = app_client
    s = _create_session(client)
    params = {"token": s["broadcaster_token"]}
    body = {"transcript": _transcript(), "lang": "fr"}

    r1 = client.post(f"/api/session/{s['code']}/report", params=params, json=body)
    assert r1.status_code == 200, r1.text
    data = r1.json()
    assert data["sujet"] == "La taqwa"
    assert data["duree_min"] == 12
    assert data["versets"] == ["Sourate 2:153"]

    r2 = client.post(f"/api/session/{s['code']}/report", params=params, json=body)
    assert r2.status_code == 200
    assert len(fake_report.calls) == 1, "le rapport doit Ãªtre mis en cache"
    assert fake_report.calls[0]["lang"] == "fr"
    assert fake_report.calls[0]["n"] == 2


def test_report_with_empty_transcript_uses_room_history(app_client, fake_report):
    client = app_client
    s = _create_session(client)
    for rec in _transcript(3):
        main.get_room(s["code"]).history.append(rec)
    r = client.post(f"/api/session/{s['code']}/report",
                    params={"token": s["broadcaster_token"]},
                    json={"lang": "fr"})
    assert r.status_code == 200, r.text
    assert fake_report.calls[0]["n"] == 3


def test_report_allowed_after_stop(app_client, fake_report):
    client = app_client
    s = _create_session(client)
    room = main.get_room(s["code"])
    room.status = "stopped"
    for rec in _transcript(2):
        room.history.append(rec)
    r = client.post(f"/api/session/{s['code']}/report", json={"lang": "fr"})
    assert r.status_code == 200, r.text


def test_report_502_when_no_provider(app_client, fake_report, monkeypatch):
    client = app_client
    s = _create_session(client)

    async def _none(*a, **k):
        return None
    monkeypatch.setattr(main.translator, "summarize_session", _none)
    monkeypatch.setattr(main.translator, "last_error", lambda: "quota")

    r = client.post(f"/api/session/{s['code']}/report",
                    params={"token": s["broadcaster_token"]},
                    json={"transcript": _transcript(), "lang": "fr"})
    assert r.status_code == 502


def test_report_404_unknown_session(app_client, fake_report):
    r = (app_client
         .post("/api/session/XXXXXX/report",
               params={"token": "nimporte"},
               json={"transcript": _transcript(), "lang": "fr"}))
    assert r.status_code == 404


async def _fake_ask(question, transcript, *, lang="fr", mosque="", glossary=""):
    _fake_ask.calls.append({"question": question, "lang": lang, "n": len(transcript)})
    return {"answer": f"RÃ©ponse en {lang}", "references": []}


@pytest.fixture
def fake_ask(monkeypatch, app_client):
    fake_ask.calls = []
    _fake_ask.calls = fake_ask.calls
    monkeypatch.setattr(main.translator, "ask_question", _fake_ask)
    return fake_ask


def test_ask_answers_and_uses_room_history(app_client, fake_ask):
    client = app_client
    s = _create_session(client)
    room = main.get_room(s["code"])
    for rec in _transcript(3):
        room.history.append(rec)
    r = client.post(f"/api/session/{s['code']}/ask",
                    json={"question": "Qu'est-ce que l'imam a dit ?", "lang": "fr"})
    assert r.status_code == 200, r.text
    assert r.json()["answer"].startswith("RÃ©ponse en fr")
    assert fake_ask.calls[0]["n"] == 3


def test_ask_rate_limited(app_client, fake_ask):
    client = app_client
    s = _create_session(client)                     # consomme 1 crÃ©neau d'IP
    for _ in range(main._RL_MAX - 1):                # 11 de plus = 12 au total
        r = client.post(f"/api/session/{s['code']}/ask",
                        json={"question": "bonjour", "lang": "fr"})
        assert r.status_code == 200, r.text
    r = client.post(f"/api/session/{s['code']}/ask",
                    json={"question": "encore", "lang": "fr"})
    assert r.status_code == 429


def test_ask_too_short_or_404(app_client, fake_ask):
    client = app_client
    s = _create_session(client)
    r = client.post(f"/api/session/{s['code']}/ask", json={"question": "x", "lang": "fr"})
    assert r.status_code == 400
    r = client.post("/api/session/ZZZZZZ/ask", json={"question": "bonjour", "lang": "fr"})
    assert r.status_code == 404


def test_stats_endpoint_summary(app_client):
    import time as _t
    client = app_client
    s = _create_session(client)
    room = main.get_room(s["code"])
    for rec in _transcript(3):
        room.history.append(rec)
    room.live_started_at = _t.time() - 300
    room.total_joins = 7
    room.seq = 3
    room.stats_series.append({"t": 1, "n": 5, "langs": {"fr": 5}})
    room.peak_listeners = 5  # le pic est capturé par note_peak() à l'arrivée réelle d'auditeurs
    r = client.get(f"/api/session/{s['code']}/stats")
    assert r.status_code == 200
    d = r.json()
    assert d["total_joins"] == 7
    assert d["live_minutes"] == 5.0
    assert d["peak_listeners"] == 5
    assert d["listeners_now"] == 0
    assert len(d["series"]) == 1 and d["series"][0]["n"] == 5
    r = client.get("/api/session/ZZZZZZ/stats")
    assert r.status_code == 404