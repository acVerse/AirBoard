import type { GestureType } from "./gestureClassifier";

export class GestureStateMachine {
  private currentGesture: GestureType = "UNKNOWN";
  private candidateGesture: GestureType = "UNKNOWN";

  private candidateCount = 0;
  private readonly requiredFrames: number;

  constructor(requiredFrames = 5) {
    this.requiredFrames = requiredFrames;
  }

  update(detectedGesture: GestureType): GestureType {
    if (detectedGesture === this.currentGesture) {
      this.candidateGesture = detectedGesture;
      this.candidateCount = 0;

      return this.currentGesture;
    }

    if (detectedGesture === this.candidateGesture) {
      this.candidateCount++;
    } else {
      this.candidateGesture = detectedGesture;
      this.candidateCount = 1;
    }

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