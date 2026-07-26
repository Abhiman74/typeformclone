from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.response import FormStats, ResponseListItem, ResponseOut
from app.services import response_service, stats_service

router = APIRouter(tags=["responses"])


@router.get("/forms/{form_id}/responses", response_model=list[ResponseListItem])
def list_responses(form_id: str, db: Session = Depends(get_db)):
    return response_service.list_responses(db, form_id)


@router.get("/forms/{form_id}/stats", response_model=FormStats)
def form_stats(form_id: str, db: Session = Depends(get_db)):
    return stats_service.compute_form_stats(db, form_id)


@router.get("/responses/{response_id}", response_model=ResponseOut)
def get_response(response_id: str, db: Session = Depends(get_db)):
    return response_service.get_response_or_404(db, response_id)
