import { useEffect, useRef, useState } from "react";

import { DrawingEngine } from "../whiteboard/drawingEngine";
import { createBrush, DEFAULT_BRUSH } from "../whiteboard/brush";

import type { HandPoint } from "../vision/landmarkProcessor";
import type { GestureType } from "../vision/gestureClassifier";

interface WhiteboardCanvasProps {
  landmarks: HandPoint[];
  currentGesture: GestureType;
}

export default function WhiteboardCanvas({
  landmarks,
  currentGesture,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef(new DrawingEngine());
  const isDrawingRef = useRef(false);

  const [debugInfo, setDebugInfo] = useState("Waiting for hand...");
  const brush = createBrush(DEFAULT_BRUSH);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1200;
    canvas.height = 700;

    engineRef.current.render(canvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const indexTip = landmarks[8];

    if (!indexTip) {
      setDebugInfo(`Gesture: ${currentGesture} | No fingertip detected`);

      if (isDrawingRef.current) {
        engineRef.current.endStroke();
        isDrawingRef.current = false;
      }
    } else {
      const point = {
        x: 1 - indexTip.x,
        y: indexTip.y,
      };

      setDebugInfo(
        `Gesture: ${currentGesture} | Landmarks: ${landmarks.length} | X: ${point.x.toFixed(3)} | Y: ${point.y.toFixed(3)}`
      );

      if (currentGesture === "DRAW") {
        if (!isDrawingRef.current) {
          engineRef.current.startStroke(point, brush, "brush");
          isDrawingRef.current = true;
        } else {
          engineRef.current.addPoint(point);
        }
      } else if (isDrawingRef.current) {
        engineRef.current.endStroke();
        isDrawingRef.current = false;
      }
    }

    engineRef.current.render(canvas);
  }, [landmarks, currentGesture]);

  useEffect(() => {
    return () => {
      if (isDrawingRef.current) {
        engineRef.current.endStroke();
      }
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>AirBoard Whiteboard</h2>
        <span>Mode: {currentGesture}</span>
      </div>

      <p style={styles.debug}>{debugInfo}</p>

      <canvas
        ref={canvasRef}
        style={styles.canvas}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    marginTop: "30px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  debug: {
    fontSize: "13px",
    color: "#2563EB",
    margin: "8px 0",
  },
  canvas: {
    display: "block",
    width: "100%",
    aspectRatio: "12 / 7",
    backgroundColor: "#FFFFFF",
    border: "2px solid #CBD5E1",
    borderRadius: "12px",
    marginTop: "12px",
  },
};