# AirBoard teacher presentation MVP

## Product goal

Let a teacher annotate a projected lesson with hand gestures while keeping
their attention on the class. The first release should make drawing, changing
tools, and recovering from mistakes understandable from across a room.

## In-class flow

1. The teacher opens a blank board and starts the camera after an explicit
   permission prompt.
2. A quick setup asks the teacher to raise the intended drawing hand and
   choose its detected left/right label. The other hand becomes the control
   hand; there is no practice step.
3. The drawing hand controls the canvas. An extended index finger draws;
   extending the index and middle fingers pauses drawing.
4. The control hand opens a tool palette anchored in the top-left corner.
   The palette remains open while the control hand is in use. The teacher
   points at a tool and holds steady until the cursor progress ring fills
   (about 650 ms) to select it while the drawing hand remains available.
5. Lowering the control hand closes the palette. Losing either hand must
   safely stop its active interaction without creating a connecting stroke.
6. The teacher can undo, clear with a longer point-and-hold action, and export
   the board as a PNG.

## MVP interaction requirements

- Support two simultaneously tracked hands, with separate drawing and control
  roles. Role assignment must be visible and recoverable if hands are lost.
- Keep the control palette fixed in the top-left corner while it is open. It
  must be large, high-contrast, and readable on a projected display.
- The initial palette contains pen color, brush size, eraser, undo, and clear.
- Selection requires pointing at a palette item and holding steady for about
  650 ms. Leaving the item resets progress. Hovering or passing over an item
  must not activate it.
- The current tool and color remain visibly indicated. Palette interaction must
  not interrupt drawing with the other hand.
- Holding on Clear for about 1.2 seconds clears the drawing in one action; no
  second confirmation is required.
- Provide keyboard and mouse alternatives for camera start/stop and essential
  recovery actions (Space toggles the camera, R reopens hand setup, and
  Escape closes the palette), even though gesture operation is the primary
  flow.
- Camera frames are processed locally in the browser for this MVP. The teacher
  can stop the camera at any time.
- When the drawing hand is temporarily lost, pause the stroke and keep the
  selected roles. After reacquisition, require the teacher to show the pause
  pose and then the draw pose before drawing resumes.

## Out of scope

Accounts, cloud saves, classroom sharing, multiple saved boards, presentation
file import, mobile-native apps, and custom gesture training are deferred.

## Acceptance criteria

1. A teacher can start and stop camera tracking and sees clear permission or
   device error messages.
2. The drawing hand can draw and pause without unintended lines during gesture
   transitions or tracking loss.
3. Raising the control hand opens the top-left palette; it stays open while
   that hand is being used and closes when lowered.
4. The teacher can select pen color, brush size, eraser, and undo with the
   control hand while continuing to draw with the other hand.
5. Clear activates after a deliberate 1.2-second hold on its palette item.
6. The palette remains anchored in its corner and legible at presentation
   distance.
7. The board can be exported as a PNG, and the exported image matches the
   visible drawing.
8. Camera processing remains local, and stopping the camera releases its
   stream and ends tracking.

Gesture thresholds, role assignment, and recognition reliability are
implementation questions to validate with teachers under realistic lighting
and camera placement. Performance goals are not measured results.
