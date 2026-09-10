from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import PrayerTime
from schemas import PrayerTimeCreate, PrayerTimeUpdate, PrayerTimeOut

router = APIRouter(prefix="/api/prayers", tags=["prayers"])


@router.get("/", response_model=List[PrayerTimeOut])
def list_prayers(db: Session = Depends(get_db)):
    return db.query(PrayerTime).filter(PrayerTime.active == True).order_by(PrayerTime.time_hour, PrayerTime.time_minute).all()


@router.post("/", response_model=PrayerTimeOut)
def create_prayer(prayer: PrayerTimeCreate, db: Session = Depends(get_db)):
    db_prayer = PrayerTime(**prayer.model_dump())
    db.add(db_prayer)
    db.commit()
    db.refresh(db_prayer)
    return db_prayer


@router.put("/{prayer_id}", response_model=PrayerTimeOut)
def update_prayer(prayer_id: int, prayer: PrayerTimeUpdate, db: Session = Depends(get_db)):
    db_prayer = db.query(PrayerTime).filter(PrayerTime.id == prayer_id).first()
    if not db_prayer:
        raise HTTPException(status_code=404, detail="Prière non trouvée")
    for key, value in prayer.model_dump(exclude_unset=True).items():
        setattr(db_prayer, key, value)
    db.commit()
    db.refresh(db_prayer)
    return db_prayer


@router.delete("/{prayer_id}")
def delete_prayer(prayer_id: int, db: Session = Depends(get_db)):
    db_prayer = db.query(PrayerTime).filter(PrayerTime.id == prayer_id).first()
    if not db_prayer:
        raise HTTPException(status_code=404, detail="Prière non trouvée")
    db_prayer.active = False
    db.commit()
    return {"ok": True}
