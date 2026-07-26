from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.question import QuestionType


class QuestionBase(BaseModel):
    type: QuestionType
    title: str = ""
    description: Optional[str] = None
    required: bool = False
    settings: dict[str, Any] = Field(default_factory=dict)


class QuestionCreate(QuestionBase):
    form_id: str
    position: Optional[int] = None  # if omitted, appended to end


class QuestionUpdate(BaseModel):
    """All fields optional to support partial (PATCH-like) updates via PUT."""
    type: Optional[QuestionType] = None
    title: Optional[str] = None
    description: Optional[str] = None
    required: Optional[bool] = None
    settings: Optional[dict[str, Any]] = None


class QuestionOut(QuestionBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    form_id: str
    position: int


class ReorderItem(BaseModel):
    id: str
    position: int


class ReorderRequest(BaseModel):
    form_id: str
    items: list[ReorderItem]
