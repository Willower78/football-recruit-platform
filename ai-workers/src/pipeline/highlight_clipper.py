"""Stage 9 — Highlight clipping: extract highlight clips using ffmpeg.

This is a real implementation — it uses ffmpeg to cut segments from the
source video around detected events.
"""

from __future__ import annotations

import os
import subprocess
from dataclasses import dataclass

from .. import config, storage
from .event_classifier import MatchEvent


@dataclass
class HighlightClip:
    event_type: str
    title: str
    start_time_sec: float
    end_time_sec: float
    duration_sec: float
    clip_path: str
    thumbnail_path: str
    confidence: float


def clip_highlights(
    video_path: str,
    events: list[MatchEvent],
    work_dir: str,
    clip_before: int | None = None,
    clip_after: int | None = None,
    min_confidence: float | None = None,
) -> list[HighlightClip]:
    """Extract highlight clips from the source video for significant events.

    Args:
        video_path: Path to the preprocessed source video.
        events: Detected match events.
        work_dir: Directory for temporary clip files.
        clip_before: Seconds before event to include (default from config).
        clip_after: Seconds after event to include (default from config).
        min_confidence: Minimum confidence threshold (default from config).

    Returns:
        List of generated highlight clips.
    """
    before = clip_before if clip_before is not None else config.HIGHLIGHT_CLIP_BEFORE_SEC
    after = clip_after if clip_after is not None else config.HIGHLIGHT_CLIP_AFTER_SEC
    threshold = min_confidence if min_confidence is not None else config.HIGHLIGHT_MIN_CONFIDENCE

    highlight_types = {"goal", "assist", "key_pass", "dribble", "tackle", "save", "shot"}
    clips_dir = os.path.join(work_dir, "clips")
    os.makedirs(clips_dir, exist_ok=True)

    clips: list[HighlightClip] = []

    for i, event in enumerate(events):
        if event.event_type not in highlight_types:
            continue
        if event.confidence < threshold:
            continue

        start = max(0, event.timestamp_sec - before)
        end = event.timestamp_sec + after
        duration = end - start

        minutes = int(event.timestamp_sec // 60)
        seconds = int(event.timestamp_sec % 60)
        title = f"{event.event_type.replace('_', ' ').title()} - {minutes}:{seconds:02d}"

        clip_path = os.path.join(clips_dir, f"highlight_{i:03d}.mp4")
        thumb_path = os.path.join(clips_dir, f"highlight_{i:03d}_thumb.jpg")

        # Extract clip with ffmpeg
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-ss", str(start),
                "-i", video_path,
                "-t", str(duration),
                "-c:v", "libx264",
                "-preset", "fast",
                "-c:a", "aac",
                clip_path,
            ],
            check=True,
            capture_output=True,
        )

        # Generate thumbnail from the event timestamp
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-ss", str(event.timestamp_sec),
                "-i", video_path,
                "-frames:v", "1",
                "-q:v", "3",
                thumb_path,
            ],
            check=True,
            capture_output=True,
        )

        clips.append(
            HighlightClip(
                event_type=event.event_type,
                title=title,
                start_time_sec=start,
                end_time_sec=end,
                duration_sec=duration,
                clip_path=clip_path,
                thumbnail_path=thumb_path,
                confidence=event.confidence,
            )
        )

    return clips
