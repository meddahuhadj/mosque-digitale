import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from database import engine, Base
from models import PrayerTime
from routers.auth_router import router as auth_router
from routers.members_router import router as members_router
from routers.prayers_router import router as prayers_router
from routers.announcements_router import router as announcements_router
from routers.finances_router import router as finances_router
from routers.events_router import router as events_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gestion Mosquée", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(members_router)
app.include_router(prayers_router)
app.include_router(announcements_router)
app.include_router(finances_router)
app.include_router(events_router)

# Serve the built frontend
DIST_DIR = Path(__file__).parent.parent / "frontend" / "gestion-mosquee" / "dist"
if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="static")


def seed_prayers():
    from database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(PrayerTime).count() == 0:
            defaults = [
                ("Fajr", 5, 30, 5, 50),
                ("Dhuhr", 12, 30, 12, 45),
                ("Asr", 15, 45, 16, 0),
                ("Maghrib", 18, 30, 18, 35),
                ("Isha", 20, 0, 20, 15),
            ]
            for name, th, tm, ih, im in defaults:
                db.add(PrayerTime(name=name, time_hour=th, time_minute=tm, iqama_hour=ih, iqama_minute=im))
            db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    seed_prayers()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
