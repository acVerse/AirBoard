export interface EraserSettings {
  size: number;
}

export const DEFAULT_ERASER: EraserSettings = {
  size: 25,
};

export function createEraser(
  size = DEFAULT_ERASER.size
): EraserSettings {
  return {
    size,
  };
}