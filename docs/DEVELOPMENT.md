AirBoard --- Development Guide
1. Development stages
AirBoard has two development stages:
1. Python prototype: The existing local webcam and drawing
   implementation.
2. Web application: The planned React and TypeScript
   implementation.
Keep these stages distinguishable in the repository and in project
updates.
2. Python prototype setup
Run these commands from the directory containing air_writing.py.
Create a virtual environment
Windows PowerShell:
py -m venv venv
.\venv\Scripts\Activate.ps1
If PowerShell blocks activation in the current session:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
Windows Command Prompt:
py -m venv venv
venv\Scripts\activate.bat
macOS / Linux:
python3 -m venv venv
source venv/bin/activate
Install dependencies
python -m pip install --upgrade pip
python -m pip install mediapipe opencv-contrib-python numpy
Use a Python version supported by the selected MediaPipe release.
Run the scripts
python air_writing.py
python hand_detection.py
python main.py
The hand-tracking scripts expect the model file at
models/hand_landmarker.task.
3. Planned web application setup
The web project will use React, TypeScript, and Vite. These commands
become available after the web application foundation and package.json
are committed.
npm install
npm run dev
For a production build:
npm run build
To preview the production build locally:
npm run preview
The exact scripts will be defined in package.json when the web project
is initialized.
4. Suggested implementation order
1. Initialize the React + TypeScript + Vite application.
2. Add and verify MediaPipe Tasks Vision.
3. Implement camera lifecycle management.
4. Display hand landmarks.
5. Map fingertip coordinates to the canvas.
6. Implement feature extraction and gesture classification.
7. Add gesture state management and stabilization.
8. Implement drawing and erasing.
9. Add toolbar controls and history.
10. Add export and error handling.
11. Test and document the release.
5. Development workflow
For each feature:
1. Identify the requirement it satisfies.
2. Decide which module owns the behavior.
3. Implement the smallest useful change.
4. Add or update tests.
5. Run the application and verify the behavior.
6. Document limitations or decisions.
7. Commit the change with a descriptive message.
6. Repository hygiene
Do not commit:
- venv/ or .venv/
- node_modules/
- dist/
- .env files containing secrets
- Editor caches
- Temporary recordings or personal webcam footage
- Operating-system cache files
The model asset is required by the current prototype. Check the model's
source and applicable license or terms before redistributing it in a
public repository. If redistribution is not permitted, document how to
obtain it instead of committing it.
7. Troubleshooting
Python cannot find the model
Run the script from the project root and verify that
models/hand_landmarker.task exists.
Python cannot open the webcam
Close other camera applications and check operating-system camera
permissions. The current scripts use camera index 0.
Browser cannot access the webcam
Use localhost during development or deploy through HTTPS. Check
browser permission settings and confirm that another application is not
holding the camera.
MediaPipe model fails to load in the browser
Verify the model URL, file availability, browser console errors, and the
MediaPipe Tasks Vision package configuration.
Drawing is offset from the fingertip
Check mirrored video handling, video dimensions, canvas dimensions, CSS
scaling, and device pixel ratio. Coordinate mapping must use the
rendered canvas size consistently.