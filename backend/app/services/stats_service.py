from collections import Counter

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.answer import Answer
from app.models.form import Form
from app.models.question import Question, QuestionType
from app.models.response import Response
from app.schemas.response import ChoiceBreakdown, FormStats, QuestionStats

CHOICE_TYPES = {QuestionType.multiple_choice, QuestionType.dropdown, QuestionType.yes_no}
NUMERIC_TYPES = {QuestionType.number, QuestionType.rating}
TEXT_TYPES = {QuestionType.short_text, QuestionType.long_text, QuestionType.email}


def compute_form_stats(db: Session, form_id: str) -> FormStats:
    form = db.get(Form, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    responses = db.query(Response).filter(Response.form_id == form_id).all()
    total_responses = len(responses)
    completed = sum(1 for r in responses if r.is_complete)
    partial = total_responses - completed
    completion_rate = round((completed / total_responses) * 100, 1) if total_responses else 0.0

    question_stats: list[QuestionStats] = []
    for question in sorted(form.questions, key=lambda q: q.position):
        answers = (
            db.query(Answer)
            .join(Response, Answer.response_id == Response.id)
            .filter(Answer.question_id == question.id)
            .all()
        )
        non_empty = [a for a in answers if a.value not in (None, "", [])]
        stat = QuestionStats(
            question_id=question.id,
            question_title=question.title,
            question_type=question.type.value,
            total_answers=len(non_empty),
        )

        if question.type in CHOICE_TYPES:
            counter: Counter = Counter()
            for a in non_empty:
                counter[str(a.value)] += 1
            total = sum(counter.values()) or 1
            stat.breakdown = [
                ChoiceBreakdown(label=label, count=count, percentage=round(count / total * 100, 1))
                for label, count in sorted(counter.items(), key=lambda kv: -kv[1])
            ]
        elif question.type in NUMERIC_TYPES:
            values = [float(a.value) for a in non_empty if _is_number(a.value)]
            if values:
                stat.average = round(sum(values) / len(values), 2)
                stat.min_value = min(values)
                stat.max_value = max(values)
            if question.type == QuestionType.rating:
                # Ratings are a small bounded scale (1..max), so a
                # value-frequency breakdown doubles as a histogram --
                # useful for charting distribution, not just the mean.
                max_scale = int(question.settings.get("max", 5))
                counter: Counter = Counter(int(v) for v in values)
                total = len(values) or 1
                stat.breakdown = [
                    ChoiceBreakdown(
                        label=str(n), count=counter.get(n, 0), percentage=round(counter.get(n, 0) / total * 100, 1)
                    )
                    for n in range(1, max_scale + 1)
                ]
        elif question.type in TEXT_TYPES:
            stat.sample_answers = [str(a.value) for a in non_empty[-5:]]

        question_stats.append(stat)

    return FormStats(
        form_id=form_id,
        total_responses=total_responses,
        completed_responses=completed,
        partial_responses=partial,
        completion_rate=completion_rate,
        questions=question_stats,
    )


def _is_number(value) -> bool:
    try:
        float(value)
        return True
    except (TypeError, ValueError):
        return False
