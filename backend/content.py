"""
content.py — Content API router: auth, Quran, prayer times, mosques, announcements, events, admin.

Mount in main.py:
    from content import router as content_router
    app.include_router(content_router)
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request

router = APIRouter(prefix="/api")

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(exist_ok=True)

SECRET_KEY = os.getenv("SECRET_KEY") or secrets.token_hex(32)

TOKEN_TTL = 60 * 60 * 24 * 7  # 7 days
REFRESH_TTL = 60 * 60 * 24 * 30  # 30 days

QURAN_CACHE_TTL = 60 * 60 * 24
PRAYER_CACHE_TTL = 60 * 60 * 24

# --------------------------------------------------------------------------- #
# JSON file helpers
# --------------------------------------------------------------------------- #


def _load_json(filename: str, default=None):
    p = DATA_DIR / filename
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return default if default is not None else []


def _save_json(filename: str, data):
    (DATA_DIR / filename).write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )


# --------------------------------------------------------------------------- #
# Auth helpers
# --------------------------------------------------------------------------- #


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return f"{salt}${dk.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    try:
        salt, hex_digest = hashed.split("$", 1)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
        return hmac.compare_digest(dk.hex(), hex_digest)
    except (ValueError, AttributeError):
        return False


def create_token(user_id: str, role: str, ttl: int = TOKEN_TTL) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": int(time.time()) + ttl,
    }
    body = base64.urlsafe_b64encode(
        json.dumps(payload, separators=(",", ":")).encode()
    ).decode()
    sig = hmac.new(SECRET_KEY.encode(), body.encode(), hashlib.sha256).hexdigest()
    return f"{body}.{sig}"


def decode_token(token: str) -> dict | None:
    try:
        body, sig = token.rsplit(".", 1)
        expected = hmac.new(SECRET_KEY.encode(), body.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(base64.urlsafe_b64decode(body))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


def get_current_user(request: Request) -> dict | None:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:]
    payload = decode_token(token)
    if not payload:
        return None
    users = _load_json("users.json", [])
    for u in users:
        if u["id"] == payload["user_id"]:
            return {"id": u["id"], "name": u["name"], "email": u["email"], "role": u["role"]}
    return None


def require_auth(request: Request) -> dict:
    user = get_current_user(request)
    if not user:
        raise HTTPException(401, "Authentification requise")
    return user


def require_admin(request: Request) -> dict:
    user = require_auth(request)
    if user.get("role") != "admin":
        raise HTTPException(403, "Accès admin requis")
    return user


# --------------------------------------------------------------------------- #
# Seed default mosque
# --------------------------------------------------------------------------- #


def _seed_defaults():
    mosques = _load_json("mosques.json", [])
    if not mosques:
        _save_json("mosques.json", [
            {
                "id": "default",
                "name": "Mosquée par défaut",
                "address": "Paris, France",
                "lat": 48.8566,
                "lng": 2.3522,
            }
        ])
    for coll in ("announcements.json", "events.json"):
        if not (DATA_DIR / coll).exists():
            _save_json(coll, [])


_seed_defaults()


# --------------------------------------------------------------------------- #
# Auth endpoints
# --------------------------------------------------------------------------- #


@router.post("/auth/register")
async def auth_register(body: dict):
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    if not email or not password or not name:
        raise HTTPException(400, "name, email, password requis")
    users = _load_json("users.json", [])
    for u in users:
        if u["email"] == email:
            raise HTTPException(409, "Email déjà utilisé")
    role = "admin" if len(users) == 0 else "user"
    user_id = secrets.token_hex(8)
    users.append({
        "id": user_id,
        "name": name,
        "email": email,
        "password": hash_password(password),
        "role": role,
    })
    _save_json("users.json", users)
    access = create_token(user_id, role)
    refresh = create_token(user_id, role, ttl=REFRESH_TTL)
    return {"accessToken": access, "refreshToken": refresh, "user": {"name": name, "email": email}}


@router.post("/auth/login")
async def auth_login(body: dict):
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    if not email or not password:
        raise HTTPException(400, "email et password requis")
    users = _load_json("users.json", [])
    for u in users:
        if u["email"] == email and verify_password(password, u["password"]):
            access = create_token(u["id"], u["role"])
            refresh = create_token(u["id"], u["role"], ttl=REFRESH_TTL)
            return {"accessToken": access, "refreshToken": refresh, "user": {"name": u["name"], "email": u["email"]}}
    raise HTTPException(401, "Identifiants incorrects")


@router.post("/auth/refresh")
async def auth_refresh(body: dict):
    token = body.get("refreshToken") or ""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Refresh token invalide ou expiré")
    access = create_token(payload["user_id"], payload["role"])
    return {"accessToken": access}


# --------------------------------------------------------------------------- #
# Quran cache + endpoints
# --------------------------------------------------------------------------- #

_quran_cache: dict[str, tuple[float, object]] = {}


def _cache_get(key: str, ttl: int = QURAN_CACHE_TTL):
    entry = _quran_cache.get(key)
    if entry and time.time() - entry[0] < ttl:
        return entry[1]
    return None


def _cache_set(key: str, value):
    _quran_cache[key] = (time.time(), value)


async def _quran_fetch(url: str) -> dict | list | None:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(url)
            r.raise_for_status()
            return r.json()
    except Exception:
        return None


SURAH_NAMES = [
    (1, "الفاتحة", "Al-Fatiha", "The Opening", 7),
    (2, "البقرة", "Al-Baqarah", "The Cow", 286),
    (3, "آل عمران", "Ali 'Imran", "Family of Imran", 200),
    (4, "النساء", "An-Nisa", "The Women", 176),
    (5, "المائدة", "Al-Ma'idah", "The Table Spread", 120),
    (6, "الأنعام", "Al-An'am", "The Cattle", 165),
    (7, "الأعراف", "Al-A'raf", "The Heights", 206),
    (8, "الأنفال", "Al-Anfal", "The Spoils of War", 75),
    (9, "التوبة", "At-Tawbah", "The Repentance", 129),
    (10, "يونس", "Yunus", "Jonah", 109),
    (11, "هود", "Hud", "Hud", 123),
    (12, "يوسف", "Yusuf", "Joseph", 111),
    (13, "الرعد", "Ar-Ra'd", "The Thunder", 43),
    (14, "إبراهيم", "Ibrahim", "Abraham", 52),
    (15, "الحجر", "Al-Hijr", "The Rocky Tract", 99),
    (16, "النحل", "An-Nahl", "The Bee", 128),
    (17, "الإسراء", "Al-Isra", "The Night Journey", 111),
    (18, "الكهف", "Al-Kahf", "The Cave", 110),
    (19, "مريم", "Maryam", "Mary", 98),
    (20, "طه", "Taha", "Ta-Ha", 135),
    (21, "الأنبياء", "Al-Anbiya", "The Prophets", 112),
    (22, "الحج", "Al-Hajj", "The Pilgrimage", 78),
    (23, "المؤمنون", "Al-Mu'minun", "The Believers", 118),
    (24, "النور", "An-Nur", "The Light", 64),
    (25, "الفرقان", "Al-Furqan", "The Criterion", 77),
    (26, "الشعراء", "Ash-Shu'ara", "The Poets", 227),
    (27, "النمل", "An-Naml", "The Ant", 93),
    (28, "القصص", "Al-Qasas", "The Stories", 88),
    (29, "العنكبوت", "Al-Ankabut", "The Spider", 69),
    (30, "الروم", "Ar-Rum", "The Romans", 60),
    (31, "لقمان", "Luqman", "Luqman", 34),
    (32, "السجدة", "As-Sajdah", "The Prostration", 30),
    (33, "الأحزاب", "Al-Ahzab", "The Combined Forces", 73),
    (34, "سبأ", "Saba", "Sheba", 54),
    (35, "فاطر", "Fatir", "Originator", 45),
    (36, "يس", "Ya-Sin", "Ya Sin", 83),
    (37, "الصافات", "As-Saffat", "Those Ranged in Ranks", 182),
    (38, "ص", "Sad", "Sad", 88),
    (39, "الزمر", "Az-Zumar", "The Troops", 75),
    (40, "غافر", "Ghafir", "The Forgiver", 85),
    (41, "فصلت", "Fussilat", "Explained in Detail", 54),
    (42, "الشورى", "Ash-Shura", "The Consultation", 53),
    (43, "الزخرف", "Az-Zukhrukh", "The Gold Adornments", 89),
    (44, "الدخان", "Ad-Dukhan", "The Smoke", 59),
    (45, "الجاثية", "Al-Jathiyah", "The Crouching", 37),
    (46, "الأحقاف", "Al-Ahqaf", "The Wind-curved Sandhills", 35),
    (47, "محمد", "Muhammad", "Muhammad", 38),
    (48, "الفتح", "Al-Fath", "The Victory", 29),
    (49, "الحجرات", "Al-Hujurat", "The Rooms", 18),
    (50, "ق", "Qaf", "Qaf", 45),
    (51, "الذاريات", "Adh-Dhariyat", "The Scattering Wind", 60),
    (52, "الطور", "At-Tur", "The Mount", 49),
    (53, "النجم", "An-Najm", "The Star", 62),
    (54, "القمر", "Al-Qamar", "The Moon", 55),
    (55, "الرحمن", "Ar-Rahman", "The Beneficent", 78),
    (56, "الواقعة", "Al-Waqi'ah", "The Inevitable", 96),
    (57, "الحديد", "Al-Hadid", "The Iron", 29),
    (58, "المجادلة", "Al-Mujadilah", "The Pleading Woman", 22),
    (59, "الحشر", "Al-Hashr", "The Exile", 24),
    (60, "الممتحنة", "Al-Mumtahanah", "She That is Examined", 13),
    (61, "الصف", "As-Saff", "The Ranks", 14),
    (62, "الجمعة", "Al-Jumu'ah", "The Congregation", 11),
    (63, "المنافقون", "Al-Munafiqun", "The Hypocrites", 11),
    (64, "التغابن", "At-Taghabun", "The Mutual Disillusion", 18),
    (65, "الطلاق", "At-Talaq", "The Divorce", 12),
    (66, "التحريم", "At-Tahrim", "The Prohibition", 12),
    (67, "الملك", "Al-Mulk", "The Sovereignty", 30),
    (68, "القلم", "Al-Qalam", "The Pen", 52),
    (69, "الحاقة", "Al-Haqqah", "The Reality", 52),
    (70, "المعارج", "Al-Ma'arij", "The Ascending Stairways", 44),
    (71, "نوح", "Nuh", "Noah", 28),
    (72, "الجن", "Al-Jinn", "The Jinn", 28),
    (73, "المزمل", "Al-Muzzammil", "The Enshrouded One", 20),
    (74, "المدثر", "Al-Muddaththir", "The Cloaked One", 56),
    (75, "القيامة", "Al-Qiyamah", "The Resurrection", 40),
    (76, "الإنسان", "Al-Insan", "The Man", 31),
    (77, "المرسلات", "Al-Mursalat", "The Emissaries", 50),
    (78, "النبأ", "An-Naba", "The Tidings", 40),
    (79, "النازعات", "An-Nazi'at", "Those Who Drag Forth", 46),
    (80, "عبس", "Abasa", "He Frowned", 42),
    (81, "التكوير", "At-Takwir", "The Overthrowing", 29),
    (82, "الانفطار", "Al-Infitar", "The Cleaving", 19),
    (83, "المطففين", "Al-Mutaffifin", "The Defrauding", 36),
    (84, "الانشقاق", "Al-Inshiqaq", "The Sundering", 25),
    (85, "البروج", "Al-Buruj", "The Mansions of the Stars", 22),
    (86, "الطارق", "At-Tariq", "The Morning Star", 17),
    (87, "الأعلى", "Al-A'la", "The Most High", 19),
    (88, "الغاشية", "Al-Ghashiyah", "The Overwhelming", 26),
    (89, "الفجر", "Al-Fajr", "The Dawn", 30),
    (90, "البلد", "Al-Balad", "The City", 20),
    (91, "الشمس", "Ash-Shams", "The Sun", 15),
    (92, "الليل", "Al-Layl", "The Night", 21),
    (93, "الضحى", "Ad-Duhaa", "The Morning Hours", 11),
    (94, "الشرح", "Ash-Sharh", "The Relief", 8),
    (95, "التين", "At-Tin", "The Fig", 8),
    (96, "العلق", "Al-Alaq", "The Clot", 19),
    (97, "القدر", "Al-Qadr", "The Power", 5),
    (98, "البينة", "Al-Bayyinah", "The Clear Proof", 8),
    (99, "الزلزلة", "Az-Zalzalah", "The Earthquake", 8),
    (100, "العاديات", "Al-Adiyat", "The Courser", 11),
    (101, "القارعة", "Al-Qari'ah", "The Calamity", 11),
    (102, "التكاثر", "At-Takathur", "The Rivalry in Worldly Increase", 8),
    (103, "العصر", "Al-Asr", "The Declining Day", 3),
    (104, "الهمزة", "Al-Humazah", "The Traducer", 9),
    (105, "الفيل", "Al-Fil", "The Elephant", 5),
    (106, "قريش", "Quraysh", "Quraysh", 4),
    (107, "الماعون", "Al-Ma'un", "The Small Kindnesses", 7),
    (108, "الكوثر", "Al-Kawthar", "The Abundance", 3),
    (109, "الكافرون", "Al-Kafirun", "The Disbelievers", 6),
    (110, "النصر", "An-Nasr", "The Divine Support", 3),
    (111, "المسد", "Al-Masad", "The Palm Fiber", 5),
    (112, "الإخلاص", "Al-Ikhlas", "The Sincerity", 4),
    (113, "الفلق", "Al-Falaq", "The Daybreak", 5),
    (114, "الناس", "An-Nas", "Mankind", 6),
]


@router.get("/quran/surahs")
async def quran_surahs():
    cached = _cache_get("surahs")
    if cached is not None:
        return cached
    result = [
        {
            "number": num,
            "nameArabic": ar,
            "nameTransliteration": tr,
            "nameEnglish": en,
            "totalAyahs": ayahs,
        }
        for num, ar, tr, en, ayahs in SURAH_NAMES
    ]
    _cache_set("surahs", result)
    return result


@router.get("/quran/surahs/{number}")
async def quran_surah(number: int):
    if number < 1 or number > 114:
        raise HTTPException(404, "Surah invalide")
    cache_key = f"surah_{number}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    info = SURAH_NAMES[number - 1]
    name_tr, name_en = info[2], info[3]

    # Try primary editions
    ar_data = await _quran_fetch(
        f"https://api.alquran.cloud/v1/surah/{number}/ar.alafasy"
    )
    tr_data = await _quran_fetch(
        f"https://api.alquran.cloud/v1/surah/{number}/fr.hamidullah"
    )

    # Fallback
    if not ar_data or ar_data.get("code") != 200:
        ar_data = await _quran_fetch(
            f"https://api.alquran.cloud/v1/surah/{number}/quran-uthmani"
        )
    if not tr_data or tr_data.get("code") != 200:
        tr_data = await _quran_fetch(
            f"https://api.alquran.cloud/v1/surah/{number}/en.sahih"
        )

    ayahs = []
    ar_ayahs = []
    tr_ayahs = []
    if ar_data and ar_data.get("data") and ar_data["data"].get("ayahs"):
        ar_ayahs = ar_data["data"]["ayahs"]
    if tr_data and tr_data.get("data") and tr_data["data"].get("ayahs"):
        tr_ayahs = tr_data["data"]["ayahs"]

    max_len = max(len(ar_ayahs), len(tr_ayahs))
    for i in range(max_len):
        ar_text = ar_ayahs[i]["text"] if i < len(ar_ayahs) else ""
        tr_text = tr_ayahs[i]["text"] if i < len(tr_ayahs) else ""
        ayahs.append({
            "textArabic": ar_text,
            "translation": tr_text,
            "ayahNumber": i + 1,
        })

    result = {"nameTransliteration": name_tr, "nameEnglish": name_en, "ayahs": ayahs}
    _cache_set(cache_key, result)
    return result


@router.get("/quran/verse/{ref}")
async def quran_verse(ref: str):
    match = re.match(r"^(\d+)[:.](\d+)$", ref.strip())
    if not match:
        raise HTTPException(400, "Référence invalide (format: sourate:verset)")
    surah_no, ayah_no = int(match.group(1)), int(match.group(2))
    if surah_no < 1 or surah_no > 114:
        raise HTTPException(404, "Surah invalide")

    cache_key = f"verse_{surah_no}_{ayah_no}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    surah_meta = SURAH_NAMES[surah_no - 1]
    ar = await _quran_fetch(
        f"https://api.alquran.cloud/v1/ayah/{surah_no}:{ayah_no}/ar.alafasy"
    )
    if not ar or ar.get("code") != 200:
        ar = await _quran_fetch(
            f"https://api.alquran.cloud/v1/ayah/{surah_no}:{ayah_no}/quran-uthmani"
        )
    tr = await _quran_fetch(
        f"https://api.alquran.cloud/v1/ayah/{surah_no}:{ayah_no}/fr.hamidullah"
    )
    if not tr or tr.get("code") != 200:
        tr = await _quran_fetch(
            f"https://api.alquran.cloud/v1/ayah/{surah_no}:{ayah_no}/en.sahih"
        )

    ar_data = (ar or {}).get("data") or {}
    tr_data = (tr or {}).get("data") or {}
    result = {
        "surah": {
            "number": surah_no,
            "nameTransliteration": surah_meta[2],
            "nameEnglish": surah_meta[3],
        },
        "ayah": {
            "ayahNumber": ayah_no,
            "textArabic": ar_data.get("text", ""),
            "translation": tr_data.get("text", ""),
        },
    }
    _cache_set(cache_key, result)
    return result


# --------------------------------------------------------------------------- #
# Prayer times (aladhan.com proxy)
# --------------------------------------------------------------------------- #

_prayer_cache: dict[str, tuple[float, dict]] = {}


def _get_mosque_coords(mosque_id: str) -> tuple[float, float]:
    mosques = _load_json("mosques.json", [])
    for m in mosques:
        if m["id"] == mosque_id:
            return float(m.get("lat", 48.8566)), float(m.get("lng", 2.3522))
    return 48.8566, 2.3522


@router.get("/prayer-times/{mosque_id}")
async def prayer_times(mosque_id: str, date: str = Query(default=None)):
    if not date:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    cache_key = f"{mosque_id}_{date}"
    cached_entry = _prayer_cache.get(cache_key)
    if cached_entry and time.time() - cached_entry[0] < PRAYER_CACHE_TTL:
        return cached_entry[1]

    lat, lng = _get_mosque_coords(mosque_id)
    url = f"https://api.aladhan.com/v1/timings/{date}?latitude={lat}&longitude={lng}&method=3"
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(url)
            r.raise_for_status()
            data = r.json()
    except Exception:
        raise HTTPException(502, "Service de horaires indisponible")

    timings = data.get("data", {}).get("timings", {})
    result = {
        "date": date,
        "fajr": {"name": "Fajr", "time": timings.get("Fajr", ""), "type": "obligatory"},
        "sunrise": {"name": "Sunrise", "time": timings.get("Sunrise", ""), "type": "sunnah"},
        "dhuhr": {"name": "Dhuhr", "time": timings.get("Dhuhr", ""), "type": "obligatory"},
        "asr": {"name": "Asr", "time": timings.get("Asr", ""), "type": "obligatory"},
        "maghrib": {"name": "Maghrib", "time": timings.get("Maghrib", ""), "type": "obligatory"},
        "isha": {"name": "Isha", "time": timings.get("Isha", ""), "type": "obligatory"},
        "jummahTime": timings.get("Dhuhr", ""),
    }
    _prayer_cache[cache_key] = (time.time(), result)
    return result


# --------------------------------------------------------------------------- #
# Mosques
# --------------------------------------------------------------------------- #


@router.get("/mosques")
async def list_mosques():
    return _load_json("mosques.json", [])


@router.post("/mosques")
async def create_mosque(body: dict, user: dict = Depends(require_auth)):
    mosques = _load_json("mosques.json", [])
    mosque = {
        "id": secrets.token_hex(6),
        "name": body.get("name", ""),
        "address": body.get("address", "") or body.get("city", ""),
        "lat": float(body.get("lat", body.get("latitude", 48.8566)) or 48.8566),
        "lng": float(body.get("lng", body.get("longitude", 2.3522)) or 2.3522),
    }
    mosques.append(mosque)
    _save_json("mosques.json", mosques)
    return mosque


@router.delete("/mosques/{mosque_id}")
async def delete_mosque(mosque_id: str, user: dict = Depends(require_auth)):
    mosques = _load_json("mosques.json", [])
    new = [m for m in mosques if m["id"] != mosque_id]
    if len(new) == len(mosques):
        raise HTTPException(404, "Mosquée introuvable")
    _save_json("mosques.json", new)
    return {"ok": True}


# --------------------------------------------------------------------------- #
# Announcements
# --------------------------------------------------------------------------- #


@router.get("/announcements/{mosque_id}")
async def list_announcements(mosque_id: str):
    all_ann = _load_json("announcements.json", [])
    return [a for a in all_ann if a.get("mosqueId") == mosque_id]


@router.post("/announcements")
async def create_announcement(body: dict, user: dict = Depends(require_auth)):
    ann = _load_json("announcements.json", [])
    item = {
        "id": secrets.token_hex(6),
        "mosqueId": body.get("mosqueId", ""),
        "title": body.get("title", ""),
        "body": body.get("body", ""),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    ann.append(item)
    _save_json("announcements.json", ann)
    return item


@router.post("/announcements/{mosque_id}")
async def create_announcement_for_mosque(mosque_id: str, body: dict, user: dict = Depends(require_auth)):
    ann = _load_json("announcements.json", [])
    item = {
        "id": secrets.token_hex(6),
        "mosqueId": mosque_id,
        "title": body.get("title", ""),
        "body": body.get("body", ""),
        "category": body.get("category", "general"),
        "priority": body.get("priority", "normal"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    ann.append(item)
    _save_json("announcements.json", ann)
    return item


@router.delete("/announcements/{mosque_id}/{item_id}")
async def delete_announcement_for_mosque(mosque_id: str, item_id: str, user: dict = Depends(require_auth)):
    ann = _load_json("announcements.json", [])
    new = [a for a in ann if not (a["id"] == item_id and a.get("mosqueId") == mosque_id)]
    if len(new) == len(ann):
        raise HTTPException(404, "Annonce introuvable")
    _save_json("announcements.json", new)
    return {"ok": True}


@router.delete("/announcements/{item_id}")
async def delete_announcement(item_id: str, user: dict = Depends(require_auth)):
    ann = _load_json("announcements.json", [])
    new = [a for a in ann if a["id"] != item_id]
    if len(new) == len(ann):
        raise HTTPException(404, "Annonce introuvable")
    _save_json("announcements.json", new)
    return {"ok": True}


# --------------------------------------------------------------------------- #
# Events
# --------------------------------------------------------------------------- #


@router.get("/events/{mosque_id}")
async def list_events(mosque_id: str):
    all_ev = _load_json("events.json", [])
    return [e for e in all_ev if e.get("mosqueId") == mosque_id]


@router.post("/events")
async def create_event(body: dict, user: dict = Depends(require_auth)):
    ev = _load_json("events.json", [])
    item = {
        "id": secrets.token_hex(6),
        "mosqueId": body.get("mosqueId", ""),
        "title": body.get("title", ""),
        "description": body.get("description", ""),
        "date": body.get("date", ""),
        "time": body.get("time", ""),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    ev.append(item)
    _save_json("events.json", ev)
    return item


@router.delete("/events/{item_id}")
async def delete_event(item_id: str, user: dict = Depends(require_auth)):
    ev = _load_json("events.json", [])
    new = [e for e in ev if e["id"] != item_id]
    if len(new) == len(ev):
        raise HTTPException(404, "Événement introuvable")
    _save_json("events.json", new)
    return {"ok": True}


# --------------------------------------------------------------------------- #
# Admin
# --------------------------------------------------------------------------- #


@router.get("/admin/stats")
async def admin_stats(user: dict = Depends(require_auth)):
    users = _load_json("users.json", [])
    ann = _load_json("announcements.json", [])
    ev = _load_json("events.json", [])
    # Import ROOMS from main to count active sessions
    try:
        from main import ROOMS
        sessions_active = len([r for r in ROOMS.values() if r.status == "live"])
    except Exception:
        sessions_active = 0
    return {
        "users_count": len(users),
        "announcements_count": len(ann),
        "events_count": len(ev),
        "sessions_active": sessions_active,
        "sessions_count": len(ROOMS),
    }


@router.get("/admin/users")
async def admin_users(user: dict = Depends(require_admin)):
    users = _load_json("users.json", [])
    return [
        {"id": u["id"], "name": u["name"], "email": u["email"], "role": u["role"]}
        for u in users
    ]


# --------------------------------------------------------------------------- #
# Admin config (mosque settings)
# --------------------------------------------------------------------------- #


def _get_config() -> dict:
    config = _load_json("settings.json", {})
    if not config:
        mosques = _load_json("mosques.json", [])
        default = mosques[0] if mosques else {}
        config = {
            "mosqueId": default.get("id", "default"),
            "name": default.get("name", ""),
            "city": default.get("address", ""),
            "prayer_method": 3,
            "default_language": "fr",
        }
        _save_json("settings.json", config)
    return config


@router.get("/admin/config")
async def admin_get_config(user: dict = Depends(require_auth)):
    return _get_config()


@router.put("/admin/config")
async def admin_put_config(body: dict, user: dict = Depends(require_auth)):
    config = _get_config()
    for key in ("name", "city", "default_language"):
        if body.get(key) is not None:
            config[key] = body.get(key)
    if body.get("prayer_method") is not None:
        try:
            config["prayer_method"] = int(body["prayer_method"])
        except (TypeError, ValueError):
            pass
    _save_json("settings.json", config)
    return config
