AirBoard
An intelligent, gesture-based virtual whiteboard powered by computer
vision.

AirBoard is a personal portfolio project exploring touchless
human-computer interaction. The long-term goal is to let people draw,
erase, select tools, and navigate a digital whiteboard using natural
hand movements captured by a webcam.
Project status: Early prototype / web application planned. The
current working implementation is a local Python application. The
browser-based React application described in this repository
documentation is the planned next development stage, not a completed
feature.

Vision
AirBoard aims to turn hand movements into useful digital interactions.
It starts with a virtual whiteboard and uses that focused application to
explore real-time hand tracking, gesture interpretation, interaction
design, and software engineering.

The project has three goals:
1. Build a usable browser-based whiteboard.
2. Explore intelligent interaction through computer vision and gesture
   recognition.
3. Document engineering decisions, testing, limitations, and
   development progress as a portfolio project.
Current prototype
The existing Python prototype includes:
- Webcam capture with OpenCV.
- Hand landmark detection using MediaPipe Tasks.
- Tracking of the index fingertip.
- Basic finger-position gesture rules.
- Coordinate smoothing.
- Drawing on an OpenCV canvas.
- Gesture-based and keyboard-controlled erasing.
- Keyboard controls for clearing the canvas and exiting.
The prototype currently uses one detected hand and a local webcam. Its
gesture rules are an initial implementation and may be affected by hand
orientation, camera angle, lighting, and tracking quality.
Planned web application
The next major milestone is to migrate the interaction experience to the
browser using:
- React and TypeScript for the application interface.
- Vite for local development and production builds.
- MediaPipe Tasks Vision for browser-based hand landmark detection.
- The HTML Canvas API for drawing and rendering.
- Browser APIs for camera access and local file export.
The initial web version is planned to process camera frames locally in
the browser. A backend is not required for the first MVP. Persistent
cloud projects, accounts, and synchronization are outside the initial
scope.

See [Project Overview](docs/PROJECT_OVERVIEW.md),
[Requirements](docs/REQUIREMENTS.md),
[Architecture](docs/ARCHITECTURE.md), and [Roadmap](docs/ROADMAP.md).
Repository structure
The structure below is the intended direction for the project. The
current Python prototype files may remain at the repository root until
the web migration is underway.
AirBoard/
├── README.md
├── CONTRIBUTING.md
├── docs/
│   ├── PROJECT_OVERVIEW.md
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── TESTING.md
│   └── DEVELOPMENT.md
├── models/
│   └── hand_landmarker.task
├── air_writing.py
├── hand_detection.py
└── main.py
As the web application is introduced, the source structure will evolve.
The proposed web architecture is documented in
[ARCHITECTURE.md](docs/ARCHITECTURE.md).
Run the current Python prototype
These commands apply to the existing Python version, not the planned web
application.
1. Clone the repository
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd AirBoard
Replace <YOUR_GITHUB_REPOSITORY_URL> with your actual GitHub
repository URL.
2. Create and activate a virtual environment
Windows PowerShell:
py -m venv venv
.\venv\Scripts\Activate.ps1
If PowerShell blocks activation for the current terminal session:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
Windows Command Prompt:
py -m venv venv
venv\Scripts\activate.bat
macOS / Linux:
python3 -m venv venv
source venv/bin/activate
3. Install Python dependencies
python -m pip install --upgrade pip
python -m pip install mediapipe opencv-contrib-python numpy
Use a Python version supported by the installed MediaPipe release. If
installation fails, check the MediaPipe package's current Python-version
compatibility before changing your environment.
4. Check the model file
The hand-tracking scripts expect the model at:
models/hand_landmarker.task
Keep this file in the models directory, or update the model path in
the scripts if you move it.
5. Run the application
Main air-writing prototype:
python air_writing.py
Hand-tracking test:
python hand_detection.py
Webcam-only test:
python main.py
Current prototype controls
  Action                    Control
  Draw                      Raise the index finger while keeping the middle finger down
Stop drawing              Raise the index and middle fingers
Gesture eraser            Raise the index, middle, and ring fingers
Enable keyboard eraser    Press E
Disable keyboard eraser   Press D
Clear canvas              Press C
Exit                      Press Q

The OpenCV window must be active for keyboard controls to respond.
Planned web application setup
The browser application has not yet been implemented. Once its
package.json and Vite configuration have been added, the intended
development commands will be:
npm install
npm run dev
Production build and preview commands are planned as:
npm run build
npm run preview
These commands are a target workflow; they will become runnable after
the web application foundation is committed.
Privacy
The planned browser MVP is designed to process webcam frames locally in
the user's browser. The application should request camera permission
explicitly and provide a clear way to stop the camera.

Do not claim that data is never transmitted until the implementation and
its dependencies have been reviewed. Any future network or storage
features must be documented transparently.
Documentation
- [Project overview](docs/PROJECT_OVERVIEW.md)
- [Requirements](docs/REQUIREMENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Testing strategy](docs/TESTING.md)
- [Development guide](docs/DEVELOPMENT.md)
- [Contribution guidelines](CONTRIBUTING.md)
Project status
AirBoard is under active personal development. Features in the roadmap
are proposals until implemented and tested. Performance targets and
evaluation metrics are goals, not measured results.
License
No license has been selected yet. Until a license is added, all rights
are reserved by the copyright holder. Do not assume that the source code
may be reused, modified, or redistributed.