"""Stage 8 — Report generation: compile scouting report from ratings + events."""

from __future__ import annotations

from dataclasses import dataclass

from .rating_generator import ScoutingRating


@dataclass
class GeneratedReport:
    scores: dict[str, float | None]
    strengths: list[str]
    weaknesses: list[str]
    summary_text: str
    status: str  # "draft" or "reviewed"


def generate_report(ratings: list[ScoutingRating]) -> GeneratedReport:
    """Compile a scouting report from the generated ratings.

    Identifies top 3 strengths and bottom 3 weaknesses from AI-rated
    categories. Non-AI categories are excluded from ranking.
    """
    scored = [(r.category, r.score) for r in ratings if r.score is not None]
    scored.sort(key=lambda x: x[1], reverse=True)

    strengths = [cat for cat, _ in scored[:3]]
    weaknesses = [cat for cat, _ in scored[-3:]]

    scores = {r.category: r.score for r in ratings}

    avg_score = sum(s for s in scores.values() if s is not None) / max(
        len([s for s in scores.values() if s is not None]), 1
    )

    needs_review = any(r.score is None for r in ratings)

    summary_lines = [
        f"AI-generated scouting report (average score: {avg_score:.1f}/10).",
        f"Top strengths: {', '.join(strengths)}.",
        f"Areas to improve: {', '.join(weaknesses)}.",
    ]
    if needs_review:
        summary_lines.append(
            "Some categories require manual scout assessment."
        )

    return GeneratedReport(
        scores=scores,
        strengths=strengths,
        weaknesses=weaknesses,
        summary_text=" ".join(summary_lines),
        status="draft" if needs_review else "reviewed",
    )
