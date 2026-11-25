import { useEffect, useMemo, useState } from "react";
import { useHandTracking } from "../hooks/useHandTracking";
import type { Handedness } from "../vision/gestureClassifier";
import WhiteboardCanvas from "./WhiteboardCanvas";

export default function CameraPreview() {
  const { videoRef, hands, status, error, start, stop } = useHandTracking();
  const [drawingHand, setDrawingHand] = useState<Handedness | null>(null);
  const [showGestureArea, setShowGestureArea] = useState(true);

  const mappedHands = useMemo(() => hands.map((hand) => {
    const left = 0.03;
    const right = 0.97;
    const top = 0.04;
    const bottom = 0.96;
    const { x, y } = hand.point;
    const active = x >= left && x <= right && y >= top && y <= bottom;
    return {
      ...hand,
      active,
      point: {
        x: Math.max(0, Math.min(1, (x - left) / (right - left))),
        y: Math.max(0, Math.min(1, (y - top) / (bottom - top))),
      },
    };
  }), [hands]);

  const detectedHandedness = useMemo(
    () => Array.from(new Set(hands.map((hand) => hand.handedness))),
    [hands],
  );
  const drawingHandData = mappedHands.find(
    (hand) => hand.handedness === drawingHand,
  ) ?? null;
  const controlHandData = mappedHands.find(
    (hand) => drawingHand !== null && hand.handedness !== drawingHand,
  ) ?? null;
  const drawingHandChosen = drawingHand !== null;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target !== document.body) return;
      if (event.code === "Space") {
        event.preventDefault();
        if (status === "running") stop();
        else if (status !== "starting") void start();
      } else if (event.key.toLowerCase() === "r" && drawingHandChosen) {
        event.preventDefault();
        setDrawingHand(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, start, stop, drawingHandChosen]);

  return (
    <main className="airboard-app">
      <header className="app-header">
        <a className="brand" href="#board" aria-label="AirBoard home">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>AirBoard</span>
        </a>
        <div className="header-actions">
          <span className={`camera-status camera-status--${status}`}>
            <span className="status-dot" />
            {status === "running" ? "Camera on" : status === "starting" ? "Starting camera" : "Camera off"}
          </span>
          {drawingHand && status === "running" && (
            <button className="button button--quiet" onClick={() => setDrawingHand(null)}>
              Change hand
            </button>
          )}
          {status === "running" ? (
            <button className="button button--quiet" onClick={stop}>Stop camera</button>
          ) : (
            <button className="button button--primary" onClick={start} disabled={status === "starting"}>
              {status === "starting" ? "Starting…" : "Start camera"}
            </button>
          )}
        </div>
      </header>

      <section className="board-shell" id="board" aria-label="AirBoard whiteboard">
        <WhiteboardCanvas
          drawingHand={drawingHandData}
          controlHand={controlHandData}
          cameraRunning={status === "running"}
        />

        <div className="camera-pip" aria-label="Mirrored camera preview with gesture area guide">
          <video ref={videoRef} autoPlay playsInline muted />
          {status !== "running" && <span>Camera preview</span>}
          {showGestureArea && (
            <>
              <div className="camera-guide-shade camera-guide-shade--top" />
              <div className="camera-guide-shade camera-guide-shade--right" />
              <div className="camera-guide-shade camera-guide-shade--bottom" />
              <div className="camera-guide-shade camera-guide-shade--left" />
              <div className="camera-active-area" aria-hidden="true" />
            </>
          )}
          <button
            className="camera-guide-toggle"
            type="button"
            aria-pressed={showGestureArea}
            onClick={() => setShowGestureArea((visible) => !visible)}
          >
            {showGestureArea ? "Hide guide" : "Show guide"}
          </button>
        </div>

        {status === "running" && !drawingHand && (
          <div className="setup-scrim">
            <div className="setup-card">
              <span className="eyebrow">QUICK SETUP</span>
              <h1>Choose your drawing hand</h1>
              <p>Raise the hand you want to draw with, then select the matching hand below. Your other hand will control the tool palette.</p>
              {detectedHandedness.length > 0 ? (
                <div className="hand-choice-list">
                  {detectedHandedness.map((hand) => (
                    <button
                      className="hand-choice"
                      key={hand}
                      onClick={() => setDrawingHand(hand)}
                    >
                      <span className="hand-choice-icon" aria-hidden="true">✋</span>
                      <span>Use {hand.toLowerCase()} hand to draw</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="setup-waiting"><span className="pulse-dot" />Show one hand to the camera</div>
              )}
              <p className="setup-note">You can change this later. Camera frames are processed in your browser.</p>
            </div>
          </div>
        )}
      </section>

      <footer className="app-footer">
        <span>Raise your control hand to open the palette</span>
        <span>•</span>
        <span>Index finger draws · two fingers pause</span>
        <span>Space camera · R hand setup · Esc close</span>
      </footer>

      {error && (
        <div className="error-toast" role="alert">
          <strong>Camera couldn’t start.</strong> {error}
        </div>
      )}
    </main>
  );
}
