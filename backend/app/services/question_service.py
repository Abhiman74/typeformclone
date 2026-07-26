from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate, ReorderRequest


def get_question_or_404(db: Session, question_id: str) -> Question:
    question = db.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


def create_question(db: Session, payload: QuestionCreate) -> Question:
    if payload.position is None:
        max_pos = (
            db.query(func.max(Question.position)).filter(Question.form_id == payload.form_id).scalar()
        )
        position = (max_pos + 1) if max_pos is not None else 0
    else:
        position = payload.position

    question = Question(
        form_id=payload.form_id,
        type=payload.type,
        title=payload.title,
        description=payload.description,
        required=payload.required,
        settings=payload.settings,
        position=position,
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def update_question(db: Session, question_id: str, payload: QuestionUpdate) -> Question:
    question = get_question_or_404(db, question_id)
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(question, field, value)
    db.commit()
    db.refresh(question)
    return question


def delete_question(db: Session, question_id: str) -> None:
    question = get_question_or_404(db, question_id)
    form_id = question.form_id
    db.delete(question)
    db.flush()
    # Re-pack positions so there are no gaps after deletion.
    remaining = (
        db.query(Question).filter(Question.form_id == form_id).order_by(Question.position).all()
    )
    for idx, q in enumerate(remaining):
        q.position = idx
    db.commit()


def reorder_questions(db: Session, payload: ReorderRequest) -> list[Question]:
    ids = [item.id for item in payload.items]
    questions = db.query(Question).filter(Question.id.in_(ids)).all()
    by_id = {q.id: q for q in questions}
    for item in payload.items:
        q = by_id.get(item.id)
        if q is None or q.form_id != payload.form_id:
            raise HTTPException(status_code=400, detail=f"Question {item.id} does not belong to form")
        q.position = item.position
    db.commit()
    return (
        db.query(Question)
        .filter(Question.form_id == payload.form_id)
        .order_by(Question.position)
        .all()
    )
