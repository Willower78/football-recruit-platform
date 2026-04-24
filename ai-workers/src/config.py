"""Environment configuration for the AI worker pipeline."""

import os


DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgres://frp:frp_password@localhost:5432/football_recruit",
)
REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")

S3_ENDPOINT: str = os.getenv("S3_ENDPOINT", "http://localhost:9000")
S3_ACCESS_KEY: str = os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET_KEY: str = os.getenv("S3_SECRET_KEY", "minioadmin")
S3_BUCKET: str = os.getenv("S3_BUCKET", "frp-media")

AI_WORKER_CONCURRENCY: int = int(os.getenv("AI_WORKER_CONCURRENCY", "2"))
VIDEO_MAX_DURATION_SEC: int = int(os.getenv("VIDEO_MAX_DURATION_SEC", "7200"))
HIGHLIGHT_CLIP_BEFORE_SEC: int = int(os.getenv("HIGHLIGHT_CLIP_BEFORE_SEC", "5"))
HIGHLIGHT_CLIP_AFTER_SEC: int = int(os.getenv("HIGHLIGHT_CLIP_AFTER_SEC", "3"))
HIGHLIGHT_MIN_CONFIDENCE: float = float(os.getenv("HIGHLIGHT_MIN_CONFIDENCE", "0.7"))

QUEUE_NAME: str = "video-analysis"
