import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


def _uuid() -> str:
    return uuid.uuid4().hex


class Response(Base):
    """
    One respondent's full submission to a Form.

    `is_complete` distinguishes a finished submission from a partial one --
    the respondent UI creates a Response row on first answer (via
    autosave-on-advance) and flips this flag on the final "submit", which
    powers the bonus "partial responses" / completion-rate features without
    needing a separate table.
    """

    __tablename__ = "responses"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    form_id: Mapped[str] = mapped_column(String(32), ForeignKey("forms.id"), nullable=False, index=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    is_complete: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    form: Mapped["Form"] = relationship("Form", back_populates="responses")
    answers: Mapped[list["Answer"]] = relationship(
        "Answer", back_populates="response", cascade="all, delete-orphan"
    )
