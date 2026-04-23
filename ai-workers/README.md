# ai-workers (placeholder)

This directory is a placeholder for future Python-based AI workers used in
Step 3+ of the platform build-out. Expected responsibilities once implemented:

- Video ingestion and frame extraction
- Object detection + tracking (players, ball) with YOLO/ByteTrack
- Pose estimation
- Event detection (passes, shots, duels)
- Scouting report generation (LLM-assisted) and persistence to `scouting_reports`

## Layout
```
ai-workers/
├── pyproject.toml          # (to be added)
├── workers/
│   ├── __init__.py
│   ├── ingest.py           # (to be added)
│   ├── detect.py           # (to be added)
│   └── report.py           # (to be added)
└── README.md
```

Nothing is runnable yet — this exists so that the repository layout matches
the target monorepo structure.
