from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Announcement
from schemas import AnnouncementCreate, AnnouncementUpdate, AnnouncementOut

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


@router.get("/", response_model=List[AnnouncementOut])
def list_announcements(db: Session = Depends(get_db)):
    return db.query(Announcement).filter(Announcement.published == True).order_by(Announcement.created_at.desc()).all()


@router.post("/", response_model=AnnouncementOut)
def create_announcement(ann: AnnouncementCreate, db: Session = Depends(get_db)):
    db_ann = Announcement(**ann.model_dump())
    db.add(db_ann)
    db.commit()
    db.refresh(db_ann)
    return db_ann


@router.get("/{ann_id}", response_model=AnnouncementOut)
def get_announcement(ann_id: int, db: Session = Depends(get_db)):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    return ann


@router.put("/{ann_id}", response_model=AnnouncementOut)
def update_announcement(ann_id: int, ann: AnnouncementUpdate, db: Session = Depends(get_db)):
    db_ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not db_ann:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    for key, value in ann.model_dump(exclude_unset=True).items():
        setattr(db_ann, key, value)
    db.commit()
    db.refresh(db_ann)
    return db_ann


@router.delete("/{ann_id}")
def delete_announcement(ann_id: int, db: Session = Depends(get_db)):
    db_ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not db_ann:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    db_ann.published = False
    db.commit()
    return {"ok": True}
