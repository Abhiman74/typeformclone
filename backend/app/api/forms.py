from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.form import FormCreate, FormListItem, FormOut, FormUpdate
from app.services import form_service

router = APIRouter(prefix="/forms", tags=["forms"])


@router.get("", response_model=list[FormListItem])
def list_forms(db: Session = Depends(get_db)):
    return form_service.list_forms(db)


@router.post("", response_model=FormOut, status_code=201)
def create_form(payload: FormCreate, db: Session = Depends(get_db)):
    return form_service.create_form(db, payload)


@router.get("/{form_id}", response_model=FormOut)
def get_form(form_id: str, db: Session = Depends(get_db)):
    return form_service.get_form_or_404(db, form_id)


@router.put("/{form_id}", response_model=FormOut)
def update_form(form_id: str, payload: FormUpdate, db: Session = Depends(get_db)):
    return form_service.update_form(db, form_id, payload)


@router.delete("/{form_id}", status_code=204)
def delete_form(form_id: str, db: Session = Depends(get_db)):
    form_service.delete_form(db, form_id)


@router.post("/{form_id}/duplicate", response_model=FormOut, status_code=201)
def duplicate_form(form_id: str, db: Session = Depends(get_db)):
    return form_service.duplicate_form(db, form_id)


@router.post("/{form_id}/publish", response_model=FormOut)
def publish_form(form_id: str, db: Session = Depends(get_db)):
    return form_service.publish_form(db, form_id)


@router.post("/{form_id}/unpublish", response_model=FormOut)
def unpublish_form(form_id: str, db: Session = Depends(get_db)):
    return form_service.unpublish_form(db, form_id)
