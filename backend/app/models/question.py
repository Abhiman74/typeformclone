import enum
import uuid
from typing import Optional

from sqlalchemy import String, Boolean, Integer, ForeignKey, Enum as SAEnum, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class QuestionType(str, enum.Enum):
    short_text = "short_text"
    long_text = "long_text"
    multiple_choice = "multiple_choice"
    dropdown = "dropdown"
    email = "email"
    number = "number"
    yes_no = "yes_no"
    rating = "rating"


def _uuid() -> str:
    return uuid.uuid4().hex


class Question(Base):
    """
    A single question belonging to a Form.

    `settings` is a JSON blob holding type-specific configuration (e.g.
    `choices` for multiple_choice/dropdown, `max` for rating). Keeping this
    schemaless avoids a sparse table with a column per possible option and
    lets us add new question types without a migration.

    `position` is a dense 0-based ordering integer maintained by the
    reorder endpoint; it is the source of truth for question order both in
    the builder and the respondent flow.
    """

    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    form_id: Mapped[str] = mapped_column(String(32), ForeignKey("forms.id"), nullable=False, index=True)
    type: Mapped[QuestionType] = mapped_column(SAEnum(QuestionType), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False, default="")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    settings: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    form: Mapped["Form"] = relationship("Form", back_populates="questions")
    answers: Mapped[list["Answer"]] = relationship(
        "Answer", back_populates="question", cascade="all, delete-orphan"
    )
