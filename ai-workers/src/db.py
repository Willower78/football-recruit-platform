"""PostgreSQL connection helper for the AI worker pipeline."""

from __future__ import annotations

from typing import Any

import psycopg2
import psycopg2.extras

from . import config


def get_connection() -> Any:
    """Return a new psycopg2 connection using the DATABASE_URL."""
    return psycopg2.connect(config.DATABASE_URL)


def update_job_status(
    job_id: str,
    *,
    status: str,
    progress_pct: int,
    current_stage: str | None = None,
    error_message: str | None = None,
) -> None:
    """Update the analysis_jobs row with current pipeline progress."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE analysis_jobs
                SET status = %s,
                    progress_pct = %s,
                    current_stage = %s,
                    error_message = %s,
                    updated_at = NOW()
                WHERE id = %s
                """,
                (status, progress_pct, current_stage, error_message, job_id),
            )
        conn.commit()
    finally:
        conn.close()


def complete_job(job_id: str, processing_time_sec: int) -> None:
    """Mark an analysis job as completed."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE analysis_jobs
                SET status = 'completed',
                    progress_pct = 100,
                    current_stage = NULL,
                    completed_at = NOW(),
                    processing_time_sec = %s,
                    updated_at = NOW()
                WHERE id = %s
                """,
                (processing_time_sec, job_id),
            )
        conn.commit()
    finally:
        conn.close()


def fail_job(job_id: str, error_message: str) -> None:
    """Mark an analysis job as failed."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE analysis_jobs
                SET status = 'failed',
                    error_message = %s,
                    completed_at = NOW(),
                    updated_at = NOW()
                WHERE id = %s
                """,
                (error_message, job_id),
            )
        conn.commit()
    finally:
        conn.close()
