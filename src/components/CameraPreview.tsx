import WhiteboardCanvas from "./WhiteboardCanvas";
import { useHandTracking } from "../hooks/useHandTracking";
import type { GestureType } from "../vision/gestureClassifier";

export default function CameraPreview() {
  const {
    videoRef,
    canvasRef,
    landmarks,
    status,
    error,
    start,
    stop,
    currentGesture,
  } = useHandTracking();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>AirBoard Hand Tracking</h2>

        <span>
          Status: {status.toUpperCase()}
        </span>
      </div>

      <div style={styles.cameraContainer}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={styles.video}
        />

        <canvas
          ref={canvasRef}
          style={styles.canvas}
        />

        {status === "idle" && (
          <div style={styles.overlay}>
            Camera is currently inactive
          </div>
        )}

        {status === "starting" && (
          <div style={styles.overlay}>
            Initializing camera and hand tracking...
          </div>
        )}
      </div>

      <div style={styles.controls}>
        <button
          onClick={start}
          disabled={status === "starting" || status === "running"}
        >
          Start Tracking
        </button>

        <button
          onClick={stop}
          disabled={status !== "running"}
        >
          Stop Tracking
        </button>
      </div>

      <div style={styles.info}>
        <p>Detected Gesture: <strong>{currentGesture}</strong></p>
        <p>Detected landmarks: {landmarks.length}/21</p>

        {landmarks.length > 0 && (
          <p>
            Index fingertip: X: {landmarks[8].x.toFixed(3)}
            {" | "}
            Y: {landmarks[8].y.toFixed(3)}
          </p>
        )}
        <WhiteboardCanvas landmarks={landmarks}
            currentGesture={currentGesture as GestureType}/>

        {error && (
          <p style={{ color: "red" }}>
            Error: {error}
          </p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1000px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cameraContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 9",
    backgroundColor: "#111",
    overflow: "hidden",
    borderRadius: "12px",
    marginTop: "20px",
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: "scaleX(-1)",
  },

  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    transform: "scaleX(-1)",
    pointerEvents: "none",
  },

  overlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "white",
    textAlign: "center",
  },

  controls: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },

  info: {
    marginTop: "20px",
    fontSize: "14px",
  },
};