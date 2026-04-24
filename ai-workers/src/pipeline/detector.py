"""Stage 2 — Detection: YOLO v8/v9 player + ball detection per frame.

TODO (real implementation):
    - Load a pre-trained YOLOv8 or YOLOv9 model (ultralytics).
    - Run inference on every Nth frame (e.g. every 5th frame = 5fps effective).
    - Output bounding boxes per frame with class labels (player/ball/referee)
      and confidence scores.
    - Use batch inference for GPU efficiency.
    - Model weights should be downloaded to ai-workers/src/models/.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Detection:
    frame_idx: int
    class_label: str  # "player", "ball", "referee"
    confidence: float
    bbox_x: float
    bbox_y: float
    bbox_w: float
    bbox_h: float


def detect(video_path: str, sample_rate: int = 5) -> list[Detection]:
    """Run object detection on the video.

    Args:
        video_path: Path to preprocessed 720p MP4.
        sample_rate: Process every Nth frame.

    Returns:
        List of detections across all sampled frames (stub data).
    """
    # --- STUB: return mock detections for pipeline integration testing ---
    detections: list[Detection] = []
    for frame in range(0, 2250, sample_rate):  # ~90 seconds of footage at 25fps
        # Two players and a ball per sampled frame
        detections.append(Detection(frame, "player", 0.95, 200.0, 300.0, 40.0, 80.0))
        detections.append(Detection(frame, "player", 0.92, 600.0, 310.0, 42.0, 82.0))
        detections.append(Detection(frame, "ball", 0.88, 400.0, 350.0, 12.0, 12.0))

    return detections
