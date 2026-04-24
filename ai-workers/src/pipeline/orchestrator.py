"""Pipeline orchestrator — runs all stages in sequence for one analysis job."""

from __future__ import annotations

import json
import logging
import tempfile
import time

from .. import db, storage
from .preprocessor import preprocess
from .detector import detect
from .tracker import track
from .calibrator import calibrate
from .event_classifier import classify_events
from .metrics_aggregator import aggregate_metrics
from .rating_generator import generate_ratings
from .report_generator import generate_report
from .highlight_clipper import clip_highlights

logger = logging.getLogger(__name__)


def run_pipeline(
    job_id: str,
    video_url: str,
    player_id: str,
    report_id: str | None = None,
) -> None:
    """Execute the full analysis pipeline for a single video.

    Updates the analysis_jobs row with progress as it goes. On failure the job
    is marked failed with an error message.
    """
    start_time = time.time()

    try:
        with tempfile.TemporaryDirectory(prefix="frp_pipeline_") as work_dir:
            # Stage 1: Preprocess (0-10%)
            db.update_job_status(job_id, status="preprocessing", progress_pct=0, current_stage="Downloading and transcoding video")
            video_path = preprocess(video_url, work_dir)
            db.update_job_status(job_id, status="preprocessing", progress_pct=10, current_stage="Preprocessing complete")

            # Stage 2: Detection (10-30%)
            db.update_job_status(job_id, status="detecting", progress_pct=10, current_stage="Detecting players and ball")
            detections = detect(video_path)
            db.update_job_status(job_id, status="detecting", progress_pct=30, current_stage=f"Detected {len(detections)} objects")

            # Stage 3: Tracking (30-45%)
            db.update_job_status(job_id, status="tracking", progress_pct=30, current_stage="Tracking objects across frames")
            tracked = track(detections)
            db.update_job_status(job_id, status="tracking", progress_pct=45, current_stage=f"Tracking {len(tracked)} objects")

            # Stage 4: Calibration (45-55%)
            db.update_job_status(job_id, status="calibrating", progress_pct=45, current_stage="Calibrating pitch coordinates")
            positions = calibrate(tracked, video_path)
            db.update_job_status(job_id, status="calibrating", progress_pct=55, current_stage="Calibration complete")

            # Stage 5: Event Detection (55-70%)
            db.update_job_status(job_id, status="event_detection", progress_pct=55, current_stage="Classifying match events")
            events = classify_events(positions)
            _write_events_to_db(report_id, events)
            db.update_job_status(job_id, status="event_detection", progress_pct=70, current_stage=f"Detected {len(events)} events")

            # Stage 6: Metrics Aggregation (70-80%)
            db.update_job_status(job_id, status="aggregating", progress_pct=70, current_stage="Aggregating player metrics")
            all_metrics = aggregate_metrics(positions, events)
            db.update_job_status(job_id, status="aggregating", progress_pct=80, current_stage="Metrics aggregated")

            # Stage 7: Rating Generation (80-85%)
            db.update_job_status(job_id, status="generating_report", progress_pct=80, current_stage="Generating ratings")
            ratings = generate_ratings(all_metrics[0]) if all_metrics else []
            if report_id and ratings:
                _write_ratings_to_db(report_id, ratings)

            # Stage 8: Report Generation (85-90%)
            db.update_job_status(job_id, status="generating_report", progress_pct=85, current_stage="Generating scouting report")
            report = generate_report(ratings) if ratings else None
            if report_id and report:
                _write_report_to_db(report_id, report)
            db.update_job_status(job_id, status="generating_report", progress_pct=90, current_stage="Report generated")

            # Stage 9: Highlight Clipping (90-100%)
            db.update_job_status(job_id, status="clipping_highlights", progress_pct=90, current_stage="Clipping highlights")
            clips = clip_highlights(video_path, events, work_dir)
            if report_id and player_id:
                _upload_and_save_highlights(report_id, player_id, clips)
            db.update_job_status(job_id, status="clipping_highlights", progress_pct=98, current_stage=f"Clipped {len(clips)} highlights")

        # Complete
        elapsed = int(time.time() - start_time)
        db.complete_job(job_id, elapsed)
        logger.info("Pipeline completed for job %s in %ds", job_id, elapsed)

    except Exception as exc:
        logger.exception("Pipeline failed for job %s", job_id)
        db.fail_job(job_id, str(exc))
        raise


def _write_events_to_db(report_id: str | None, events: list) -> None:
    """Write detected events to the tracked_events table."""
    if not report_id:
        return
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            for ev in events:
                cur.execute(
                    """
                    INSERT INTO tracked_events (report_id, timestamp_sec, event_type, coordinates, confidence, metadata)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (report_id, ev.timestamp_sec, ev.event_type,
                     json.dumps(ev.coordinates), ev.confidence,
                     json.dumps(ev.metadata)),
                )
        conn.commit()
    finally:
        conn.close()


def _write_ratings_to_db(report_id: str, ratings: list) -> None:
    """Write scouting ratings to the scouting_ratings table."""
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            for r in ratings:
                cur.execute(
                    """
                    INSERT INTO scouting_ratings (report_id, category, score, ai_generated)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (report_id, r.category, r.score, r.ai_generated),
                )
        conn.commit()
    finally:
        conn.close()


def _write_report_to_db(report_id: str, report) -> None:
    """Update the scouting_reports row with generated data."""
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE scouting_reports
                SET scores = %s,
                    strengths = %s,
                    weaknesses = %s,
                    summary_text = %s,
                    status = %s,
                    updated_at = NOW()
                WHERE id = %s
                """,
                (
                    json.dumps(report.scores),
                    json.dumps(report.strengths),
                    json.dumps(report.weaknesses),
                    report.summary_text,
                    report.status,
                    report_id,
                ),
            )
        conn.commit()
    finally:
        conn.close()


def _upload_and_save_highlights(
    report_id: str,
    player_id: str,
    clips: list,
) -> None:
    """Upload clip files to S3 and save records to the highlights table."""
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            for clip in clips:
                clip_key = f"highlights/{report_id}/{clip.title.replace(' ', '_')}.mp4"
                thumb_key = f"highlights/{report_id}/{clip.title.replace(' ', '_')}_thumb.jpg"

                clip_url = storage.upload_file(clip.clip_path, clip_key)
                thumb_url = storage.upload_file(clip.thumbnail_path, thumb_key)

                cur.execute(
                    """
                    INSERT INTO highlights
                        (scouting_report_id, player_id, title, event_type,
                         start_time_sec, end_time_sec, duration_sec,
                         clip_storage_url, thumbnail_url, confidence)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        report_id, player_id, clip.title, clip.event_type,
                        clip.start_time_sec, clip.end_time_sec, clip.duration_sec,
                        clip_url, thumb_url, clip.confidence,
                    ),
                )
        conn.commit()
    finally:
        conn.close()
