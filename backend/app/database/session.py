"""
Database engine and session management.

SQLite is used per the assignment spec. `check_same_thread=False` is required
because FastAPI's request handling may use a different thread than the one
that created the connection (each request gets its own Session via
`get_db`, so this is safe).
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DB_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(DB_DIR, 'typeform_clone.db')}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency that yields a request-scoped DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
