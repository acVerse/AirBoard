export interface HandPoint {
  x: number;
  y: number;
  z: number;
}

function calculateAlpha(
  cutoff: number,
  deltaTime: number
): number {
  const tau = 1 / (2 * Math.PI * cutoff);

  return 1 / (1 + tau / deltaTime);
}

class OneEuroFilter {
  private previousValue: number | null = null;
  private previousDerivative = 0;

  private readonly minCutoff: number; beta: number; derivativeCutoff: number;
  
  constructor(minCutoff = 1.2, beta = 0.03, derivativeCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.derivativeCutoff = derivativeCutoff;
  }
  
  filter(value: number, deltaTime: number): number {
    if (this.previousValue === null) {
      this.previousValue = value;
      return value;
    }

    const rawDerivative =
      (value - this.previousValue) / deltaTime;

    const derivativeAlpha = calculateAlpha(
      this.derivativeCutoff,
      deltaTime
    );

    const filteredDerivative =
      derivativeAlpha * rawDerivative +
      (1 - derivativeAlpha) * this.previousDerivative;

    const cutoff =
      this.minCutoff +
      this.beta * Math.abs(filteredDerivative);

    const alpha = calculateAlpha(cutoff, deltaTime);

    const filteredValue =
      alpha * value +
      (1 - alpha) * this.previousValue;

    this.previousValue = filteredValue;
    this.previousDerivative = filteredDerivative;

    return filteredValue;
  }

  reset(): void {
    this.previousValue = null;
    this.previousDerivative = 0;
  }
}

class LandmarkFilter {
  private xFilter = new OneEuroFilter();
  private yFilter = new OneEuroFilter();
  private zFilter = new OneEuroFilter();

  filter(
    point: HandPoint,
    deltaTime: number
  ): HandPoint {
    return {
      x: this.xFilter.filter(point.x, deltaTime),
      y: this.yFilter.filter(point.y, deltaTime),
      z: this.zFilter.filter(point.z, deltaTime),
    };
  }

  reset(): void {
    this.xFilter.reset();
    this.yFilter.reset();
    this.zFilter.reset();
  }
}

export class LandmarkStabilizer {
  private filters = Array.from(
    { length: 21 },
    () => new LandmarkFilter()
  );

  private previousTimestamp: number | null = null;

  update(
    landmarks: HandPoint[],
    timestamp: number
  ): HandPoint[] {
    if (landmarks.length !== 21) {
      this.reset();
      return landmarks;
    }

    if (this.previousTimestamp === null) {
      this.previousTimestamp = timestamp;
      return landmarks.map(point => ({ ...point }));
    }

    const deltaTime = Math.max(
      (timestamp - this.previousTimestamp) / 1000,
      0.001
    );

    this.previousTimestamp = timestamp;

    return landmarks.map((point, index) =>
      this.filters[index].filter(point, deltaTime)
    );
  }

  reset(): void {
    this.filters.forEach(filter => filter.reset());
    this.previousTimestamp = null;
  }
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