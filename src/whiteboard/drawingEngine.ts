import type { BrushSettings } from "./brush";
import type { EraserSettings } from "./eraser";
import { HistoryManager } from "./historyManager";

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: DrawingPoint[];
  color: string;
  size: number;
  opacity: number;
  tool: "brush" | "eraser";
}

export class DrawingEngine {
  private strokes: DrawingStroke[] = [];
  private history = new HistoryManager<DrawingStroke[]>();

  private activeStroke: DrawingStroke | null = null;

  constructor() {
    this.history.save([]);
  }

  startStroke(
    point: DrawingPoint,
    settings: BrushSettings | EraserSettings,
    tool: "brush" | "eraser"
  ): void {
    this.endStroke();

    this.activeStroke = {
      points: [point],
      color: tool === "eraser" ? "#FFFFFF" : 
        "color" in settings ? settings.color : "#2563EB",
      size: settings.size,
      opacity: "opacity" in settings ? settings.opacity : 1,
      tool,
    };
  }

  addPoint(point: DrawingPoint): void {
    if (!this.activeStroke) return;

    this.activeStroke.points.push(point);
  }

  endStroke(): void {
    if (!this.activeStroke) return;

    this.strokes.push(this.activeStroke);
    this.activeStroke = null;

    this.history.save(this.strokes);
  }

  undo(): void {
    this.endStroke();

    const previous = this.history.undo(this.strokes);

    if (previous) {
      this.strokes = previous;
    }
  }

  redo(): void {
    this.endStroke();

    const next = this.history.redo(this.strokes);

    if (next) {
      this.strokes = next;
    }
  }

  clear(): void {
    this.activeStroke = null;
    this.strokes = [];

    this.history.clear();
    this.history.save([]);
  }

  getStrokes(): DrawingStroke[] {
    return [
      ...this.strokes,
      ...(this.activeStroke ? [this.activeStroke] : []),
    ];
  }

  canUndo(): boolean {
    return this.history.canUndo() || this.activeStroke !== null;
  }

  canRedo(): boolean {
    return this.history.canRedo();
  }

  render(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of this.getStrokes()) {
      if (stroke.points.length === 0) continue;

      ctx.save();

      ctx.globalAlpha = stroke.opacity;

      ctx.globalCompositeOperation =
        stroke.tool === "eraser" ? "destination-out" : "source-over";

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();

      const firstPoint = stroke.points[0];

      ctx.moveTo(
        firstPoint.x * canvas.width,
        firstPoint.y * canvas.height
      );

      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];

        ctx.lineTo(
          point.x * canvas.width,
          point.y * canvas.height
        );
      }

      if (stroke.points.length === 1) {
        ctx.lineTo(
          firstPoint.x * canvas.width + 0.1,
          firstPoint.y * canvas.height + 0.1
        );
      }

      ctx.stroke();
      ctx.restore();
    }
  }
}