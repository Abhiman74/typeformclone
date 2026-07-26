from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.question import QuestionCreate, QuestionOut, QuestionUpdate, ReorderRequest
from app.services import question_service

router = APIRouter(tags=["questions"])


@router.post("/questions", response_model=QuestionOut, status_code=201)
def create_question(payload: QuestionCreate, db: Session = Depends(get_db)):
    return question_service.create_question(db, payload)


@router.put("/questions/reorder", response_model=list[QuestionOut])
def reorder_questions(payload: ReorderRequest, db: Session = Depends(get_db)):
    return question_service.reorder_questions(db, payload)


@router.put("/questions/{question_id}", response_model=QuestionOut)
def update_question(question_id: str, payload: QuestionUpdate, db: Session = Depends(get_db)):
    return question_service.update_question(db, question_id, payload)


@router.delete("/questions/{question_id}", status_code=204)
def delete_question(question_id: str, db: Session = Depends(get_db)):
    question_service.delete_question(db, question_id)
