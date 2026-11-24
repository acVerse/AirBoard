AirBoard --- Project Overview
1. Summary
AirBoard is a planned browser-based, gesture-controlled virtual
whiteboard. It explores touchless human-computer interaction by
interpreting hand movements captured through a webcam and mapping them to digital actions.

The project began as a local Python computer-vision prototype. The next development stage is a browser application that retains the core interaction idea while introducing a more complete product experience.
2. Problem and opportunity
Many digital whiteboards rely on a mouse, trackpad, touchscreen, or stylus. AirBoard explores an alternative interaction method: using a webcam and hand gestures to control a digital canvas.

This is an exploration and product hypothesis, not a validated claim that existing tools are inaccessible or inadequate. User feedback will be needed to determine which use cases provide real value.
3. Vision
Build a practical, responsive web application in which users can draw, erase, and control a whiteboard using natural hand movements.

The longer-term vision is an intelligent interaction platform that can support additional gesture-driven tools and workflows.
4. Goals
Product goals
- Provide a usable browser-based whiteboard.
- Allow users to interact with the canvas without touching it.
- Give clear feedback about camera and gesture states.
- Support common whiteboard operations.
- Keep the initial experience simple and understandable.
Engineering goals
- Implement real-time hand tracking.
- Separate landmark detection from gesture interpretation.
- Build a testable gesture state machine.
- Implement a reliable canvas engine.
- Measure gesture accuracy, latency, and tracking performance.
- Document architecture, trade-offs, limitations, and results.
Portfolio goals
- Demonstrate computer-vision integration.
- Demonstrate software architecture and modular development.
- Demonstrate algorithmic thinking through gesture interpretation.
- Demonstrate testing and evidence-based evaluation.
- Maintain a clear record of progress from prototype to web
  application.
5. Intended users and use cases
Potential users include students, teachers, presenters, designers, and people interested in touchless interaction.

Possible use cases:
- Sketching ideas during brainstorming.
- Writing or annotating concepts during a presentation.
- Demonstrating simple diagrams.
- Practicing gesture-based interaction.
- Exploring alternative input methods.
These use cases should be validated with informal usability testing
before making strong claims about user impact.
6. Product scope
Initial MVP
- Browser camera access with explicit permission.
- Hand landmark detection.
- Fingertip tracking.
- A small set of stable gestures.
- Drawing and erasing.
- Gesture status feedback.
- Color and brush-size selection.
- Undo and redo.
- Clear canvas and export to PNG.
- Graceful handling of camera and tracking errors.
Out of scope for the initial MVP
- User accounts and authentication.
- Cloud storage and synchronization.
- Multiplayer collaboration.
- AI-generated drawings.
- Mobile-native applications.
- Deep-learning gesture classification.
- Complex presentation and document editing.
These may be reconsidered after the MVP is complete and evaluated.
7. Product principles
1. Reliability before feature count. A small set of gestures should work consistently.
2. Clarity before complexity. Users should understand the active gesture and tool.
3. Privacy by design. Prefer local browser processing for the MVP and disclose any future data transmission.
4. Modularity. Vision, gesture, canvas, and interface responsibilities should remain separate.
5. Evidence over claims. Report measured performance and known limitations honestly.
8. Success criteria
The MVP will be considered successful when a user can:
- Open the application in a supported browser.
- Grant camera access.
- See a detected hand and tracked fingertip.
- Draw and erase using supported gestures.
- Use basic whiteboard controls.
- Export a drawing.
- Recover gracefully from loss of hand tracking or camera access.
Technical quality will be evaluated using the metrics in [TESTING.md](TESTING.md).
9. Current status
Implemented in the Python prototype
- OpenCV webcam capture.
- MediaPipe Tasks hand landmark detection.
- Index fingertip coordinate tracking.
- Basic finger-position gesture rules.
- Coordinate smoothing.
- Drawing and erasing on an OpenCV canvas.
- Keyboard controls.
Planned for the web application
- React and TypeScript interface.
- Browser camera manager.
- MediaPipe Tasks Vision integration.
- Gesture feature extraction and classification.
- Gesture state machine and stabilization.
- HTML Canvas drawing engine.
- Whiteboard controls and export.
The planned items are not complete until implemented and tested.