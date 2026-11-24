AirBoard --- Development Roadmap
Project timeline
The initial target is a focused 2--4 week MVP. The timeline is an
estimate and may change based on integration and testing results.
Phase 0 --- Existing Python prototype
Status: Implemented as an initial prototype

Current capabilities:
- OpenCV webcam capture.
- MediaPipe Tasks hand landmark detection.
- Index fingertip tracking.
- Basic finger-position gesture rules.
- Coordinate smoothing.
- Drawing and erasing on an OpenCV canvas.
- Keyboard controls.
The prototype is a starting point, not the final product.
Phase 1 --- Web foundation and camera tracking
Target: Week 1

Tasks:
- Initialize React, TypeScript, and Vite.
- Establish the web source structure.
- Add MediaPipe Tasks Vision.
- Load the hand landmarker model in the browser.
- Request and release webcam access.
- Display the camera preview.
- Render hand landmarks.
- Track the index fingertip.
- Map fingertip coordinates to a canvas.
Milestone: A browser page that detects a hand and displays live
fingertip movement.
Phase 2 --- Gesture intelligence
Target: Week 2

Tasks:
- Define gesture feature extraction.
- Implement initial geometric gesture rules.
- Add gesture types and classification results.
- Implement a gesture state machine.
- Add temporal stabilization.
- Improve coordinate smoothing.
- Handle hand loss and gesture transitions.
- Connect draw and erase states to the canvas.
Milestone: A browser-based gesture-controlled drawing prototype.
Phase 3 --- Whiteboard experience
Target: Week 3

Tasks:
- Build the main whiteboard workspace.
- Add drawing color selection.
- Add brush thickness controls.
- Implement reliable erasing.
- Implement undo and redo.
- Implement clear canvas.
- Implement PNG export.
- Add camera, tracking, and gesture status feedback.
Milestone: A usable web whiteboard with core controls.
Phase 4 --- Testing and portfolio release
Target: Week 4

Tasks:
- Test different lighting conditions.
- Test different hand orientations and distances.
- Measure gesture recognition accuracy.
- Measure tracking frame rate and response latency.
- Test camera permission denial and camera disconnection.
- Fix interaction and canvas defects.
- Improve responsive layout and instructions.
- Complete documentation.
- Capture screenshots and record a demonstration.
- Publish a tagged MVP release.
Milestone: AirBoard v1.0 MVP.
Deferred features
These are intentionally excluded from the initial release:
- User accounts.
- Cloud storage and synchronization.
- Multiplayer collaboration.
- AI drawing generation.
- Trained deep-learning gesture classification.
- Two-hand advanced interactions.
- Multiple saved projects.
- Mobile-native applications.
Release criteria
AirBoard v1.0 should not be considered complete until the acceptance
criteria in [REQUIREMENTS.md](REQUIREMENTS.md) are met and the test
results are recorded in [TESTING.md](TESTING.md).
Progress tracking
Update this document as work is completed. Mark a task complete only
after implementation and verification. Keep measured results separate
from goals and estimates.