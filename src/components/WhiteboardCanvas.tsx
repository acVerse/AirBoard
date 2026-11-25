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

  const smoothedPointerRef = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const previousGestureRef = useRef<GestureType>("UNKNOWN");

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

  const handDetected = Boolean(landmarks[8]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    canvas.width = 1200;
    canvas.height = 700;

    engineRef.current.render(canvas);
  }, []);

  // Pointer smoothing
  const smoothPointer = (
    x: number,
    y: number
  ): { x: number; y: number } => {
    const previous = smoothedPointerRef.current;

    if (!previous) {
      const initial = { x, y };
      smoothedPointerRef.current = initial;

      return initial;
    }

    const dx = x - previous.x;
    const dy = y - previous.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const DEAD_ZONE = 0.002;

    if (distance < DEAD_ZONE) {
      return previous;
    }

    const SMOOTHING_FACTOR = 0.25;

    const smoothed = {
      x: previous.x + dx * SMOOTHING_FACTOR,
      y: previous.y + dy * SMOOTHING_FACTOR,
    };

    smoothedPointerRef.current = smoothed;

    return smoothed;
  };

  // Draw pointer
  const drawPointer = (
    canvas: HTMLCanvasElement,
    x: number,
    y: number
  ) => {
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const pointerX = x * canvas.width;
    const pointerY = y * canvas.height;

    ctx.save();

    ctx.beginPath();
    ctx.arc(pointerX, pointerY, 12, 0, Math.PI * 2);

    ctx.fillStyle = "rgba(37, 99, 235, 0.15)";
    ctx.fill();

    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pointerX, pointerY, 3, 0, Math.PI * 2);

    ctx.fillStyle = "#2563EB";
    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(pointerX - 18, pointerY);
    ctx.lineTo(pointerX - 10, pointerY);

    ctx.moveTo(pointerX + 10, pointerY);
    ctx.lineTo(pointerX + 18, pointerY);

    ctx.moveTo(pointerX, pointerY - 18);
    ctx.lineTo(pointerX, pointerY - 10);

    ctx.moveTo(pointerX, pointerY + 10);
    ctx.lineTo(pointerX, pointerY + 18);

    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  };

  // Handle gesture interaction
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const indexTip = landmarks[8];

    // No hand detected
    if (!indexTip) {
      setDebugInfo("No hand detected | Waiting...");

      if (isDrawingRef.current) {
        engineRef.current.endStroke();
        isDrawingRef.current = false;
      }

      smoothedPointerRef.current = null;
      previousGestureRef.current = "UNKNOWN";

      engineRef.current.render(canvas);

      return;
    }

    let point = {
      x: 1 - indexTip.x,
      y: indexTip.y,
    };

    // Reset pointer when entering POINTER
    if (
      currentGesture === "POINTER" &&
      previousGestureRef.current !== "POINTER"
    ) {
      smoothedPointerRef.current = null;
    }

    // Smooth pointer movement
    if (currentGesture === "POINTER") {
      point = smoothPointer(point.x, point.y);
    }

    previousGestureRef.current = currentGesture;

    setDebugInfo(
      `Gesture: ${currentGesture} | X: ${point.x.toFixed(3)} | Y: ${point.y.toFixed(3)}`
    );

    // DRAW
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
    }

    // Stop drawing for other gestures
    else {
      if (isDrawingRef.current) {
        engineRef.current.endStroke();
        isDrawingRef.current = false;
      }
    }

    // Render strokes
    engineRef.current.render(canvas);

    // POINTER
    if (currentGesture === "POINTER") {
      drawPointer(canvas, point.x, point.y);
    }
  }, [
    landmarks,
    currentGesture,
    selectedTool,
    brush,
    eraser,
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (isDrawingRef.current) {
        engineRef.current.endStroke();
        isDrawingRef.current = false;
      }
    };
  }, []);

  // Undo
  const handleUndo = () => {
    if (isDrawingRef.current) {
      engineRef.current.endStroke();
      isDrawingRef.current = false;
    }

    engineRef.current.undo();

    const canvas = canvasRef.current;

    if (canvas) engineRef.current.render(canvas);
  };

  // Redo
  const handleRedo = () => {
    if (isDrawingRef.current) {
      engineRef.current.endStroke();
      isDrawingRef.current = false;
    }

    engineRef.current.redo();

    const canvas = canvasRef.current;

    if (canvas) engineRef.current.render(canvas);
  };

  // Clear
  const handleClear = () => {
    if (isDrawingRef.current) {
      engineRef.current.endStroke();
      isDrawingRef.current = false;
    }

    engineRef.current.clear();

    const canvas = canvasRef.current;

    if (canvas) engineRef.current.render(canvas);
  };

  // Gesture visual configuration
  const gestureConfig: Record<
    GestureType,
    { color: string; background: string; message: string }
  > = {
    DRAW: {
      color: "#15803D",
      background: "#DCFCE7",
      message: "Drawing with your fingertip",
    },

    POINTER: {
      color: "#1D4ED8",
      background: "#DBEAFE",
      message: "Moving pointer",
    },

    PAUSE: {
      color: "#B45309",
      background: "#FEF3C7",
      message: "Drawing paused",
    },

    IDLE: {
      color: "#475569",
      background: "#E2E8F0",
      message: "Standing by",
    },

    UNKNOWN: {
      color: "#B91C1C",
      background: "#FEE2E2",
      message: "Waiting for a valid gesture",
    },
  };

  const activeGesture = gestureConfig[currentGesture];

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>AirBoard Whiteboard</h2>

        <div
          style={{
            ...styles.statusBadge,
            color: activeGesture.color,
            backgroundColor: activeGesture.background,
          }}
        >
          <span
            style={{
              ...styles.statusDot,
              backgroundColor: activeGesture.color,
            }}
          />

          {currentGesture}
        </div>
      </div>

      {/* Gesture feedback */}
      <div style={styles.feedback}>
        <div>
          <strong>{activeGesture.message}</strong>

          <p style={styles.feedbackSubtext}>
            {handDetected
              ? "Hand detected successfully"
              : "Position your hand in front of the camera"}
          </p>
        </div>

        <span
          style={{
            ...styles.handIndicator,
            color: handDetected ? "#15803D" : "#DC2626",
          }}
        >
          ● {handDetected ? "HAND DETECTED" : "NO HAND"}
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

        <div style={styles.controlGroup}>
          <label>Color</label>

          <input
            type="color"
            value={selectedColor}
            onChange={(e) =>
              setSelectedColor(e.target.value)
            }
            disabled={selectedTool === "eraser"}
          />
        </div>

        <div style={styles.controlGroup}>
          <label>Size: {brushSize}px</label>

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

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={styles.canvas}
      />

      {/* Instructions */}
      <div style={styles.instructions}>
        <span>✋ DRAW — Draw on the canvas</span>
        <span>☝️ POINTER — Move the cursor</span>
        <span>✊ PAUSE — Stop drawing</span>
      </div>

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
    flexWrap: "wrap",
    gap: "12px",
  },

  title: {
    margin: 0,
    fontSize: "22px",
  },

  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
    transition: "all 0.2s ease",
  },

  statusDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
  },

  feedback: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    padding: "14px",
    marginTop: "15px",
    backgroundColor: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
  },

  feedbackSubtext: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#64748B",
  },

  handIndicator: {
    fontSize: "11px",
    fontWeight: "bold",
  },

  debug: {
    fontSize: "12px",
    color: "#64748B",
    margin: "10px 0",
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

  instructions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    padding: "12px 4px",
    fontSize: "12px",
    color: "#64748B",
  },
};