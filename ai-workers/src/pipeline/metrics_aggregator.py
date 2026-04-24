"""Stage 6 — Metrics aggregation: compute per-player statistics.

TODO (real implementation):
    - Aggregate from calibrated positions and events:
        distance_covered, top_speed, avg_speed, sprint_count,
        passes_attempted, passes_completed, shots, dribbles_attempted,
        dribbles_successful, tackles, duels_won, duels_lost, touches,
        time_on_ball.
    - Write metrics to the player_tracking_frames table.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .calibrator import CalibratedPosition
from .event_classifier import MatchEvent


@dataclass
class PlayerMetrics:
    track_id: int
    distance_covered_m: float = 0.0
    top_speed_mps: float = 0.0
    avg_speed_mps: float = 0.0
    sprint_count: int = 0
    passes_attempted: int = 0
    passes_completed: int = 0
    shots: int = 0
    dribbles_attempted: int = 0
    dribbles_successful: int = 0
    tackles: int = 0
    duels_won: int = 0
    duels_lost: int = 0
    touches: int = 0
    time_on_ball_sec: float = 0.0


def aggregate_metrics(
    positions: list[CalibratedPosition],
    events: list[MatchEvent],
) -> list[PlayerMetrics]:
    """Compute per-player statistics from positions and events.

    Returns:
        List of aggregated metrics per tracked player (stub data).
    """
    # --- STUB: return representative sample metrics ---
    return [
        PlayerMetrics(
            track_id=1,
            distance_covered_m=9800.0,
            top_speed_mps=8.5,
            avg_speed_mps=4.2,
            sprint_count=22,
            passes_attempted=45,
            passes_completed=38,
            shots=3,
            dribbles_attempted=8,
            dribbles_successful=5,
            tackles=4,
            duels_won=12,
            duels_lost=6,
            touches=65,
            time_on_ball_sec=180.0,
        ),
        PlayerMetrics(
            track_id=2,
            distance_covered_m=10200.0,
            top_speed_mps=9.1,
            avg_speed_mps=4.5,
            sprint_count=28,
            passes_attempted=52,
            passes_completed=44,
            shots=5,
            dribbles_attempted=12,
            dribbles_successful=8,
            tackles=2,
            duels_won=15,
            duels_lost=5,
            touches=78,
            time_on_ball_sec=210.0,
        ),
    ]
