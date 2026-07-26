from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class AnswerSubmit(BaseModel):
    question_id: str
    value: Any = None


class ResponseSubmit(BaseModel):
    answers: list[AnswerSubmit]
    is_complete: bool = True


class AnswerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    question_id: str
    value: Any = None


class ResponseListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    form_id: str
    submitted_at: datetime
    is_complete: bool
    answer_count: int = 0


class ResponseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    form_id: str
    submitted_at: datetime
    is_complete: bool
    answers: list[AnswerOut] = []


class ChoiceBreakdown(BaseModel):
    label: str
    count: int
    percentage: float


class QuestionStats(BaseModel):
    question_id: str
    question_title: str
    question_type: str
    total_answers: int
    # For choice-like types (multiple_choice, dropdown, yes_no):
    breakdown: Optional[list[ChoiceBreakdown]] = None
    # For rating/number:
    average: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    # For text-like types, a small sample of recent answers:
    sample_answers: Optional[list[str]] = None


class FormStats(BaseModel):
    form_id: str
    total_responses: int
    completed_responses: int
    partial_responses: int
    completion_rate: float
    questions: list[QuestionStats]
