export interface HandPoint {
  x: number;
  y: number;
  z: number;
}

export function getIndexFingerTip(
  landmarks: HandPoint[]
): HandPoint | null {
  return landmarks[8] ?? null;
}

export function getAllLandmarks(
  landmarks: HandPoint[]
): HandPoint[] {
  return landmarks;
}