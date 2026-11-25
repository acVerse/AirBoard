import type { HandPoint } from "./landmarkProcessor";

export type GestureType =
  | "DRAW"
  | "POINTER"
  | "PAUSE"
  | "IDLE"
  | "UNKNOWN";

interface FingerState {
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
}

function calculateDistance(
  pointA: HandPoint,
  pointB: HandPoint
): number {
  return Math.sqrt(
    Math.pow(pointA.x - pointB.x, 2) +
    Math.pow(pointA.y - pointB.y, 2) +
    Math.pow(pointA.z - pointB.z, 2)
  );
}

function isFingerExtended(
  landmarks: HandPoint[],
  tipIndex: number,
  pipIndex: number
): boolean {
  const wrist = landmarks[0];
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];

  if (!wrist || !tip || !pip) {
    return false;
  }

  const tipDistance = calculateDistance(wrist, tip);
  const pipDistance = calculateDistance(wrist, pip);

  return tipDistance > pipDistance * 1.15;
}

export function detectFingerStates(
  landmarks: HandPoint[]
): FingerState | null {
  if (landmarks.length !== 21) {
    return null;
  }

  return {
    index: isFingerExtended(landmarks, 8, 6),
    middle: isFingerExtended(landmarks, 12, 10),
    ring: isFingerExtended(landmarks, 16, 14),
    pinky: isFingerExtended(landmarks, 20, 18),
  };
}

export function classifyGesture(
  landmarks: HandPoint[]
): GestureType {
  const fingers = detectFingerStates(landmarks);

  if (!fingers) {
    return "UNKNOWN";
  }

  const { index, middle, ring, pinky } = fingers;

  // Index finger only: Drawing mode
  if (index && !middle && !ring && !pinky) {
    return "DRAW";
  }

  // Index and middle fingers: Pointer mode
  if (index && middle && !ring && !pinky) {
    return "POINTER";
  }

  // All four fingers extended: Standby mode
  if (index && middle && ring && pinky) {
    return "IDLE";
  }

  // All four fingers curled: Pause mode
  if (!index && !middle && !ring && !pinky) {
    return "PAUSE";
  }

  return "UNKNOWN";
}