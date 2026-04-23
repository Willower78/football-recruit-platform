CREATE TABLE tracked_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id uuid REFERENCES scouting_reports(id) ON DELETE CASCADE,
    timestamp_sec numeric,
    event_type text,
    actor_track_id text,
    x numeric,
    y numeric,
    end_x numeric,
    end_y numeric,
    confidence numeric,
    metadata jsonb
);
