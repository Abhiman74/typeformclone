"""
Seeds the database with realistic demo data: four forms covering every
supported question type, and 30+ responses with mixed completion states
so the Results/analytics screens have something meaningful to render.

Run with:  python -m app.seed.seed_data
(safe to re-run -- it wipes and recreates all tables first)
"""
import random
from datetime import datetime, timedelta

from app.database.session import Base, SessionLocal, engine
from app.models.answer import Answer
from app.models.form import Form, FormStatus
from app.models.question import Question, QuestionType
from app.models.response import Response

random.seed(42)

FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery",
               "Drew", "Cameron", "Reese", "Skyler", "Rowan", "Emerson", "Quinn", "Sage"]
LAST_NAMES = ["Nguyen", "Patel", "Kim", "Garcia", "Smith", "Johnson", "Brown", "Davis",
              "Martinez", "Lee", "Walker", "Young", "Allen", "Wright", "Scott", "Torres"]


def _name() -> str:
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def _email(name: str) -> str:
    handle = name.lower().replace(" ", ".")
    domain = random.choice(["gmail.com", "outlook.com", "yahoo.com", "proton.me"])
    return f"{handle}{random.randint(1, 99)}@{domain}"


def build_customer_feedback(db) -> Form:
    form = Form(title="Customer Feedback", status=FormStatus.published, slug="customer-feedback")
    db.add(form)
    db.flush()

    questions = [
        Question(form_id=form.id, type=QuestionType.short_text, title="What's your name?",
                  description=None, required=True, position=0, settings={"placeholder": "Type your answer here..."}),
        Question(form_id=form.id, type=QuestionType.email, title="What's your email address?",
                  description="We'll only use this to follow up if needed.", required=True, position=1,
                  settings={"placeholder": "name@example.com"}),
        Question(form_id=form.id, type=QuestionType.multiple_choice, title="How did you hear about us?",
                  description=None, required=True, position=2,
                  settings={"choices": ["Social Media", "Friend or Family", "Search Engine", "Advertisement", "Other"]}),
        Question(form_id=form.id, type=QuestionType.rating, title="How would you rate our product overall?",
                  description=None, required=True, position=3, settings={"max": 5}),
        Question(form_id=form.id, type=QuestionType.yes_no, title="Would you recommend us to a friend?",
                  description=None, required=True, position=4, settings={}),
        Question(form_id=form.id, type=QuestionType.long_text, title="Any additional feedback for us?",
                  description="Optional -- but we read every word.", required=False, position=5,
                  settings={"placeholder": "Share your thoughts..."}),
    ]
    db.add_all(questions)
    db.flush()
    return form, questions


def build_employee_survey(db) -> Form:
    form = Form(title="Employee Survey", status=FormStatus.published, slug="employee-survey")
    db.add(form)
    db.flush()

    questions = [
        Question(form_id=form.id, type=QuestionType.dropdown, title="Which department do you work in?",
                  description=None, required=True, position=0,
                  settings={"choices": ["Engineering", "Sales", "Marketing", "HR", "Support", "Finance"]}),
        Question(form_id=form.id, type=QuestionType.rating, title="How satisfied are you with your role?",
                  description="1 = very unsatisfied, 10 = extremely satisfied", required=True, position=1,
                  settings={"max": 10}),
        Question(form_id=form.id, type=QuestionType.multiple_choice,
                  title="How often do you feel recognized for your work?", description=None, required=True,
                  position=2, settings={"choices": ["Always", "Often", "Sometimes", "Rarely", "Never"]}),
        Question(form_id=form.id, type=QuestionType.yes_no, title="Do you feel you have growth opportunities here?",
                  description=None, required=True, position=3, settings={}),
        Question(form_id=form.id, type=QuestionType.number, title="How many years have you been with the company?",
                  description=None, required=True, position=4, settings={"min": 0, "max": 40}),
        Question(form_id=form.id, type=QuestionType.long_text, title="What's one thing we could improve?",
                  description=None, required=False, position=5, settings={"placeholder": "Be as candid as you like..."}),
    ]
    db.add_all(questions)
    db.flush()
    return form, questions


def build_restaurant_feedback(db) -> Form:
    form = Form(title="Restaurant Feedback", status=FormStatus.published, slug="restaurant-feedback")
    db.add(form)
    db.flush()

    questions = [
        Question(form_id=form.id, type=QuestionType.short_text, title="Your name (optional)",
                  description=None, required=False, position=0, settings={"placeholder": "Type your answer here..."}),
        Question(form_id=form.id, type=QuestionType.multiple_choice, title="Which meal did you have?",
                  description=None, required=True, position=1, settings={"choices": ["Breakfast", "Lunch", "Dinner"]}),
        Question(form_id=form.id, type=QuestionType.rating, title="Rate the food quality",
                  description=None, required=True, position=2, settings={"max": 5}),
        Question(form_id=form.id, type=QuestionType.rating, title="Rate the service",
                  description=None, required=True, position=3, settings={"max": 5}),
        Question(form_id=form.id, type=QuestionType.yes_no, title="Would you dine with us again?",
                  description=None, required=True, position=4, settings={}),
        Question(form_id=form.id, type=QuestionType.dropdown, title="How did you make your reservation?",
                  description=None, required=False, position=5, settings={"choices": ["Phone", "Walk-in", "Online", "App"]}),
        Question(form_id=form.id, type=QuestionType.long_text, title="Any comments for the chef?",
                  description=None, required=False, position=6, settings={"placeholder": "Type your answer here..."}),
    ]
    db.add_all(questions)
    db.flush()
    return form, questions


def build_job_application(db) -> Form:
    """Left as a draft with zero responses -- a realistic 'in progress'
    state on the dashboard alongside the published forms."""
    form = Form(title="Job Application", status=FormStatus.draft, slug="job-application")
    db.add(form)
    db.flush()

    questions = [
        Question(form_id=form.id, type=QuestionType.short_text, title="Full Name",
                  description=None, required=True, position=0, settings={"placeholder": "Jane Doe"}),
        Question(form_id=form.id, type=QuestionType.email, title="Email Address",
                  description=None, required=True, position=1, settings={"placeholder": "name@example.com"}),
        Question(form_id=form.id, type=QuestionType.short_text, title="Position You're Applying For",
                  description=None, required=True, position=2, settings={"placeholder": "e.g. Product Designer"}),
        Question(form_id=form.id, type=QuestionType.number, title="Years of Experience",
                  description=None, required=True, position=3, settings={"min": 0, "max": 50}),
        Question(form_id=form.id, type=QuestionType.dropdown, title="Preferred work arrangement",
                  description=None, required=True, position=4, settings={"choices": ["Remote", "Hybrid", "On-site"]}),
        Question(form_id=form.id, type=QuestionType.long_text, title="Why do you want to join us?",
                  description=None, required=False, position=5, settings={"placeholder": "Tell us your story..."}),
        Question(form_id=form.id, type=QuestionType.yes_no, title="Are you authorized to work in this country?",
                  description=None, required=True, position=6, settings={}),
    ]
    db.add_all(questions)
    db.flush()
    return form, questions


def _answer_for(question: Question) -> object:
    if question.type == QuestionType.short_text:
        return _name() if "name" in question.title.lower() else random.choice(
            ["Product Designer", "Backend Engineer", "Growth Marketer", "Data Analyst"])
    if question.type == QuestionType.long_text:
        return random.choice([
            "Really happy with the experience overall, would love to see more customization options.",
            "Everything was smooth and the team was responsive throughout.",
            "A bit slow at times but the quality made up for it.",
            "Nothing to add, it was great!",
            "I think the onboarding could be clearer, otherwise solid.",
        ])
    if question.type == QuestionType.multiple_choice:
        choices = question.settings.get("choices", [])
        return random.choice(choices) if choices else None
    if question.type == QuestionType.dropdown:
        choices = question.settings.get("choices", [])
        return random.choice(choices) if choices else None
    if question.type == QuestionType.email:
        return _email(_name())
    if question.type == QuestionType.number:
        lo = question.settings.get("min", 0)
        hi = question.settings.get("max", 20)
        return random.randint(lo, hi)
    if question.type == QuestionType.yes_no:
        return random.choice(["Yes", "No"])
    if question.type == QuestionType.rating:
        max_val = question.settings.get("max", 5)
        # Skew toward positive ratings, like real feedback data tends to.
        weights = [1] * max_val
        weights[-1] = 4
        weights[-2] = 3
        return random.choices(range(1, max_val + 1), weights=weights, k=1)[0]
    return None


def _create_responses(db, form: Form, questions: list[Question], count: int, partial_count: int):
    now = datetime.utcnow()
    for i in range(count):
        is_complete = i >= partial_count  # first N responses are partial
        submitted_at = now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        response = Response(form_id=form.id, submitted_at=submitted_at, is_complete=is_complete)
        db.add(response)
        db.flush()

        # A partial response only answers the first portion of the form
        # (simulating a respondent who dropped off), a complete one answers
        # everything required plus some optional ones.
        answerable = questions if is_complete else questions[: max(1, len(questions) // 2)]
        for q in answerable:
            if not q.required and random.random() < 0.15:
                continue  # some optional questions are skipped even when complete
            db.add(Answer(response_id=response.id, question_id=q.id, value=_answer_for(q)))


def seed():
    print("Resetting schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        cf_form, cf_qs = build_customer_feedback(db)
        es_form, es_qs = build_employee_survey(db)
        rf_form, rf_qs = build_restaurant_feedback(db)
        build_job_application(db)  # draft, no responses

        _create_responses(db, cf_form, cf_qs, count=15, partial_count=2)
        _create_responses(db, es_form, es_qs, count=10, partial_count=1)
        _create_responses(db, rf_form, rf_qs, count=8, partial_count=1)

        db.commit()
        total = 15 + 10 + 8
        print(f"Seed complete: 4 forms, {total} responses.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
