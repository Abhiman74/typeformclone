from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.form import Form, FormStatus
from app.schemas.form import PublicFormOut
from app.schemas.response import ResponseOut, ResponseSubmit
from app.services import response_service

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/{slug}", response_model=PublicFormOut)
def get_public_form(slug: str, db: Session = Depends(get_db)):
    """No auth required -- this is the endpoint the respondent-facing
    /form/[slug] page hits. Only published forms are servable."""
    form = db.query(Form).filter(Form.slug == slug).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if form.status != FormStatus.published:
        raise HTTPException(status_code=403, detail="This form is not currently published")
    return form


@router.post("/{slug}/submit", response_model=ResponseOut, status_code=201)
def submit_form(slug: str, payload: ResponseSubmit, db: Session = Depends(get_db)):
    return response_service.submit_response(db, slug, payload)
