from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.form import Form, FormStatus
from app.models.question import Question
from app.models.response import Response
from app.schemas.form import FormCreate, FormUpdate
from app.utils.slug import slugify_title


def list_forms(db: Session) -> list[dict]:
    """Returns forms with a computed response_count, newest first."""
    rows = (
        db.query(Form, func.count(Response.id).label("response_count"))
        .outerjoin(Response, Response.form_id == Form.id)
        .group_by(Form.id)
        .order_by(Form.updated_at.desc())
        .all()
    )
    results = []
    for form, count in rows:
        results.append(
            {
                "id": form.id,
                "title": form.title,
                "status": form.status,
                "slug": form.slug,
                "created_at": form.created_at,
                "updated_at": form.updated_at,
                "response_count": count,
            }
        )
    return results


def get_form_or_404(db: Session, form_id: str) -> Form:
    form = db.get(Form, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


def create_form(db: Session, payload: FormCreate) -> Form:
    form = Form(title=payload.title, slug=slugify_title(payload.title))
    db.add(form)
    db.commit()
    db.refresh(form)
    return form


def update_form(db: Session, form_id: str, payload: FormUpdate) -> Form:
    form = get_form_or_404(db, form_id)
    if payload.title is not None:
        form.title = payload.title
    if payload.status is not None:
        form.status = payload.status
    db.commit()
    db.refresh(form)
    return form


def delete_form(db: Session, form_id: str) -> None:
    form = get_form_or_404(db, form_id)
    db.delete(form)
    db.commit()


def duplicate_form(db: Session, form_id: str) -> Form:
    """Deep-copies a form and all its questions (but not responses) as a
    new draft, mirroring Typeform's 'Duplicate' action."""
    original = get_form_or_404(db, form_id)
    copy = Form(title=f"{original.title} (Copy)", status=FormStatus.draft, slug=slugify_title(original.title))
    db.add(copy)
    db.flush()  # assign copy.id before creating child questions

    for q in original.questions:
        db.add(
            Question(
                form_id=copy.id,
                type=q.type,
                title=q.title,
                description=q.description,
                required=q.required,
                position=q.position,
                settings=q.settings,
            )
        )
    db.commit()
    db.refresh(copy)
    return copy


def publish_form(db: Session, form_id: str) -> Form:
    form = get_form_or_404(db, form_id)
    if not form.questions:
        raise HTTPException(status_code=400, detail="Cannot publish a form with no questions")
    form.status = FormStatus.published
    db.commit()
    db.refresh(form)
    return form


def unpublish_form(db: Session, form_id: str) -> Form:
    form = get_form_or_404(db, form_id)
    form.status = FormStatus.draft
    db.commit()
    db.refresh(form)
    return form
