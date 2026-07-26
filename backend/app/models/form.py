import enum
import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class FormStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


def _uuid() -> str:
    return uuid.uuid4().hex


class Form(Base):
    """
    A Form is the top-level container a builder creates. It owns an ordered
    list of Questions and accumulates Responses once published.

    `slug` is a short, url-safe, publicly shareable identifier distinct from
    the internal `id` -- this lets us rotate/regenerate a shareable link
    independent of the primary key, and keeps public URLs short and clean.
    """

    __tablename__ = "forms"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="Untitled Form")
    status: Mapped[FormStatus] = mapped_column(
        SAEnum(FormStatus), nullable=False, default=FormStatus.draft
    )
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False, default=_uuid)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    questions: Mapped[list["Question"]] = relationship(
        "Question",
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="Question.position",
    )
    responses: Mapped[list["Response"]] = relationship(
        "Response", back_populates="form", cascade="all, delete-orphan"
    )
