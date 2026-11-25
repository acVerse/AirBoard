import { useEffect, useMemo, useRef, useState } from "react";

import { DrawingEngine } from "../whiteboard/drawingEngine";
import { createBrush, DEFAULT_BRUSH } from "../whiteboard/brush";
import { createEraser } from "../whiteboard/eraser";

import type { HandPoint } from "../vision/landmarkProcessor";
import type { GestureType } from "../vision/gestureClassifier";

type DrawingTool = "brush" | "eraser";

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

  const [selectedColor, setSelectedColor] = useState(
    DEFAULT_BRUSH.color
  );

  const [brushSize, setBrushSize] = useState(
    DEFAULT_BRUSH.size
  );

  const [selectedTool, setSelectedTool] =
    useState<DrawingTool>("brush");

  const brush = useMemo(
    () =>
      createBrush({
        color: selectedColor,
        size: brushSize,
        opacity: 1,
      }),
    [selectedColor, brushSize]
  );

  const eraser = useMemo(
    () => createEraser(25),
    []
  );

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1200;
    canvas.height = 700;

    engineRef.current.render(canvas);
  }, []);

  // Handle drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const indexTip = landmarks[8];

    if (!indexTip) {
      setDebugInfo(
        `Gesture: ${currentGesture} | No fingertip detected`
      );

      if (isDrawingRef.current) {
        engineRef.current.endStroke();
        isDrawingRef.current = false;
      }

      engineRef.current.render(canvas);
      return;
    }

    const point = {
      x: 1 - indexTip.x,
      y: indexTip.y,
    };

    setDebugInfo(
      `Gesture: ${currentGesture} | X: ${point.x.toFixed(3)} | Y: ${point.y.toFixed(3)}`
    );

    if (currentGesture === "DRAW") {
      if (!isDrawingRef.current) {
        const settings =
          selectedTool === "eraser" ? eraser : brush;

        engineRef.current.startStroke(
          point,
          settings,
          selectedTool
        );

        isDrawingRef.current = true;
      } else {
        engineRef.current.addPoint(point);
      }
    } else if (isDrawingRef.current) {
      engineRef.current.endStroke();
      isDrawingRef.current = false;
    }

    engineRef.current.render(canvas);
  }, [landmarks, currentGesture, selectedTool, brush, eraser]);

  // Stop active drawing when component unmounts
  useEffect(() => {
    return () => {
      if (isDrawingRef.current) {
        engineRef.current.endStroke();
      }
    };
  }, []);

  // Undo
  const handleUndo = () => {
    isDrawingRef.current = false;

    engineRef.current.undo();

    const canvas = canvasRef.current;
    if (canvas) engineRef.current.render(canvas);
  };

  // Redo
  const handleRedo = () => {
    isDrawingRef.current = false;

    engineRef.current.redo();

    const canvas = canvasRef.current;
    if (canvas) engineRef.current.render(canvas);
  };

  // Clear canvas
  const handleClear = () => {
    isDrawingRef.current = false;

    engineRef.current.clear();

    const canvas = canvasRef.current;
    if (canvas) engineRef.current.render(canvas);
  };

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h2>AirBoard Whiteboard</h2>

        <span style={styles.gesture}>
          Mode: {currentGesture}
        </span>
      </div>

      <p style={styles.debug}>{debugInfo}</p>

      {/* Toolbar */}
      <div style={styles.toolbar}>

        <div style={styles.toolGroup}>
          <button
            style={{
              ...styles.toolButton,
              ...(selectedTool === "brush"
                ? styles.activeButton
                : {}),
            }}
            onClick={() => setSelectedTool("brush")}
          >
            Brush
          </button>

          <button
            style={{
              ...styles.toolButton,
              ...(selectedTool === "eraser"
                ? styles.activeButton
                : {}),
            }}
            onClick={() => setSelectedTool("eraser")}
          >
            Eraser
          </button>
        </div>

        {/* Color picker */}
        <div style={styles.controlGroup}>
          <label>Color</label>

          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            disabled={selectedTool === "eraser"}
          />
        </div>

        {/* Brush size */}
        <div style={styles.controlGroup}>
          <label>
            Size: {brushSize}px
          </label>

          <input
            type="range"
            min="1"
            max="30"
            value={brushSize}
            onChange={(e) =>
              setBrushSize(Number(e.target.value))
            }
          />
        </div>

        {/* History controls */}
        <div style={styles.toolGroup}>
          <button
            style={styles.actionButton}
            onClick={handleUndo}
            disabled={!engineRef.current.canUndo()}
          >
            Undo
          </button>

          <button
            style={styles.actionButton}
            onClick={handleRedo}
            disabled={!engineRef.current.canRedo()}
          >
            Redo
          </button>

          <button
            style={styles.clearButton}
            onClick={handleClear}
          >
            Clear
          </button>
        </div>

      </div>

      {/* Whiteboard */}
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

  gesture: {
    fontWeight: "bold",
    color: "#2563EB",
  },

  debug: {
    fontSize: "13px",
    color: "#64748B",
    margin: "8px 0",
  },

  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "18px",
    padding: "15px",
    backgroundColor: "#F1F5F9",
    borderRadius: "10px",
    marginBottom: "12px",
  },

  toolGroup: {
    display: "flex",
    gap: "8px",
  },

  controlGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    fontSize: "13px",
  },

  toolButton: {
    padding: "9px 15px",
    border: "1px solid #CBD5E1",
    borderRadius: "6px",
    backgroundColor: "white",
    cursor: "pointer",
  },

  activeButton: {
    backgroundColor: "#2563EB",
    color: "white",
    border: "1px solid #2563EB",
  },

  actionButton: {
    padding: "9px 13px",
    border: "1px solid #CBD5E1",
    borderRadius: "6px",
    backgroundColor: "white",
    cursor: "pointer",
  },

  clearButton: {
    padding: "9px 13px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#DC2626",
    color: "white",
    cursor: "pointer",
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