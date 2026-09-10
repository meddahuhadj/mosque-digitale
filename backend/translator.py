"""
translator.py — Traduction & transcription avec **chaîne de repli multi-fournisseurs**.

API publique (inchangée) :
  - translate_segment(arabic_text, target_langs, glossary="", *, use_cache=True) -> dict | None
  - transcribe_audio(audio_bytes, mime_type) -> str | None
  - has_api_key() -> bool          (au moins un fournisseur est configuré)
  - last_error() -> str            (raison du dernier échec : quota / auth / network / ...)
  - last_provider() -> str         (fournisseur ayant produit la dernière traduction)
  - aclose()

Fournisseurs de TRADUCTION essayés dans l'ordre de TRANSLATE_PROVIDERS
(défaut : gemini,groq,openrouter,azure). Seuls ceux dont la/les clé(s) sont
présentes sont réellement tentés. Le premier qui répond gagne ; sinon → None
(le backend passe en mode dégradé : diffusion de l'arabe sans traduction).

  gemini      GEMINI_API_KEY  (ou GEMINI_API_KEYS="k1,k2,k3" pour la rotation),
              GEMINI_MODEL (défaut gemini-2.5-flash-lite)
  groq        GROQ_API_KEY, GROQ_MODEL (défaut llama-3.3-70b-versatile)   — OpenAI-compatible
  openrouter  OPENROUTER_API_KEY, OPENROUTER_MODEL
              (défaut meta-llama/llama-3.3-70b-instruct:free)              — OpenAI-compatible
  azure       AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_REGION                — MT pure (2 M car./mois gratuits)

Fournisseurs de TRANSCRIPTION (STT_PROVIDERS, défaut : groq,gemini) :
  groq        GROQ_API_KEY  -> whisper-large-v3 (excellent en arabe / darija)
  gemini      GEMINI_API_KEY
"""

from __future__ import annotations

import asyncio
import base64
import json
import os
import time
from collections import OrderedDict
from pathlib import Path

import httpx

from resilience import get_breaker, call_with_circuit_breaker

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #


def _keys(*names: str) -> list[str]:
    out: list[str] = []
    for n in names:
        for part in os.getenv(n, "").split(","):
            k = part.strip()
            if k and k not in out:
                out.append(k)
    return out


GEMINI_KEYS = _keys("GEMINI_API_KEYS", "GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite").strip()
MODEL = GEMINI_MODEL  # rétro-compat (affiché dans /healthz)
_GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"

GROQ_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
GROQ_STT_MODEL = os.getenv("GROQ_STT_MODEL", "whisper-large-v3").strip()
_GROQ_BASE = "https://api.groq.com/openai/v1"

OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
OPENROUTER_MODEL = os.getenv(
    "OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free"
).strip()
_OPENROUTER_BASE = "https://openrouter.ai/api/v1"

AZURE_KEY = os.getenv("AZURE_TRANSLATOR_KEY", "").strip()
AZURE_REGION = os.getenv("AZURE_TRANSLATOR_REGION", "").strip()
_AZURE_URL = "https://api.cognitive.microsofttranslator.com/translate"
_AZURE_LANGS = {"fr", "en", "nl", "de", "es", "tr", "ur", "bn", "ha", "ar"}

TRANSLATE_PROVIDERS = [
    p.strip() for p in os.getenv(
        "TRANSLATE_PROVIDERS", "gemini,groq,openrouter,azure"
    ).split(",") if p.strip()
]
STT_PROVIDERS = [
    p.strip() for p in os.getenv("STT_PROVIDERS", "groq,gemini").split(",") if p.strip()
]

REQUEST_TIMEOUT = 22.0
CACHE_SIZE = 400
CACHE_TTL = 60 * 45

# --------------------------------------------------------------------------- #
# Prompt système (SYSTEM_PROMPT.md, repli inline)
# --------------------------------------------------------------------------- #

_FALLBACK_PROMPT = (
    "Tu es un traducteur spécialisé dans le prêche musulman (khutbah). Tu traduis "
    "fidèlement, sobrement et sans interprétation personnelle, segment par segment, "
    "de l'arabe vers les langues cibles demandées. Conserve les termes islamiques "
    "translittérés d'usage (salât, taqwa, sunnah...) avec au besoin une glose courte "
    "entre parenthèses à la première occurrence. « Allah » reste « Allah ». Rends les "
    "formules d'eulogie. Si le segment cite le Coran, mets is_quran=true et donne "
    "quran_ref si tu la reconnais avec certitude, sinon null ; traduis alors au plus "
    "près du texte. Ne complète jamais une phrase coupée. Réponds UNIQUEMENT en JSON "
    "conforme au schéma, une entrée par langue demandée, aucune langue omise."
)


def _load_system_prompt() -> str:
    for candidate in (
        Path(__file__).resolve().parent.parent / "SYSTEM_PROMPT.md",
        Path(__file__).resolve().parent / "SYSTEM_PROMPT.md",
    ):
        try:
            text = candidate.read_text(encoding="utf-8")
        except OSError:
            continue
        marker = "\n---\n"
        idx = text.find(marker)
        body = (text[idx + len(marker):] if idx != -1 else text).strip()
        if len(body) > 200:
            return body
    return _FALLBACK_PROMPT


SYSTEM_PROMPT = _load_system_prompt()

_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "arabic": {"type": "string"},
        "is_quran": {"type": "boolean"},
        "quran_ref": {"type": "string", "nullable": True},
        "is_hadith": {"type": "boolean"},
        "translations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"lang": {"type": "string"}, "text": {"type": "string"}},
                "required": ["lang", "text"],
            },
        },
    },
    "required": ["arabic", "is_quran", "translations"],
}

# --------------------------------------------------------------------------- #
# Cache LRU + TTL
# --------------------------------------------------------------------------- #

_cache: "OrderedDict[str, tuple[float, dict]]" = OrderedDict()


def _cache_get(key: str):
    hit = _cache.get(key)
    if not hit:
        return None
    ts, value = hit
    if time.time() - ts > CACHE_TTL:
        _cache.pop(key, None)
        return None
    _cache.move_to_end(key)
    return value


def _cache_put(key: str, value: dict):
    _cache[key] = (time.time(), value)
    _cache.move_to_end(key)
    while len(_cache) > CACHE_SIZE:
        _cache.popitem(last=False)


# --------------------------------------------------------------------------- #
# HTTP + état
# --------------------------------------------------------------------------- #

_client: httpx.AsyncClient | None = None


def _http() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT)
    return _client


async def aclose():
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


_last_error = ""       # "" | quota | auth | server | network | bad_response | no_provider
_last_provider = ""
_gemini_key_idx = 0     # rotation


def last_error() -> str:
    return _last_error


def last_provider() -> str:
    return _last_provider


def _provider_configured(name: str) -> bool:
    return {
        "gemini": bool(GEMINI_KEYS),
        "groq": bool(GROQ_KEY),
        "openrouter": bool(OPENROUTER_KEY),
        "azure": bool(AZURE_KEY and AZURE_REGION),
    }.get(name, False)


def has_api_key() -> bool:
    """Vrai si au moins un fournisseur de traduction est utilisable."""
    return any(_provider_configured(p) for p in TRANSLATE_PROVIDERS)


def _status_to_error(code: int) -> str:
    if code in (401, 403):
        return "auth"
    if code == 429:
        return "quota"
    if code >= 500:
        return "server"
    return "bad_response"


def _worst(errors: list[str]) -> str:
    for pref in ("quota", "auth", "server", "bad_response", "network"):
        if pref in errors:
            return pref
    return errors[0] if errors else "no_provider"


# --------------------------------------------------------------------------- #
# Prompt utilisateur commun + parsing JSON commun
# --------------------------------------------------------------------------- #

def _user_msg(arabic_text: str, langs: list[str], glossary: str) -> str:
    gloss = (
        ("GLOSSAIRE DE LA MOSQUÉE (à respecter strictement pour les noms propres, "
         "titres et translittérations) :\n" + glossary + "\n\n") if glossary else ""
    )
    return (
        gloss
        + "Langues cibles (codes) : " + ", ".join(langs) + ".\n"
        "Traduis le segment de khutbah suivant (arabe). Fournis une entrée par langue, "
        "dans cet ordre, sans en omettre aucune. Réponds UNIQUEMENT en JSON conforme "
        "au schéma { arabic, is_quran, quran_ref, is_hadith, "
        "translations:[{lang,text}] }.\n\nSEGMENT :\n" + arabic_text
    )


def _parse_llm_json(raw: str, langs: list[str], arabic_text: str) -> dict | None:
    raw = (raw or "").strip()
    if not raw:
        return None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        s, e = raw.find("{"), raw.rfind("}")
        if s == -1 or e == -1:
            return None
        try:
            data = json.loads(raw[s:e + 1])
        except json.JSONDecodeError:
            return None

    tmap: dict[str, str] = {}
    items = data.get("translations")
    if isinstance(items, list):
        for it in items:
            code = str(it.get("lang", "")).strip()
            if code:
                tmap[code] = str(it.get("text", "")).strip()
    elif isinstance(items, dict):
        for code, txt in items.items():
            tmap[str(code).strip()] = str(txt).strip()
    for l in langs:
        tmap.setdefault(l, "")

    return {
        "arabic": str(data.get("arabic") or arabic_text).strip(),
        "is_quran": bool(data.get("is_quran")),
        "quran_ref": (data.get("quran_ref") or None),
        "is_hadith": bool(data.get("is_hadith")),
        "translations": tmap,
    }


# --------------------------------------------------------------------------- #
# Fournisseur : Gemini (format natif, rotation de clés)
# --------------------------------------------------------------------------- #

async def _prov_gemini(arabic_text, langs, glossary) -> tuple[dict | None, str]:
    global _gemini_key_idx
    if not GEMINI_KEYS:
        return None, "no_provider"
    payload = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": _user_msg(arabic_text, langs, glossary)}]}],
        "generationConfig": {
            "temperature": 0.2, "topP": 0.9, "candidateCount": 1,
            "maxOutputTokens": 2048, "responseMimeType": "application/json",
            "responseSchema": _RESPONSE_SCHEMA,
        },
        "safetySettings": [
            {"category": c, "threshold": "BLOCK_NONE"}
            for c in ("HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH",
                      "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT")
        ],
    }
    url = f"{_GEMINI_BASE}/models/{GEMINI_MODEL}:generateContent"
    err = "network"
    n = len(GEMINI_KEYS)
    for _ in range(n):                       # essaie chaque clé une fois
        key = GEMINI_KEYS[_gemini_key_idx % n]
        _gemini_key_idx += 1
        try:
            r = await _http().post(url, params={"key": key}, json=payload)
        except (httpx.HTTPError, asyncio.TimeoutError) as exc:
            print(f"[gemini] réseau: {exc!r}")
            err = "network"
            continue
        if r.status_code == 200:
            try:
                parts = r.json()["candidates"][0]["content"]["parts"]
                raw = "".join(p.get("text", "") for p in parts)
            except (KeyError, IndexError, TypeError, ValueError):
                return None, "bad_response"
            return _parse_llm_json(raw, langs, arabic_text), ""
        err = _status_to_error(r.status_code)
        print(f"[gemini] HTTP {r.status_code} ({err})")
        if err == "quota":                   # clé épuisée -> essaie la suivante
            continue
        if err == "server":
            continue
        return None, err                     # auth / bad_response : inutile d'insister
    return None, err


# --------------------------------------------------------------------------- #
# Fournisseurs OpenAI-compatibles : Groq, OpenRouter
# --------------------------------------------------------------------------- #

async def _prov_openai_compat(base, key, model, arabic_text, langs, glossary,
                              extra_headers=None) -> tuple[dict | None, str]:
    if not key:
        return None, "no_provider"
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    if extra_headers:
        headers.update(extra_headers)
    body = {
        "model": model,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _user_msg(arabic_text, langs, glossary)},
        ],
    }
    try:
        r = await _http().post(f"{base}/chat/completions", headers=headers, json=body)
    except (httpx.HTTPError, asyncio.TimeoutError) as exc:
        print(f"[{base}] réseau: {exc!r}")
        return None, "network"
    if r.status_code != 200:
        err = _status_to_error(r.status_code)
        print(f"[{base}] HTTP {r.status_code} ({err}): {r.text[:200]}")
        return None, err
    try:
        raw = r.json()["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError, ValueError):
        return None, "bad_response"
    return _parse_llm_json(raw, langs, arabic_text), ""


async def _prov_groq(arabic_text, langs, glossary):
    return await _prov_openai_compat(_GROQ_BASE, GROQ_KEY, GROQ_MODEL,
                                    arabic_text, langs, glossary)


async def _prov_openrouter(arabic_text, langs, glossary):
    return await _prov_openai_compat(
        _OPENROUTER_BASE, OPENROUTER_KEY, OPENROUTER_MODEL, arabic_text, langs, glossary,
        extra_headers={"HTTP-Referer": "https://github.com/", "X-Title": "khutbah-live"},
    )


# --------------------------------------------------------------------------- #
# Fournisseur : Azure AI Translator (MT pure — pas de détection Coran)
# --------------------------------------------------------------------------- #

async def _prov_azure(arabic_text, langs, glossary) -> tuple[dict | None, str]:
    if not (AZURE_KEY and AZURE_REGION):
        return None, "no_provider"
    targets = [l for l in langs if l in _AZURE_LANGS and l != "ar"]
    if not targets:
        return {"arabic": arabic_text, "is_quran": False, "quran_ref": None,
                "is_hadith": False, "translations": {l: "" for l in langs}}, ""
    params = [("api-version", "3.0"), ("from", "ar")] + [("to", t) for t in targets]
    headers = {
        "Ocp-Apim-Subscription-Key": AZURE_KEY,
        "Ocp-Apim-Subscription-Region": AZURE_REGION,
        "Content-Type": "application/json",
    }
    try:
        r = await _http().post(_AZURE_URL, params=params, headers=headers,
                               json=[{"Text": arabic_text}])
    except (httpx.HTTPError, asyncio.TimeoutError) as exc:
        print(f"[azure] réseau: {exc!r}")
        return None, "network"
    if r.status_code != 200:
        err = _status_to_error(r.status_code)
        print(f"[azure] HTTP {r.status_code} ({err}): {r.text[:200]}")
        return None, err
    try:
        trans = r.json()[0]["translations"]
    except (KeyError, IndexError, TypeError, ValueError):
        return None, "bad_response"
    tmap = {t["to"]: t["text"] for t in trans}
    for l in langs:
        tmap.setdefault(l, "")
    return {"arabic": arabic_text, "is_quran": False, "quran_ref": None,
            "is_hadith": False, "translations": tmap}, ""


_TRANSLATE_IMPL = {
    "gemini": _prov_gemini,
    "groq": _prov_groq,
    "openrouter": _prov_openrouter,
    "azure": _prov_azure,
}


# --------------------------------------------------------------------------- #
# API publique : traduction
# --------------------------------------------------------------------------- #

async def translate_segment(
    arabic_text: str,
    target_langs: list[str],
    glossary: str = "",
    *,
    use_cache: bool = True,
) -> dict | None:
    """Traduit `arabic_text` vers `target_langs` via la chaîne de fournisseurs.

    Retourne {arabic, is_quran, quran_ref, is_hadith, translations:{lang:text}}
    ou None si tous les fournisseurs échouent.
    """
    global _last_error, _last_provider

    arabic_text = (arabic_text or "").strip()
    glossary = (glossary or "").strip()[:4000]
    langs = [l for l in dict.fromkeys(target_langs) if l and l != "ar"]
    if not arabic_text or not langs:
        return None

    cache_key = arabic_text + "\x1f" + ",".join(sorted(langs)) + "\x1f" + glossary
    if use_cache:
        cached = _cache_get(cache_key)
        if cached is not None:
            return cached

    chain = [p for p in TRANSLATE_PROVIDERS if _provider_configured(p) and p in _TRANSLATE_IMPL]
    if not chain:
        _last_error = "no_provider"
        return None

    errors: list[str] = []
    for name in chain:
        breaker = get_breaker(name)
        if not breaker.can_attempt():
            print(f"[translate] circuit breaker open for {name}, skipping")
            errors.append("circuit_open")
            continue
        try:
            async def _call():
                result, err = await _TRANSLATE_IMPL[name](arabic_text, langs, glossary)
                return result, err
            result, err = await call_with_circuit_breaker(
                breaker,
                _call,
                fallback=lambda: (None, "circuit_open"),
            )
        except Exception as exc:  # défensif : jamais casser le flux
            print(f"[{name}] exception: {exc!r}")
            result, err = None, "server"
        if result is not None:
            _last_error = ""
            _last_provider = name
            _cache_put(cache_key, result)
            return result
        errors.append(err)

    _last_error = _worst(errors)
    print(f"[translate] tous les fournisseurs ont échoué ({chain} -> {errors})")
    return None


# --------------------------------------------------------------------------- #
# API publique : transcription audio (repli du mode « Audio → serveur »)
# --------------------------------------------------------------------------- #

_STT_INSTRUCTION = (
    "Transcris fidèlement cet extrait audio d'un prêche en ARABE. "
    "Rends UNIQUEMENT le texte arabe prononcé, sans traduction, sans ponctuation "
    "superflue, sans commentaire, sans guillemets."
)


async def _stt_groq(audio_bytes: bytes, mt: str) -> str | None:
    if not GROQ_KEY:
        return None
    ext = {"audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "mp4",
           "audio/mpeg": "mp3", "audio/wav": "wav"}.get(mt, "webm")
    files = {
        "file": (f"chunk.{ext}", audio_bytes, mt or "audio/webm"),
        "model": (None, GROQ_STT_MODEL),
        "language": (None, "ar"),
        "temperature": (None, "0"),
        "response_format": (None, "text"),
    }
    try:
        r = await _http().post(f"{_GROQ_BASE}/audio/transcriptions",
                               headers={"Authorization": f"Bearer {GROQ_KEY}"}, files=files)
    except (httpx.HTTPError, asyncio.TimeoutError) as exc:
        print(f"[groq-stt] réseau: {exc!r}")
        return None
    if r.status_code != 200:
        print(f"[groq-stt] HTTP {r.status_code}: {r.text[:200]}")
        return None
    return (r.text or "").strip().strip('"')


async def _stt_gemini(audio_bytes: bytes, mt: str) -> str | None:
    if not GEMINI_KEYS:
        return None
    b64 = base64.b64encode(audio_bytes).decode("ascii")
    payload = {
        "contents": [{"role": "user", "parts": [
            {"text": _STT_INSTRUCTION},
            {"inlineData": {"mimeType": mt or "audio/webm", "data": b64}},
        ]}],
        "generationConfig": {"temperature": 0.0, "maxOutputTokens": 1024},
    }
    url = f"{_GEMINI_BASE}/models/{GEMINI_MODEL}:generateContent"
    try:
        r = await _http().post(url, params={"key": GEMINI_KEYS[0]}, json=payload)
    except (httpx.HTTPError, asyncio.TimeoutError) as exc:
        print(f"[gemini-stt] réseau: {exc!r}")
        return None
    if r.status_code != 200:
        print(f"[gemini-stt] HTTP {r.status_code}")
        return None
    try:
        parts = r.json()["candidates"][0]["content"]["parts"]
        return "".join(p.get("text", "") for p in parts).strip()
    except (KeyError, IndexError, TypeError, ValueError):
        return None


_STT_IMPL = {"groq": _stt_groq, "gemini": _stt_gemini}


async def transcribe_audio(audio_bytes: bytes, mime_type: str) -> str | None:
    if not audio_bytes:
        return None
    mt = (mime_type or "audio/webm").split(";")[0].strip() or "audio/webm"
    for name in STT_PROVIDERS:
        impl = _STT_IMPL.get(name)
        if not impl:
            continue
        try:
            text = await impl(audio_bytes, mt)
        except Exception as exc:
            print(f"[{name}-stt] exception: {exc!r}")
            text = None
        if text:
            return text
    return None


# --------------------------------------------------------------------------- #
# API publique : rapport de session (résumé automatique de la khutbah)
# --------------------------------------------------------------------------- #

_REPORT_SYS = (
    "Tu es un rédacteur spécialisé dans les comptes-rendus de prêche musulman (khutbah). "
    "À partir de la transcription intégrale fournie, rédige un compte-rendu SOBRE, FIDÈLE et "
    "structuré, dans la langue demandée (code langue fourni). "
    "Consignes strictes :\n"
    "- N'invente RIEN : le sujet, les points, les versets et les hadiths doivent venir "
    "EXCLUSIVEMENT de la transcription fournie.\n"
    "- Ne formule AUCUN jugement d'authenticité sur les hadiths (ne dis pas « authentique » "
    "ou « faible »).\n"
    "- Une référence coranique préfixée de « ≈ » est une référence DEVINÉE : maintiens-la "
    "sous sa forme « ≈ Sourate N:V » (imam à vérifier), et signale-le dans avertissements.\n"
    "- Conserve la terminologie islamique translittérée d'usage (salât, zakât, taqwa, ihsân…)\n"
    "- points_principaux : 3 à 8 idées-clés, une phrase courte chacune.\n"
    "- a_retentir : 2 à 4 actions ou enseignements pratiques à retenir.\n"
    "- versets : citations coraniques sous la forme « Sourate N:V — (texte si fourni) ».\n"
    "- hadiths : uniquement si la transcription en cite, sinon liste vide.\n"
    "- duree_min : entier calculé depuis les horodatages fournis (arrondi).\n"
    "- avertissements : liste de points à vérifier (références devinées, trous de transcription…).\n"
    "Réponds UNIQUEMENT en JSON conforme au schéma, sans texte autour."
)

_REPORT_SCHEMA = {
    "type": "object",
    "properties": {
        "sujet": {"type": "string"},
        "langue": {"type": "string"},
        "duree_min": {"type": "integer"},
        "versets": {"type": "array", "items": {"type": "string"}},
        "hadiths": {"type": "array", "items": {"type": "string"}},
        "points_principaux": {"type": "array", "items": {"type": "string"}},
        "a_retentir": {"type": "array", "items": {"type": "string"}},
        "avertissements": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["sujet", "langue", "duree_min", "points_principaux"],
}


def _parse_obj(raw: str) -> dict | None:
    """Parse JSON d'objet (tolérant aux barrières de texte)."""
    raw = (raw or "").strip()
    if not raw:
        return None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        s, e = raw.find("{"), raw.rfind("}")
        if s == -1 or e == -1:
            return None
        try:
            data = json.loads(raw[s:e + 1])
        except json.JSONDecodeError:
            return None
    return data if isinstance(data, dict) else None


async def _gemini_json(system: str, user: str, schema: dict) -> tuple[dict | None, str]:
    global _gemini_key_idx
    if not GEMINI_KEYS:
        return None, "no_provider"
    payload = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": [{"text": user}]}],
        "generationConfig": {
            "temperature": 0.25, "topP": 0.9, "candidateCount": 1,
            "maxOutputTokens": 2048, "responseMimeType": "application/json",
            "responseSchema": schema,
        },
        "safetySettings": [
            {"category": c, "threshold": "BLOCK_NONE"}
            for c in ("HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH",
                      "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT")
        ],
    }
    url = f"{_GEMINI_BASE}/models/{GEMINI_MODEL}:generateContent"
    err = "network"
    n = len(GEMINI_KEYS)
    for _ in range(n):
        key = GEMINI_KEYS[_gemini_key_idx % n]
        _gemini_key_idx += 1
        try:
            r = await _http().post(url, params={"key": key}, json=payload)
        except (httpx.HTTPError, asyncio.TimeoutError) as exc:
            print(f"[gemini] réseau: {exc!r}")
            err = "network"
            continue
        if r.status_code == 200:
            try:
                parts = r.json()["candidates"][0]["content"]["parts"]
                raw = "".join(p.get("text", "") for p in parts)
            except (KeyError, IndexError, TypeError, ValueError):
                return None, "bad_response"
            data = _parse_obj(raw)
            if data is None:
                return None, "bad_response"
            return data, ""
        err = _status_to_error(r.status_code)
        print(f"[gemini] HTTP {r.status_code} ({err})")
        if err in ("quota", "server"):
            continue
        return None, err
    return None, err


async def _openai_json(base, key, model, system: str, user: str,
                       extra_headers=None) -> tuple[dict | None, str]:
    if not key:
        return None, "no_provider"
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    if extra_headers:
        headers.update(extra_headers)
    body = {
        "model": model,
        "temperature": 0.25,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    try:
        r = await _http().post(f"{base}/chat/completions", headers=headers, json=body)
    except (httpx.HTTPError, asyncio.TimeoutError) as exc:
        print(f"[{base}] réseau: {exc!r}")
        return None, "network"
    if r.status_code != 200:
        err = _status_to_error(r.status_code)
        print(f"[{base}] HTTP {r.status_code} ({err}): {r.text[:200]}")
        return None, err
    try:
        raw = r.json()["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError, ValueError):
        return None, "bad_response"
    data = _parse_obj(raw)
    if data is None:
        return None, "bad_response"
    return data, ""


async def summarize_session(
    transcript: list[dict],
    *,
    lang: str = "fr",
    mosque: str = "",
    glossary: str = "",
) -> dict | None:
    """Génère le rapport automatique d'une session de khutbah.

    `transcript` : liste ordonnée de {arabic, ts?, is_quran?, quran_ref?, is_hadith?}.
    Retourne un dict structuré ou None si tous les fournisseurs échouent.
    """
    global _last_error, _last_provider

    segs = [s for s in transcript if isinstance(s, dict) and str(s.get("arabic") or "").strip()]
    if not segs:
        _last_error = "no_content"
        return None
    if len(segs) > 250:                      # borne : garde la fin de la session
        segs = segs[-250:]
    lang = (lang or "fr").strip()[:8]
    glossary = (glossary or "").strip()[:4000]

    ts_all = [s.get("ts") for s in segs if isinstance(s.get("ts"), (int, float))]
    duree_s = (max(ts_all) - min(ts_all)) / 1000.0 if len(ts_all) >= 2 else 0.0

    head = [f"LANGUE du rapport : {lang}", f"MOSQUÉE : {mosque or '—'}",
            f"DURÉE estimée : {int(round(duree_s / 60.0))} min"]
    if glossary:
        head.append(f"GLOSSAIRE (termes à respecter) : {glossary}")
    user = "\n".join(head) + "\n\nKHUTBAH (segments dans l'ordre) :\n" + _fmt_transcript_lines(segs)

    chain = [p for p in ("gemini", "groq", "openrouter") if _provider_configured(p)]
    if not chain:
        _last_error = "no_provider"
        return None

    errors: list[str] = []
    system = _REPORT_SYS
    for name in chain:
        breaker = get_breaker(name)
        if not breaker.can_attempt():
            errors.append("circuit_open")
            continue
        try:
            if name == "gemini":
                async def _call_g():
                    return await _gemini_json(system, user, _REPORT_SCHEMA)
                impl = _call_g
            elif name == "groq":
                async def _call_gr():
                    return await _openai_json(_GROQ_BASE, GROQ_KEY, GROQ_MODEL, system, user)
                impl = _call_gr
            else:
                async def _call_or():
                    return await _openai_json(
                        _OPENROUTER_BASE, OPENROUTER_KEY, OPENROUTER_MODEL, system, user,
                        extra_headers={"HTTP-Referer": "https://github.com/",
                                       "X-Title": "khutbah"})
                impl = _call_or
            report, err = await call_with_circuit_breaker(
                breaker, impl, fallback=lambda: (None, "circuit_open"))
        except Exception as exc:
            print(f"[{name}] exception: {exc!r}")
            report, err = None, "server"
        if report is not None:
            _last_error = ""
            _last_provider = name
            report["duree_min"] = int(report.get("duree_min") or round(duree_s / 60.0))
            for k in ("versets", "hadiths", "points_principaux", "a_retentir", "avertissements"):
                v = report.get(k)
                report[k] = ([str(x).strip() for x in v
                              if x is not None and str(x).strip()]
                             if isinstance(v, list) else [])
            return report
        errors.append(err)

    _last_error = _worst(errors)
    print(f"[report] tous les fournisseurs ont échoué ({chain} -> {errors})")
    return None


# --------------------------------------------------------------------------- #
# API publique : Ask My Mosque (question-réponse ancrée sur la session)
# --------------------------------------------------------------------------- #

_ASK_SYS = (
    "Tu es l'assistant « Ask My Mosque » d'une mosquée. Tu réponds dans LA LANGUE "
    "demandée (code langue fourni), à partir du prêche (khutbah) fourni en contexte. "
    "Consignes strictes :\n"
    "- Réponds d'abord en te basant sur le contenu de la khutbah fournie (sans l'inventer).\n"
    "- Tu peux compléter par des connaissances islamiques générales, mais TOUJOURS de façon "
    "sobre et prudente : signale quand la réponse sort du cadre du prêche.\n"
    "- Ne présente JAMAIS un avis juridique (fatwa) comme définitif : recommande de consulter "
    "l'imam/savant de la mosquée pour les questions pratiques (prière, famille, finance…).\n"
    "- Ne cite aucun hadith sans être sûr de son contenu ; si tu cites, garde-le succinct et "
    "sans jugement d'authenticité.\n"
    "- Une référence coranique préfixée de « ≈ » est devinée : indique qu'elle est à vérifier.\n"
    "- references : liste courte de références (versets, points du prêche) qui appuient la réponse, "
    "préfixées de « ≈ » si incertaines ; vide si aucune.\n"
    "Réponds UNIQUEMENT en JSON conforme au schéma, sans texte autour."
)

_ASK_SCHEMA = {
    "type": "object",
    "properties": {
        "answer": {"type": "string"},
        "references": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["answer"],
}


async def _run_llm_chain(system: str, user: str, schema: dict) -> dict | None:
    """Appelle la chaîne gemini→groq→openrouter avec breakers et parsing JSON."""
    global _last_error, _last_provider
    chain = [p for p in ("gemini", "groq", "openrouter") if _provider_configured(p)]
    if not chain:
        _last_error = "no_provider"
        return None
    errors: list[str] = []
    for name in chain:
        breaker = get_breaker(name)
        if not breaker.can_attempt():
            errors.append("circuit_open")
            continue
        try:
            if name == "gemini":
                async def _call_g():
                    return await _gemini_json(system, user, schema)
                impl = _call_g
            elif name == "groq":
                async def _call_gr():
                    return await _openai_json(_GROQ_BASE, GROQ_KEY, GROQ_MODEL, system, user)
                impl = _call_gr
            else:
                async def _call_or():
                    return await _openai_json(
                        _OPENROUTER_BASE, OPENROUTER_KEY, OPENROUTER_MODEL, system, user,
                        extra_headers={"HTTP-Referer": "https://github.com/",
                                       "X-Title": "khutbah"})
                impl = _call_or
            data, err = await call_with_circuit_breaker(
                breaker, impl, fallback=lambda: (None, "circuit_open"))
        except Exception as exc:
            print(f"[{name}] exception: {exc!r}")
            data, err = None, "server"
        if data is not None:
            _last_error = ""
            _last_provider = name
            return data
        errors.append(err)
    _last_error = _worst(errors)
    print(f"[ask] tous les fournisseurs ont échoué ({chain} -> {errors})")
    return None


def _fmt_transcript_lines(segs: list[dict]) -> str:
    lines: list[str] = []
    for i, s in enumerate(segs, 1):
        tag = ""
        if s.get("is_quran"):
            ref = s.get("quran_ref")
            tag = f"[verset {ref}]" if ref else "[verset]"
        elif s.get("is_hadith"):
            tag = "[hadith]"
        elif str(s.get("quran_ref", "") or "").strip():
            tag = f"[réf. ≈{s.get('quran_ref')}]"
        lines.append(f"{i}. {tag} {str(s.get('arabic') or '').strip()}")
    return "\n".join(lines)


async def ask_question(
    question: str,
    transcript: list[dict],
    *,
    lang: str = "fr",
    mosque: str = "",
    glossary: str = "",
) -> dict | None:
    """Répond à `question` en s'appuyant sur la khutbah fournie.

    Retourne {answer, references} ou None si tous les fournisseurs échouent.
    """
    global _last_error, _last_provider
    question = (question or "").strip()[:400]
    if not question:
        _last_error = "no_question"
        return None
    lang = (lang or "fr").strip()[:8]
    glossary = (glossary or "").strip()[:4000]

    segs = [s for s in transcript if isinstance(s, dict) and str(s.get("arabic") or "").strip()]
    if len(segs) > 250:                       # borne : garde la fin de la session
        segs = segs[-250:]

    head = [f"LANGUE de la réponse : {lang}", f"MOSQUÉE : {mosque or '—'}"]
    if glossary:
        head.append(f"GLOSSAIRE (termes à respecter) : {glossary}")
    ctx = _fmt_transcript_lines(segs) or "(aucun segment de khutbah transmis)"
    user = ("\n".join(head) +
            "\n\nKHUTBAH (segments dans l'ordre, pour contexte) :\n" + ctx +
            "\n\nQUESTION posée par un fidèle :\n" + question)

    return await _run_llm_chain(_ASK_SYS, user, _ASK_SCHEMA)
