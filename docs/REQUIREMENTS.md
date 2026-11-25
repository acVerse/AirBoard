AirBoard --- Requirements
This document defines the proposed requirements for the browser-based
MVP. It distinguishes existing prototype capabilities from requirements
planned for the web application.
1. Status terminology
- Prototype: Present in the current Python implementation.
- MVP: Required for the first browser release.
- Future: Not required for the first browser release.
2. Functional requirements
  ID                Requirement        Priority          Status
  FR-01             Request browser    Must              MVP
camera permission
before accessing
the webcam.                          

  FR-02             Allow the user to  Must              MVP
start and stop the
camera.                              

  FR-03             Detect at least    Must              Prototype: Python
one hand in the
camera frame.                        

  FR-04             Obtain the 21 hand Must              Prototype: Python
landmarks returned
by the hand
landmarker.                          

  FR-05             Track the index    Must              Prototype: Python
fingertip and map
it to canvas
coordinates.                         

  FR-06             Classify a defined Must              Prototype: basic
set of hand                          rules
gestures.                            

  FR-07             Draw strokes using Must              Prototype: Python
the tracked
fingertip and
drawing gesture.                     

  FR-08             Erase existing     Must              Prototype: black
drawing content.                     overlay; improve
for MVP

  FR-09             Display the        Must              MVP
current tracking
and interaction
state.                               

  FR-10             Stop active        Must              Prototype:
drawing safely                       partial behavior
when the hand is
lost.                                

  FR-11             Stabilize gesture  Must              MVP
changes to reduce
accidental
activation.                          

  FR-12             Allow selection of Should            MVP
drawing color.                       

  FR-13             Allow adjustment   Should            MVP
of brush
thickness.                           

  FR-14             Support undo and   Should            MVP
redo.                                

  FR-15             Clear the current  Must              Prototype: Python
canvas.                              

  FR-16             Export the drawing Should            MVP
as a PNG image.                      

  FR-17             Provide            Could             Future
calibration or
sensitivity
settings.                            

  FR-19             Support multiple   Could             Future
saved whiteboard
projects.                            
FR-20             Support user       Could             Future
accounts and cloud
synchronization.
FR-18             Support two-hand   Must              MVP
tracking and allow a
control hand to operate
the palette while the
other hand draws.
FR-21             Import lesson       Could             Future
files and support
multiple pages.
3. Initial gesture requirements
The following gestures are proposed for the web MVP. Their final
definitions must be tested with different hand sizes, orientations, and
camera positions.
  Hand / gesture          Proposed action         Notes
  Drawing hand, index     Draw                    Other fingers follow the
  extended                                        classifier rules.
  Drawing hand, index     Pause drawing           Must not create a stroke.
  and middle extended
  Control hand raised     Open fixed palette      Palette stays open while
                                                  the hand is in use.
  Control hand points     Highlight palette item  Pointing alone does not
                                                  activate a tool.
  Control hand holds      Select highlighted tool Hold until cursor ring
  over an item                                     fills; drawing continues.
  Control hand lowered    Close palette           Does not stop drawing.
  Control hand holds      Clear board              Hold about 1.2 seconds;
  over Clear                                       no second confirmation.
The classifier should not rely only on raw vertical landmark
comparisons. It should consider relative landmark positions and, where
useful, joint angles and normalized distances.
4. Non-functional requirements
  ID                      Category                Requirement
  NFR-01                  Performance             Target smooth real-time
interaction; aim for
approximately 30 FPS on
a capable test device.

  NFR-02                  Responsiveness          Keep the delay between
hand movement and
cursor response low.

  NFR-03                  Reliability             Handle denied camera
permission, unavailable
cameras, and tracking
loss.

  NFR-04                  Usability               Display clear
instructions and the
currently recognized
gesture.

  NFR-05                  Privacy                 Process camera frames
locally in the browser
for the MVP wherever
supported by the
selected
implementation.

  NFR-06                  Compatibility           Support modern browsers
that provide the
required camera,
Canvas, and WebAssembly
capabilities.

  NFR-07                  Maintainability         Separate camera,
vision, gesture,
canvas, and
presentation modules.

  NFR-08                  Testability             Keep gesture and canvas
logic testable without
requiring a live
webcam.
NFR-09                  Accessibility           Provide mouse or
keyboard alternatives
for essential controls
where practical.
Performance values are targets, not measured results.
5. Constraints and assumptions
- Users need a webcam and must grant permission.
- Camera access generally requires a secure context such as HTTPS or localhost.
- Hand-tracking quality depends on lighting, camera quality, distance, and hand visibility.
- The initial web application is intended to run primarily on the client.
- A backend is not required for the first MVP.
- The existing Python prototype is a reference implementation, not the
  web runtime.
6. Acceptance criteria for the MVP
The first web release should meet all of the following:
1. The application starts in a supported browser.
2. Camera permission is requested clearly.
3. The user can start and stop camera access.
4. A visible hand can be detected.
5. The index fingertip is mapped to the drawing surface.
6. A supported gesture starts drawing.
7. A supported gesture stops drawing.
8. Erasing removes previously drawn content.
9. Gesture changes are stabilized to reduce accidental switching.
10. Color and brush-size controls work.
11. Undo, redo, clear, and PNG export work.
12. Tracking loss does not leave a stroke unexpectedly active.
13. Camera errors are communicated to the user.
14. The repository includes setup instructions and testing documentation.
15. The drawing hand can keep drawing while the control hand operates a
    persistent palette anchored in the top-left corner.
16. Pointing highlights a tool; holding steady selects it after about 650 ms.
17. Holding on Clear for about 1.2 seconds clears the board in one action.
18. Setup lets the teacher identify the intended drawing hand; tracking loss
    preserves roles and requires a pause gesture followed by draw to resume.
