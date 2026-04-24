"""Stage 7 — Rating generation: map metrics to the 13 scouting categories.

The 13 categories:
    1.  First Touch & Composure
    2.  Passing Accuracy & Range
    3.  Dribbling & Ball Carrying
    4.  Shooting & Finishing
    5.  Speed & Agility
    6.  Strength & Stamina
    7.  Off-Ball Movement
    8.  Decision-Making
    9.  Position-Specific Technique  (non-AI — left null)
    10. Game Reading                 (non-AI — left null)
    11. Tactical Understanding       (non-AI — left null)
    12. Mentality                    (non-AI — left null)
    13. Body Language                (non-AI — left null)

TODO (real implementation):
    - Use weighted formulas for each AI-detectable category.
    - First Touch & Composure: touch success rate, ball retention.
    - Passing Accuracy & Range: completion %, long %, progressive passes.
    - Dribbling & Ball Carrying: dribble success %, progressive carries.
    - Shooting & Finishing: shot accuracy, xG-like positional metric.
    - Speed & Agility: top speed, acceleration, direction changes.
    - Strength & Stamina: distance, speed maintenance over time, duel rate.
    - Off-Ball Movement: distance without ball, runs into space.
    - Decision-Making: pass selection quality, shot timing.
"""

from __future__ import annotations

from dataclasses import dataclass

from .metrics_aggregator import PlayerMetrics


@dataclass
class ScoutingRating:
    category: str
    score: float | None  # 1.0-10.0, None = needs human review
    ai_generated: bool


def generate_ratings(metrics: PlayerMetrics) -> list[ScoutingRating]:
    """Map a player's aggregated metrics to the 13 scouting category ratings.

    Returns:
        List of 13 ScoutingRating objects.
    """
    pass_pct = (
        (metrics.passes_completed / max(metrics.passes_attempted, 1)) * 10.0
    )
    dribble_pct = (
        (metrics.dribbles_successful / max(metrics.dribbles_attempted, 1)) * 10.0
    )
    speed_score = min(metrics.top_speed_mps / 1.0, 10.0)
    stamina_score = min(metrics.distance_covered_m / 1200.0, 10.0)
    duel_pct = (
        (metrics.duels_won / max(metrics.duels_won + metrics.duels_lost, 1)) * 10.0
    )

    return [
        ScoutingRating("First Touch & Composure", round(min(metrics.touches / 10.0, 10.0), 1), True),
        ScoutingRating("Passing Accuracy & Range", round(pass_pct, 1), True),
        ScoutingRating("Dribbling & Ball Carrying", round(dribble_pct, 1), True),
        ScoutingRating("Shooting & Finishing", round(min(metrics.shots * 2.0, 10.0), 1), True),
        ScoutingRating("Speed & Agility", round(speed_score, 1), True),
        ScoutingRating("Strength & Stamina", round((stamina_score + duel_pct) / 2.0, 1), True),
        ScoutingRating("Off-Ball Movement", round(min(metrics.sprint_count / 3.0, 10.0), 1), True),
        ScoutingRating("Decision-Making", round(pass_pct * 0.8, 1), True),
        # Non-AI categories — require scout review
        ScoutingRating("Position-Specific Technique", None, False),
        ScoutingRating("Game Reading", None, False),
        ScoutingRating("Tactical Understanding", None, False),
        ScoutingRating("Mentality", None, False),
        ScoutingRating("Body Language", None, False),
    ]
