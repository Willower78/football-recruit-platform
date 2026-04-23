-- 014 — player_tracking_frames
CREATE TABLE IF NOT EXISTS player_tracking_frames (
    id            BIGSERIAL PRIMARY KEY,
    report_id     UUID NOT NULL REFERENCES scouting_reports(id) ON DELETE CASCADE,
    frame_ts_ms   BIGINT NOT NULL,
    track_id      INTEGER,
    team_label    VARCHAR(20),
    bbox_x        NUMERIC(10,3),
    bbox_y        NUMERIC(10,3),
    bbox_w        NUMERIC(10,3),
    bbox_h        NUMERIC(10,3),
    pitch_x       NUMERIC(10,3),
    pitch_y       NUMERIC(10,3),
    speed_mps     NUMERIC(10,3),
    metadata      JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_tracking_report_ts ON player_tracking_frames (report_id, frame_ts_ms);
