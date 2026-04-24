"""Stage 4 — Calibration: pitch line detection + homography.

TODO (real implementation):
    - Detect pitch lines using edge detection (Canny) + Hough transform.
    - Identify known pitch landmarks (penalty box corners, center circle, etc.).
    - Compute a homography matrix mapping pixel coordinates to real-world
      pitch coordinates in metres (105m x 68m standard pitch).
    - Apply the homography to all tracked object positions.
    - Use OpenCV cv2.findHomography() with RANSAC for robustness.
"""

from __future__ import annotations

from dataclasses import dataclass

from .tracker import TrackedObject


@dataclass
class CalibratedPosition:
    frame_idx: int
    track_id: int
    class_label: str
    pitch_x: float  # metres (0-105)
    pitch_y: float  # metres (0-68)
    speed_mps: float


def calibrate(
    tracked_objects: list[TrackedObject],
    video_path: str,
) -> list[CalibratedPosition]:
    """Map pixel-space tracks to real pitch coordinates.

    Args:
        tracked_objects: Tracked objects from the tracker stage.
        video_path: Path to video for pitch line detection.

    Returns:
        List of calibrated positions in pitch-space (stub data).
    """
    # --- STUB: linearly map pixel coordinates to pitch coordinates ---
    positions: list[CalibratedPosition] = []
    for obj in tracked_objects:
        pitch_x = (obj.bbox_x / 1280.0) * 105.0
        pitch_y = (obj.bbox_y / 720.0) * 68.0
        speed = 5.5 if obj.class_label == "player" else 12.0

        positions.append(
            CalibratedPosition(
                frame_idx=obj.frame_idx,
                track_id=obj.track_id,
                class_label=obj.class_label,
                pitch_x=round(pitch_x, 2),
                pitch_y=round(pitch_y, 2),
                speed_mps=speed,
            )
        )

    return positions
