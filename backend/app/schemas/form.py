from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.form import FormStatus
from app.schemas.question import QuestionOut


class FormCreate(BaseModel):
    title: str = "Untitled Form"


class FormUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[FormStatus] = None


class FormListItem(BaseModel):
    """Lightweight shape for the dashboard list -- avoids serializing every
    question on every form just to render a card."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    status: FormStatus
    slug: str
    created_at: datetime
    updated_at: datetime
    response_count: int = 0


class FormOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    status: FormStatus
    slug: str
    created_at: datetime
    updated_at: datetime
    questions: list[QuestionOut] = []


class PublicQuestionOut(BaseModel):
    """What a respondent is allowed to see -- no internal ids beyond what's
    needed to submit an answer, no draft/status metadata."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    title: str
    description: Optional[str] = None
    required: bool
    settings: dict
    position: int


class PublicFormOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    slug: str
    questions: list[PublicQuestionOut] = []
