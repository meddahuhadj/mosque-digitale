from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
from models import Finance
from schemas import FinanceCreate, FinanceOut

router = APIRouter(prefix="/api/finances", tags=["finances"])


@router.get("/", response_model=List[FinanceOut])
def list_finances(db: Session = Depends(get_db)):
    return db.query(Finance).order_by(Finance.date.desc()).all()


@router.post("/", response_model=FinanceCreate)
def create_finance(finance: FinanceCreate, db: Session = Depends(get_db)):
    db_finance = Finance(**finance.model_dump())
    db.add(db_finance)
    db.commit()
    db.refresh(db_finance)
    return db_finance


@router.get("/summary")
def finance_summary(db: Session = Depends(get_db)):
    recettes = db.query(func.coalesce(func.sum(Finance.amount), 0.0)).filter(Finance.type == "recette").scalar()
    depenses = db.query(func.coalesce(func.sum(Finance.amount), 0.0)).filter(Finance.type == "depense").scalar()
    return {
        "total_recettes": recettes,
        "total_depenses": depenses,
        "solde": recettes - depenses,
    }


@router.delete("/{finance_id}")
def delete_finance(finance_id: int, db: Session = Depends(get_db)):
    db_finance = db.query(Finance).filter(Finance.id == finance_id).first()
    if not db_finance:
        raise HTTPException(status_code=404, detail="Transaction non trouvée")
    db.delete(db_finance)
    db.commit()
    return {"ok": True}
