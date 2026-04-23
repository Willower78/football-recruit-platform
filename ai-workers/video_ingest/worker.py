"""Placeholder entrypoint for the video ingest worker.

Real ingest pipeline will:
    1. Pull new `media_assets` rows from the DB (or queue).
    2. Normalise video (resolution, FPS, codec) using ffmpeg.
    3. Generate thumbnail + duration metadata.
    4. Update the `media_assets` row with results.
"""


def main() -> None:
    raise NotImplementedError("video_ingest.worker is a Step-1 placeholder")


if __name__ == "__main__":
    main()
