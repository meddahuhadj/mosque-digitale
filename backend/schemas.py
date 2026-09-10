"""
schemas.py — Pydantic models for request/response validation.
"""

from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class SessionCreateRequest(BaseModel):
    glossary: str = Field("", max_length=4000)
    mosque_name: str = Field("", max_length=120)
    target_langs: list[str] = Field(default_factory=list)

    @field_validator("glossary", "mosque_name")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()[: (4000 if "glossary" in cls.__name__.lower() or cls is SessionCreateRequest else 120)]


class SessionResponse(BaseModel):
    code: str
    broadcaster_token: str
    mosque_name: str
    target_langs: list[str]
    join_url: str
    listeners: int = 0


class HealthResponse(BaseModel):
    ok: bool
    rooms: int
    rooms_live: int
    rooms_idle: int
    listeners: int
    segments_total: int
    segments_dropped: int
    translate_last_error: str | None
    translate_last_provider: str | None
    model: str
    redis: dict


class LanguagesResponse(BaseModel):
    languages: list[dict[str, str]]


class ReportRequest(BaseModel):
    """Corps de la requête de rapport de session (résumé de la khutbah).

    `transcript` : si vide, le backend utilise l'historique de la Room.
    Chaque entrée : {arabic, ts?, is_quran?, quran_ref?, is_hadith?}.
    """
    transcript: list[dict] = Field(default_factory=list)
    lang: str = "fr"


class AskRequest(BaseModel):
    """Question posée à « Ask My Mosque » (réponse IA ancrée sur la session)."""
    question: str = Field("", max_length=500)
    lang: str = "fr"
