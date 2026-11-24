AirBoard --- Testing Strategy
1. Purpose
Testing should establish whether AirBoard behaves reliably, not merely
whether the application launches.

The testing strategy covers gesture classification, state transitions,
canvas operations, camera handling, browser integration, and
performance.
2. Testing levels
Unit tests
Test individual functions without a live webcam.

Examples:
- Landmark coordinate mapping.
- Finger feature extraction.
- Gesture classification.
- Gesture state transitions.
- Coordinate smoothing.
- Canvas history operations.
- Export helper behavior.
Integration tests
Test connected modules.

Examples:
- Camera frames are passed to the hand tracker.
- Landmark results are passed to the gesture classifier.
- Confirmed gestures trigger the correct canvas command.
- Camera stop releases the stream and stops active interaction.
Manual tests
Test behavior that depends on physical hardware and real-world
conditions.

Examples:
- Camera permission granted or denied.
- Different lighting levels.
- Different hand distances.
- Different hand orientations.
- Temporary hand occlusion.
- Camera disconnection.
- Browser resizing.
3. Gesture test matrix
Create a set of representative samples for each supported gesture.
  Test case               Input condition         Expected result
  G-01                    Index finger extended,  Draw candidate
other fingers folded    

  G-02                    Index and middle        Pause candidate
fingers extended        

  G-03                    Three selected fingers  Erase candidate
extended                

  G-04                    Open palm               Select candidate, if
enabled

  G-05                    Closed fist             Stop candidate, if
enabled

  G-06                    Hand rotated            Classification remains
stable or safely
returns unknown

  G-07                    Hand partially occluded No unintended drawing

  G-08                    No hand detected        Active interaction
resets to idle

  G-09                    Gesture changes briefly No unintended mode
for one frame           switch
G-10                    Gesture remains stable  State changes to the
for the configured      confirmed gesture
confirmation period
The final gesture definitions and test samples should be adjusted based
on actual observations.
4. Canvas test matrix
  Test case               Action                  Expected result
  C-01                    Draw a stroke           Stroke appears at the
expected position

  C-02                    Change brush color      New strokes use the
selected color

  C-03                    Change brush thickness  New strokes use the
selected thickness

  C-04                    Erase a stroke          Target content is
removed

  C-05                    Undo                    Last supported action
is reversed

  C-06                    Redo                    Undone action is
restored

  C-07                    Clear canvas            Canvas becomes empty

  C-08                    Export PNG              Downloaded image
contains the drawing
C-09                    Resize the viewport     Canvas mapping remains
aligned
5. Camera and browser tests
  Test case               Scenario                Expected behavior
  CAM-01                  Permission granted      Camera starts

  CAM-02                  Permission denied       Helpful error message
appears

  CAM-03                  No camera available     Application remains
usable without tracking

  CAM-04                  Camera stopped by user  Stream is released and
drawing stops

  CAM-05                  Camera disconnected     Tracking stops safely
and status updates
CAM-06                  Page/component unmount  Camera and animation
resources are cleaned
up
6. Evaluation metrics
Record actual measurements and include the test environment.
Gesture accuracy
For a labeled test set:

Accuracy = Correct classifications / Total labeled samples × 100

Also record per-gesture results. Overall accuracy can hide poor
performance for a particular gesture.
False activation rate
Count unintended gesture activations during a defined observation
period. Record the number of minutes or interaction attempts so results
can be compared fairly.
Recognition latency
Measure the time between the beginning of a stable gesture and the
moment the application confirms it.
Tracking frame rate
Record the number of processed frames per second on the test device.
Distinguish camera frame rate from inference frame rate if they differ.
Cursor response latency
Measure the delay between fingertip movement and visible cursor or
stroke response. State how the measurement was collected.
Drawing continuity
Test whether the rendered path follows the intended fingertip movement
without unexpected gaps, jumps, or connecting lines after tracking loss.
7. Test record template
For each evaluation run, record:
- Date:
- Application version / commit:
- Operating system:
- Browser and version:
- Camera:
- Lighting conditions:
- Approximate hand distance:
- Number of gesture samples:
- Correct classifications:
- Incorrect classifications:
- False activations:
- Average recognition latency:
- Average processed FPS:
- Known issues:
8. Reporting results
Do not publish performance claims without measurements. Include
limitations, sample size, and test conditions. A small test set is
useful for development but does not establish universal accuracy.
9. Current testing status
The web application testing suite is planned and should be added
alongside implementation. The Python prototype has been run as a working
project, but this document does not claim that the proposed web tests
have already passed.