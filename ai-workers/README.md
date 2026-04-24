# ai-workers

Python workers for AI-assisted scouting tasks. Structure is a placeholder for
Step 1; real implementations (object detection, player tracking, event
detection) land in later steps.

## Planned workers

- `video_ingest/` — download, decode, and normalise uploaded video assets.
- `tracking/` — per-frame player / ball tracking (e.g. YOLO + ByteTrack).
- `events/` — high-level event detection (passes, shots, tackles).
- `reporting/` — summary generation that writes to `scouting_reports`.

## Dev setup

```bash
cd ai-workers
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Shared deps

See `requirements.txt` for the minimal placeholder footprint.
