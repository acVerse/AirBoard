Contributing to AirBoard
Thank you for your interest in AirBoard.

AirBoard is currently developed as an individual portfolio project.
These guidelines describe the development conventions used to keep the
code understandable, testable, and maintainable. They can also guide
future collaborators if the project becomes open to contributions.
Development principles
- Keep the first release focused on a reliable gesture-controlled whiteboard.
- Prefer small, understandable modules over unnecessary abstractions.
- Keep camera capture, landmark processing, gesture interpretation, canvas rendering, and interface code separate.
- Do not describe planned functionality as implemented.
- Document important technical decisions and known limitations.
- Avoid committing secrets, personal data, virtual environments, or generated build output.
Before making a change
1. Read the project [overview](docs/PROJECT_OVERVIEW.md).
2. Check the [requirements](docs/REQUIREMENTS.md) and
   [roadmap](docs/ROADMAP.md).
3. Identify which module should own the change.
4. Keep the change focused and test it before integrating it.
Code conventions
TypeScript and React (planned web application)
- Use TypeScript types for landmarks, gestures, drawing tools, and
  application state.
- Use descriptive names for functions, variables, and components.
- Keep React components focused on presentation and user interaction.
- Keep gesture classification independent from canvas rendering.
- Avoid doing expensive hand-tracking work inside unrelated React
  render cycles.
- Clean up camera streams, animation frames, and event listeners when
  components unmount.
Python prototype
- Preserve the existing prototype as a reference while the web version
  is developed.
- Keep model paths and runtime assumptions documented.
- Release camera and MediaPipe resources when the application exits.
- Avoid committing the local venv directory.
Testing expectations
- Test gesture rules with representative landmark inputs.
- Test state transitions, including hand-loss behavior.
- Test canvas operations independently from webcam tracking.
- Test camera permission denial and camera disconnection.
- Record actual performance measurements rather than estimating them.
See [TESTING.md](docs/TESTING.md) for the testing strategy.
Commit messages
Use short, descriptive commit messages. Suggested prefixes:
- docs: documentation changes
- feat: new functionality
- fix: bug fixes
- refactor: internal restructuring
- test: tests
- chore: tooling or maintenance
Examples:
docs: add project architecture
feat: add browser camera initialization
feat: implement fingertip cursor
fix: reset drawing state when hand is lost
test: add gesture classifier tests
Pull requests
If pull requests are enabled:
1. Explain the problem or motivation.
2. Describe the change.
3. Include test steps and results.
4. Add screenshots or a short recording for visible UI changes.
5. List known limitations.
Scope control
Features such as cloud synchronization, accounts, multiplayer collaboration, AI image generation, and trained gesture models are not part of the initial MVP. Propose them as future work rather than allowing them to delay the core application.