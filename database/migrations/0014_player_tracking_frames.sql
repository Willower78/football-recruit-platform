CREATE TABLE player_tracking_frames (
    id bigserial PRIMARY KEY,
    report_id uuid REFERENCES scouting_reports(id) ON DELETE CASCADE,
    frame_ts_ms bigint,
    track_id text,
    team_label text,
    bbox_x numeric,
    bbox_y numeric,
    bbox_w numeric,
    bbox_h numeric,
    pitch_x numeric,
    pitch_y numeric,
    speed_mps numeric,
    metadata jsonb
);
