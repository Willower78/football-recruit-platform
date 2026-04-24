"""Stage 3 — Tracking: multi-object tracking with ByteTrack.

TODO (real implementation):
    - Use ByteTrack (or similar MOT tracker) to assign consistent track IDs
      across frames based on the detections from Stage 2.
    - Track IDs should persist across frames for the same physical object.
    - Output: tracked objects with stable IDs and per-frame positions.
    - Consider using the `supervision` library for easy ByteTrack integration.
"""

from __future__ import annotations

from dataclasses import dataclass

from .detector import Detection


@dataclass
class TrackedObject:
    frame_idx: int
    track_id: int
    class_label: str
    bbox_x: float
    bbox_y: float
    bbox_w: float
    bbox_h: float


def track(detections: list[Detection]) -> list[TrackedObject]:
    """Assign consistent track IDs across frames.

    Args:
        detections: Raw detections from the detector stage.

    Returns:
        List of tracked objects with stable IDs (stub data).
    """
    # --- STUB: assign deterministic track IDs based on position ---
    tracked: list[TrackedObject] = []
    for det in detections:
        track_id = 1 if det.bbox_x < 400 else (2 if det.class_label == "player" else 99)
        tracked.append(
            TrackedObject(
                frame_idx=det.frame_idx,
                track_id=track_id,
                class_label=det.class_label,
                bbox_x=det.bbox_x,
                bbox_y=det.bbox_y,
                bbox_w=det.bbox_w,
                bbox_h=det.bbox_h,
            )
        )

    return tracked
