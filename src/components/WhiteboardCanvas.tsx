import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { TrackedHand } from "../hooks/useHandTracking";
import { createBrush, DEFAULT_BRUSH } from "../whiteboard/brush";
import { createEraser } from "../whiteboard/eraser";
import { DrawingEngine } from "../whiteboard/drawingEngine";

type DrawingTool = "brush" | "eraser";

interface WhiteboardCanvasProps {
  drawingHand: TrackedHand | null;
  controlHand: TrackedHand | null;
  cameraRunning: boolean;
}

const COLORS = ["#17211C", "#2563EB", "#E24735", "#12966A", "#8B5CF6"];
const SIZES = [5, 10, 16];

export default function WhiteboardCanvas({
  drawingHand,
  controlHand,
  cameraRunning,
}: WhiteboardCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef(new DrawingEngine());
  const isDrawingRef = useRef(false);
  const requiresRearmRef = useRef(false);
  const hoverTargetRef = useRef<HTMLElement | null>(null);
  const dwellTargetRef = useRef<HTMLElement | null>(null);
  const activatedTargetRef = useRef<HTMLElement | null>(null);
  const dwellStartedAtRef = useRef(0);
  const lastProgressStepRef = useRef(-1);
  const closePaletteTimerRef = useRef<number | null>(null);

  const [selectedColor, setSelectedColor] = useState(DEFAULT_BRUSH.color);
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH.size);
  const [selectedTool, setSelectedTool] = useState<DrawingTool>("brush");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [trackingMessage, setTrackingMessage] = useState("Start the camera to begin");

  const brush = useMemo(
    () => createBrush({ color: selectedColor, size: brushSize, opacity: 1 }),
    [selectedColor, brushSize],
  );
  const eraser = useMemo(() => createEraser(Math.max(28, brushSize * 3)), [brushSize]);
  const controlGesture = controlHand?.gesture ?? null;
  const controlHandLowered = Boolean(
    controlHand && (controlHand.landmarks[0]?.y ?? 0) > 0.82,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const resize = () => {
      const { width, height } = stage.getBoundingClientRect();
      if (width < 1 || height < 1) return;
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      engineRef.current.render(canvas);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    resize();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const stopStroke = useCallback(() => {
    if (!isDrawingRef.current) return;
    engineRef.current.endStroke();
    isDrawingRef.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!cameraRunning || !drawingHand?.active) {
      stopStroke();
      if (cameraRunning) {
        requiresRearmRef.current = true;
        setTrackingMessage("Drawing paused · show your drawing hand");
      } else {
        requiresRearmRef.current = false;
        setTrackingMessage("Start the camera to begin");
      }
      engineRef.current.render(canvas);
      return;
    }

    if (requiresRearmRef.current) {
      stopStroke();
      if (drawingHand.gesture === "PAUSE") {
        requiresRearmRef.current = false;
        setTrackingMessage("Ready · raise one finger to draw");
      } else {
        setTrackingMessage("Hand found · show two fingers, then one to resume");
      }
      engineRef.current.render(canvas);
      return;
    }

    const point = drawingHand.point;
    if (drawingHand.gesture === "DRAW") {
      setTrackingMessage("Drawing · show two fingers to pause");
      if (!isDrawingRef.current) {
        const settings = selectedTool === "eraser" ? eraser : brush;
        engineRef.current.startStroke(point, settings, selectedTool);
        isDrawingRef.current = true;
      } else {
        engineRef.current.addPoint(point);
      }
    } else {
      stopStroke();
      setTrackingMessage(
        drawingHand.gesture === "PAUSE"
          ? "Paused · raise one finger to draw"
          : "Ready · raise one finger to draw",
      );
    }

    engineRef.current.render(canvas);
  }, [cameraRunning, drawingHand, selectedTool, brush, eraser, stopStroke]);

  useEffect(() => {
    if (!cameraRunning) {
      if (closePaletteTimerRef.current !== null) {
        window.clearTimeout(closePaletteTimerRef.current);
        closePaletteTimerRef.current = null;
      }
      setPaletteOpen(false);
      return;
    }
    if (controlHand?.active && controlGesture === "OPEN_PALM" && !controlHandLowered) {
      if (closePaletteTimerRef.current !== null) {
        window.clearTimeout(closePaletteTimerRef.current);
        closePaletteTimerRef.current = null;
      }
      setPaletteOpen(true);
    } else if ((!controlHand?.active || controlHandLowered) && paletteOpen) {
      if (closePaletteTimerRef.current === null) {
        closePaletteTimerRef.current = window.setTimeout(() => {
          closePaletteTimerRef.current = null;
          setPaletteOpen(false);
        }, 650);
      }
    }
  }, [cameraRunning, controlHand?.active, controlGesture, controlHandLowered, paletteOpen]);

  const handlePaletteAction = useCallback((action: string) => {
    if (action === "brush") setSelectedTool("brush");
    else if (action === "eraser") setSelectedTool("eraser");
    else if (action === "undo") {
      stopStroke();
      engineRef.current.undo();
      if (canvasRef.current) engineRef.current.render(canvasRef.current);
    } else if (action === "clear") {
      stopStroke();
      engineRef.current.clear();
      if (canvasRef.current) engineRef.current.render(canvasRef.current);
    } else if (action.startsWith("color:")) {
      setSelectedColor(action.slice("color:".length));
      setSelectedTool("brush");
    } else if (action.startsWith("size:")) {
      setBrushSize(Number(action.slice("size:".length)));
    }
  }, [stopStroke]);

  useEffect(() => {
    let target: HTMLElement | null = null;
    if (paletteOpen && controlHand?.active && controlHand.gesture === "DRAW") {
      const stage = stageRef.current;
      if (stage) {
        const rect = stage.getBoundingClientRect();
        const x = rect.left + controlHand.point.x * rect.width;
        const y = rect.top + controlHand.point.y * rect.height;
        target = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-palette-action]") ?? null;
      }
    }
    if (hoverTargetRef.current !== target) {
      hoverTargetRef.current?.classList.remove("is-hovered");
      target?.classList.add("is-hovered");
      hoverTargetRef.current = target;
    }

    if (target !== dwellTargetRef.current) {
      dwellTargetRef.current = target;
      dwellStartedAtRef.current = performance.now();
      activatedTargetRef.current = null;
      lastProgressStepRef.current = 0;
      setDwellProgress(0);
    }

    if (!target || (target as HTMLButtonElement).disabled) {
      lastProgressStepRef.current = -1;
      setDwellProgress(0);
      if (target) dwellStartedAtRef.current = performance.now();
    } else if (activatedTargetRef.current !== target) {
      const action = target.dataset.paletteAction ?? "";
      const dwellDuration = action === "clear" ? 1200 : 650;
      const progress = Math.min(
        1,
        (performance.now() - dwellStartedAtRef.current) / dwellDuration,
      );
      const progressStep = Math.floor(progress * 20);
      if (progressStep !== lastProgressStepRef.current) {
        lastProgressStepRef.current = progressStep;
        setDwellProgress(progress);
      }
      if (progress >= 1) {
        activatedTargetRef.current = target;
        handlePaletteAction(action);
      }
    }
  }, [controlHand?.active, controlHand?.point.x, controlHand?.point.y, controlHand, paletteOpen, handlePaletteAction]);

  useEffect(() => () => {
    stopStroke();
    if (closePaletteTimerRef.current !== null) window.clearTimeout(closePaletteTimerRef.current);
  }, [stopStroke]);

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const context = exportCanvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    context.drawImage(canvas, 0, 0);
    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `airboard-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const handCursorStyle: CSSProperties | undefined = controlHand?.active && paletteOpen
    ? {
        left: `${controlHand.point.x * 100}%`,
        top: `${controlHand.point.y * 100}%`,
        "--dwell-progress": `${dwellProgress * 100}%`,
      } as CSSProperties
    : undefined;

  return (
    <div className="board-stage" ref={stageRef}>
      <canvas ref={canvasRef} className="drawing-canvas" aria-label="Whiteboard drawing surface" />

      <div className="board-topline">
        <div>
          <span className="eyebrow">PRESENTATION BOARD</span>
          <p className="tracking-message" aria-live="polite">{trackingMessage}</p>
        </div>
        <div className="board-quick-actions">
          <button className="button button--board" onClick={() => setPaletteOpen((open) => !open)}>
            {paletteOpen ? "Hide tools" : "Tools"}
          </button>
          <button className="button button--board" onClick={exportPng}>Export PNG</button>
        </div>
      </div>

      {paletteOpen && (
        <div className="tool-palette" aria-label="Gesture tool palette">
          <div className="palette-heading">
            <span>TOOLS</span>
            <span className="palette-hint">Point and hold</span>
          </div>
          <div className="palette-tool-row">
            <button data-palette-action="brush" className={`palette-tool ${selectedTool === "brush" ? "is-selected" : ""}`} onClick={() => handlePaletteAction("brush")}>
              <span className="tool-glyph">✎</span><span>Pen</span>
            </button>
            <button data-palette-action="eraser" className={`palette-tool ${selectedTool === "eraser" ? "is-selected" : ""}`} onClick={() => handlePaletteAction("eraser")}>
              <span className="tool-glyph">⌫</span><span>Eraser</span>
            </button>
            <button data-palette-action="undo" className="palette-tool" onClick={() => handlePaletteAction("undo")} disabled={!engineRef.current.canUndo()}>
              <span className="tool-glyph">↶</span><span>Undo</span>
            </button>
            <button data-palette-action="clear" className="palette-tool palette-tool--danger" onClick={() => handlePaletteAction("clear")}>
              <span className="tool-glyph">⌧</span><span>Clear</span>
            </button>
          </div>
          <div className="palette-options">
            <div className="palette-option-block">
              <span className="palette-label">COLOR</span>
              <div className="swatch-row">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    data-palette-action={`color:${color}`}
                    className={`color-swatch ${selectedColor.toUpperCase() === color.toUpperCase() && selectedTool === "brush" ? "is-selected" : ""}`}
                    style={{ "--swatch": color } as CSSProperties}
                    aria-label={`Select ${color} pen color`}
                    onClick={() => handlePaletteAction(`color:${color}`)}
                  />
                ))}
              </div>
            </div>
            <div className="palette-option-block">
              <span className="palette-label">PEN SIZE</span>
              <div className="size-row">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    data-palette-action={`size:${size}`}
                    className={`size-choice ${brushSize === size ? "is-selected" : ""}`}
                    onClick={() => handlePaletteAction(`size:${size}`)}
                  ><span style={{ width: size + 3, height: size + 3 }} />{size === 5 ? "Fine" : size === 10 ? "Medium" : "Bold"}</button>
                ))}
              </div>
            </div>
          </div>
          <p className="palette-footnote">Hold still to select · Clear takes about 1.2 seconds</p>
        </div>
      )}

      {controlHand && paletteOpen && (
        <div className="gesture-cursor" style={handCursorStyle} aria-hidden="true">
          <span>＋</span>
        </div>
      )}

      {!cameraRunning && (
        <div className="empty-board-hint">
          <span className="hint-spark" aria-hidden="true">✳</span>
          <span>Your lesson board is ready</span>
        </div>
      )}
    </div>
  );
}
