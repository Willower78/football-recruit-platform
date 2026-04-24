"""Stage 5 — Event classification: detect match events from tracking data.

TODO (real implementation):
    - Analyse ball-player proximity, speed changes, and trajectory changes to
      classify events.
    - Event types to detect:
        pass       — ball moves from one player to another
        shot       — ball moves toward goal at high speed
        dribble    — player carries ball past opponent
        tackle     — defender wins ball
        cross      — ball from wide area into box
        save       — goalkeeper intercepts
        goal       — ball crosses goal line
        foul       — contact + player down
    - Use a combination of rule-based heuristics and a small classifier model.
    - Write events to the tracked_events table.
"""

from __future__ import annotations

from dataclasses import dataclass

from .calibrator import CalibratedPosition


@dataclass
class MatchEvent:
    timestamp_sec: float
    event_type: str
    confidence: float
    coordinates: dict[str, float]
    metadata: dict[str, object]


def classify_events(
    positions: list[CalibratedPosition],
    fps: int = 25,
) -> list[MatchEvent]:
    """Detect match events from calibrated positions.

    Args:
        positions: Calibrated pitch-space positions.
        fps: Video frame rate.

    Returns:
        List of detected events (stub data).
    """
    # --- STUB: generate sample events for pipeline integration testing ---
    events: list[MatchEvent] = [
        MatchEvent(
            timestamp_sec=120.5,
            event_type="pass",
            confidence=0.91,
            coordinates={"pitch_x": 45.0, "pitch_y": 34.0},
            metadata={"from_track": 1, "to_track": 2},
        ),
        MatchEvent(
            timestamp_sec=245.0,
            event_type="shot",
            confidence=0.87,
            coordinates={"pitch_x": 88.0, "pitch_y": 35.0},
            metadata={"on_target": True},
        ),
        MatchEvent(
            timestamp_sec=340.2,
            event_type="dribble",
            confidence=0.82,
            coordinates={"pitch_x": 60.0, "pitch_y": 22.0},
            metadata={"successful": True},
        ),
        MatchEvent(
            timestamp_sec=512.8,
            event_type="tackle",
            confidence=0.79,
            coordinates={"pitch_x": 35.0, "pitch_y": 50.0},
            metadata={"won": True},
        ),
        MatchEvent(
            timestamp_sec=678.0,
            event_type="goal",
            confidence=0.96,
            coordinates={"pitch_x": 104.0, "pitch_y": 34.0},
            metadata={"assist_track": 1},
        ),
        MatchEvent(
            timestamp_sec=890.5,
            event_type="key_pass",
            confidence=0.85,
            coordinates={"pitch_x": 72.0, "pitch_y": 40.0},
            metadata={"progressive": True},
        ),
    ]

    return events
