# AirBoard

AirBoard is a gesture-controlled whiteboard for teachers presenting lessons.
The browser app uses a webcam and MediaPipe hand tracking to draw on a digital
board. Camera frames are processed locally in the browser.

The current MVP workflow supports one drawing hand and one control hand. Read
the [teacher MVP spec](docs/TEACHER_MVP.md) for the product decisions and
acceptance criteria.

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL in a modern browser and grant camera access. Camera
access requires localhost or another secure context.

## Use the board

1. Start the camera, raise the hand you want to draw with, then choose its
   detected left/right label in setup.
2. Draw with one extended index finger. Extend the index and middle fingers
   to pause.
3. Raise the other hand with an open palm to show the fixed top-left palette.
   Point at an item and hold steady until the cursor ring fills to select it
   while the drawing hand keeps working. Lower the control hand to close the
   palette. Clear takes a longer hold.
4. If the drawing hand leaves the camera view, show the pause pose and then
   the draw pose after it returns.
5. Export the board as a PNG from the board controls.

Mouse controls provide a fallback for palette and camera actions. With the
page body focused, Space toggles the camera, R reopens hand setup, and Escape
closes the palette.

## Project docs

- [Teacher MVP interaction spec](docs/TEACHER_MVP.md)
- [Requirements](docs/REQUIREMENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Development guide](docs/DEVELOPMENT.md)
- [Testing strategy](docs/TESTING.md)
- [Roadmap](docs/ROADMAP.md)
