import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import forms, questions, public, responses
from app.database.session import Base, engine

# Dev convenience: auto-create tables if they don't exist yet. Alembic
# (see alembic/) remains the source of truth for schema migrations in a
# real deployment; this just keeps `uvicorn app.main:app` runnable from a
# clean checkout without a manual migration step.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Typeform Clone API",
    description="Backend for a Typeform-style form builder, respondent flow, and results dashboard.",
    version="1.0.0",
)

allowed_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forms.router, prefix="/api")
app.include_router(questions.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(responses.router, prefix="/api")


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok"}
