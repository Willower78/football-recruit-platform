"""AI worker entry point — consumes jobs from the Redis video-analysis queue."""

from __future__ import annotations

import json
import logging
import time

import redis

from . import config
from .pipeline.orchestrator import run_pipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
)
logger = logging.getLogger("ai-worker")


def main() -> None:
    """Connect to Redis and process video-analysis jobs in a loop."""
    logger.info(
        "AI worker starting — queue=%s concurrency=%d",
        config.QUEUE_NAME,
        config.AI_WORKER_CONCURRENCY,
    )

    r = redis.Redis.from_url(config.REDIS_URL, decode_responses=True)
    queue_key = f"bull:{config.QUEUE_NAME}:wait"

    logger.info("Listening for jobs on %s", queue_key)

    while True:
        try:
            result = r.brpop(queue_key, timeout=5)
            if result is None:
                continue

            _, raw = result
            job_data = json.loads(raw)
            data = job_data.get("data", job_data)

            job_id = data.get("jobId", "")
            video_url = data.get("videoUrl", "")
            player_id = data.get("playerId", "")
            report_id = data.get("reportId")

            logger.info("Processing job %s", job_id)
            run_pipeline(job_id, video_url, player_id, report_id)

        except KeyboardInterrupt:
            logger.info("Shutting down gracefully")
            break
        except Exception:
            logger.exception("Error processing job")
            time.sleep(2)


if __name__ == "__main__":
    main()
