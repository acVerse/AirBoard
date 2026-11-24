AirBoard --- Architecture
1. Architecture overview
The planned MVP uses a client-side web architecture. Camera frames are
captured in the browser, processed by MediaPipe Tasks Vision,
interpreted by a gesture engine, and translated into canvas operations.

A backend is intentionally excluded from the first MVP because camera
processing, drawing, and PNG export can be performed locally in the
browser.
2. High-level data flow
Browser camera
     |
     v
Camera manager
     |
     v
MediaPipe Tasks Vision
     |
     v
Hand landmarks (21 points)
     |
     v
Landmark / feature processor
     |
     v
Gesture classifier
     |
     v
Gesture state machine
     |
     v
Interaction controller
     |
     +--------------------+
     |                    |
     v                    v
Canvas engine        UI feedback
     |                    |
     v                    v
Drawing output       Gesture / status display
     |
     v
PNG export
3. Proposed technology choices
  Technology                 Responsibility
  React                      User interface and component composition
TypeScript                 Types and application logic
Vite                       Development server and build tooling
MediaPipe Tasks Vision     Browser-based hand landmark detection
HTML Canvas API            Drawing and rendering
Browser MediaDevices API   Webcam access
Browser download APIs      Exporting drawings
Vitest / Testing Library   Unit and component testing, if adopted

The precise dependency versions should be selected and recorded when the
web application is initialized.
4. Main modules
4.1 Presentation layer
Responsibilities:
- Render the workspace, toolbar, camera preview, and status
  indicators.
- Display camera permission and tracking states.
- Expose accessible controls for users who do not want to use
  gestures.
- Reflect application state without owning the computer-vision
  algorithms.
Possible components:
- Whiteboard
- Toolbar
- CameraPreview
- GestureIndicator
- StatusPanel
4.2 Camera manager
Responsibilities:
- Request camera permission.
- Start and stop the video stream.
- Handle unavailable devices and permission errors.
- Release media tracks when camera use ends.
- Provide video frames to the hand-tracking module.
The camera manager should not classify gestures or draw on the canvas.
4.3 Hand-tracking module
Responsibilities:
- Initialize the MediaPipe Hand Landmarker.
- Process video frames.
- Return detected hand landmarks and relevant tracking information.
- Handle initialization and inference errors.
- Release resources when tracking stops.
The web implementation will use the JavaScript MediaPipe Tasks Vision
API. The Python MediaPipe API is not directly reusable in the browser.
4.4 Landmark and feature processor
Responsibilities:
- Convert normalized landmark coordinates into application
  coordinates.
- Extract finger extension features.
- Calculate relative distances and joint angles where useful.
- Normalize measurements to reduce sensitivity to hand size and camera
  distance.
- Smooth cursor coordinates.
4.5 Gesture classifier
Responsibilities:
- Interpret extracted hand features.
- Return a gesture label and, where available, a confidence or
  stability measure.
- Keep classification rules independent from UI and canvas operations.
Initial classification should use understandable geometric rules. A
trained machine-learning classifier is a possible future experiment, not
an MVP dependency.
4.6 Gesture state machine
Responsibilities:
- Maintain the current interaction state.
- Confirm gesture changes across consecutive frames.
- Prevent conflicting actions.
- Reset safely when the hand is lost.
- Prevent accidental strokes during transitions.
Example states:
- idle
- drawing
- erasing
- selecting (optional)
Example transitions:
IDLE --draw confirmed--> DRAWING
DRAWING --pause confirmed--> IDLE
DRAWING --erase confirmed--> ERASING
ERASING --pause confirmed--> IDLE
ANY ACTIVE STATE --hand lost--> IDLE
4.7 Interaction controller
Responsibilities:
- Translate confirmed gesture states into application commands.
- Coordinate cursor position, selected tool, and canvas actions.
- Keep gesture recognition separate from the drawing implementation.
4.8 Canvas engine
Responsibilities:
- Render strokes.
- Manage brush color and thickness.
- Erase content.
- Support undo and redo.
- Clear the canvas.
- Export a PNG image.
The canvas engine should be testable without a webcam.
4.9 Storage
For the MVP:
- Keep active drawing state in memory.
- Use browser download functionality for PNG export.
- Store only non-sensitive preferences locally if needed.
Persistent project files, cloud storage, and account synchronization are
future features.
5. Proposed source layout
src/
├── main.tsx
├── App.tsx
├── components/
│   ├── CameraPreview.tsx
│   ├── GestureIndicator.tsx
│   ├── Toolbar.tsx
│   └── Whiteboard.tsx
├── vision/
│   ├── cameraManager.ts
│   ├── handTracker.ts
│   └── landmarkProcessor.ts
├── gestures/
│   ├── gestureFeatures.ts
│   ├── gestureClassifier.ts
│   ├── gestureStateMachine.ts
│   └── gestureTypes.ts
├── canvas/
│   ├── drawingEngine.ts
│   ├── brush.ts
│   ├── eraser.ts
│   ├── historyManager.ts
│   └── exportManager.ts
├── hooks/
│   ├── useCamera.ts
│   └── useHandTracking.ts
├── types/
│   └── index.ts
├── utils/
│   ├── smoothing.ts
│   └── coordinateMapper.ts
└── styles/
    └── globals.css
This is a proposed structure. Create modules when they have a clear
responsibility; do not create empty files simply to match the diagram.
6. Important engineering decisions
Client-side processing
The MVP should process camera frames locally in the browser where
possible. This reduces the need to transmit video to a server and avoids
a network round trip for every frame.
Separate inference from rendering
Hand inference and canvas rendering have different performance
requirements. The implementation should avoid triggering unnecessary
React renders for every landmark update. Use refs or a dedicated
rendering loop for high-frequency data where appropriate.
Coordinate mapping
The camera preview may be mirrored for a natural user experience.
Coordinate mapping must account for mirroring, aspect ratio, and the
actual canvas dimensions. The cursor and stroke should remain aligned
when the viewport changes size.
Safe state transitions
When tracking is lost, drawing must stop and the previous cursor
position must be reset. Otherwise, the next detected position may create
an unwanted line.
Erasing
The browser implementation should erase actual strokes or use a
compositing approach that removes pixels correctly. It should not rely
on drawing a black stroke if the canvas background can change.
7. Future backend boundary
A backend may be introduced later for user accounts, cloud projects,
sharing, or synchronization. If that happens, the API should receive
project data or explicit user actions---not continuous webcam frames by
default.

Potential future backend: Python with FastAPI. This is not part of the
first MVP.