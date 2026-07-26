from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.models.answer import Answer
from app.models.form import Form, FormStatus
from app.models.response import Response
from app.schemas.response import ResponseSubmit


def submit_response(db: Session, slug: str, payload: ResponseSubmit) -> Response:
    form = db.query(Form).filter(Form.slug == slug).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if form.status != FormStatus.published:
        raise HTTPException(status_code=403, detail="This form is not currently accepting responses")

    response = Response(form_id=form.id, is_complete=payload.is_complete)
    db.add(response)
    db.flush()

    for answer in payload.answers:
        db.add(Answer(response_id=response.id, question_id=answer.question_id, value=answer.value))

    db.commit()
    db.refresh(response)
    return response


def list_responses(db: Session, form_id: str) -> list[dict]:
    rows = (
        db.query(Response, func.count(Answer.id).label("answer_count"))
        .outerjoin(Answer, Answer.response_id == Response.id)
        .filter(Response.form_id == form_id)
        .group_by(Response.id)
        .order_by(Response.submitted_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "form_id": r.form_id,
            "submitted_at": r.submitted_at,
            "is_complete": r.is_complete,
            "answer_count": count,
        }
        for r, count in rows
    ]


def get_response_or_404(db: Session, response_id: str) -> Response:
    response = (
        db.query(Response)
        .options(selectinload(Response.answers))
        .filter(Response.id == response_id)
        .first()
    )
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    return response
