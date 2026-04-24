# Model Weights

This directory is where pre-trained model weights should be placed.

## Required Models

### YOLOv8 (Player + Ball Detection)
- Download: `pip install ultralytics && yolo export model=yolov8x.pt format=onnx`
- Or download from: https://github.com/ultralytics/ultralytics
- Place as: `yolov8x.pt` or `yolov8x.onnx`

### Custom Fine-Tuned Model (Optional)
- A football-specific fine-tuned YOLO model for better player/ball detection
- Place as: `football_detector.pt`

## Notes
- The pipeline currently uses stub implementations for ML stages
- When real models are added, update `detector.py` to load from this directory
- Large model files should NOT be committed to git — use Git LFS or download at build time
