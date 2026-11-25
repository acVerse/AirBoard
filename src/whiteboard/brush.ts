export interface BrushSettings {
  color: string;
  size: number;
  opacity: number;
}

export const DEFAULT_BRUSH: BrushSettings = {
  color: "#2563EB",
  size: 5,
  opacity: 1,
};

export function createBrush(
  settings: Partial<BrushSettings> = {}
): BrushSettings {
  return {
    ...DEFAULT_BRUSH,
    ...settings,
  };
}