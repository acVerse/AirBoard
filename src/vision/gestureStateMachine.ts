import type { GestureType } from "./gestureClassifier";

export class GestureStateMachine {
  private currentGesture: GestureType = "UNKNOWN";
  private candidateGesture: GestureType = "UNKNOWN";

  private candidateCount = 0;
  private readonly requiredFrames: number;

  constructor(requiredFrames = 5) {
    this.requiredFrames = Math.max(1, Math.floor(requiredFrames));
  }

  update(detectedGesture: GestureType): GestureType {

    // SAFETY: UNKNOWN immediately stops the current gesture.
    if (detectedGesture === "UNKNOWN") {
      this.currentGesture = "UNKNOWN";
      this.candidateGesture = "UNKNOWN";
      this.candidateCount = 0;

      return this.currentGesture;
    }

    // Detection matches the current gesture.
    if (detectedGesture === this.currentGesture) {
      this.candidateGesture = detectedGesture;
      this.candidateCount = 0;

      return this.currentGesture;
    }

    // SAFETY: Stop drawing immediately when DRAW is interrupted.
    if (this.currentGesture === "DRAW") {
      this.currentGesture = "UNKNOWN";
    }

    // Track candidate gesture.
    if (detectedGesture === this.candidateGesture) {
      this.candidateCount++;
    } else {
      this.candidateGesture = detectedGesture;
      this.candidateCount = 1;
    }

    // Confirm gesture after consecutive frames.
    if (this.candidateCount >= this.requiredFrames) {
      this.currentGesture = this.candidateGesture;
      this.candidateCount = 0;
    }

    return this.currentGesture;
  }

  reset(): void {
    this.currentGesture = "UNKNOWN";
    this.candidateGesture = "UNKNOWN";
    this.candidateCount = 0;
  }

  getCurrentGesture(): GestureType {
    return this.currentGesture;
  }
}