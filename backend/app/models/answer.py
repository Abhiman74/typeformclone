import uuid

from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


def _uuid() -> str:
    return uuid.uuid4().hex


class Answer(Base):
    """
    A single question's answer within one Response.

    `value` is stored as JSON rather than a plain string so it can hold any
    shape the question type needs (a string for short_text/email, a number
    for number/rating, a boolean for yes_no, a chosen option string for
    multiple_choice/dropdown) without needing per-type columns.
    """

    __tablename__ = "answers"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    response_id: Mapped[str] = mapped_column(String(32), ForeignKey("responses.id"), nullable=False, index=True)
    question_id: Mapped[str] = mapped_column(String(32), ForeignKey("questions.id"), nullable=False, index=True)
    value: Mapped[dict] = mapped_column(JSON, nullable=True)

    response: Mapped["Response"] = relationship("Response", back_populates="answers")
    question: Mapped["Question"] = relationship("Question", back_populates="answers")
