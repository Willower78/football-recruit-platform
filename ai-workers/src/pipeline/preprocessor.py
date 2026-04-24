"""Stage 1 — Preprocess: download video from S3, transcode to 720p MP4 @ 25fps.

This stage uses ffmpeg and produces a consistent format for downstream stages.
"""

from __future__ import annotations

import os
import subprocess
import tempfile

from .. import storage


def preprocess(video_url: str, work_dir: str) -> str:
    """Download and transcode the source video.

    Returns the path to the transcoded 720p MP4 file.
    """
    raw_path = os.path.join(work_dir, "raw_video.mp4")

    # Download from S3 (key is the path portion of the URL)
    key = "/".join(video_url.split("/")[4:]) if video_url.startswith("http") else video_url
    storage.download_file(key, raw_path)

    output_path = os.path.join(work_dir, "preprocessed.mp4")

    subprocess.run(
        [
            "ffmpeg", "-y",
            "-i", raw_path,
            "-vf", "scale=-2:720",
            "-r", "25",
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            "-c:a", "aac",
            "-b:a", "128k",
            output_path,
        ],
        check=True,
        capture_output=True,
    )

    return output_path
