import { useCallback, useEffect, useRef, useState } from "react";
import { closeHandTracker, initializeHandTracker } from "../vision/handTracker";
import { startCamera, stopCamera } from "../vision/cameraManager";
import {
  classifyGesture,
  type Handedness,
  type GestureType,
} from "../vision/gestureClassifier";
import { GestureStateMachine } from "../vision/gestureStateMachine";
import type { HandPoint } from "../vision/landmarkProcessor";

export interface TrackedHand {
  handedness: Handedness;
  landmarks: HandPoint[];
  gesture: GestureType;
  point: { x: number; y: number };
}

type TrackingStatus = "idle" | "starting" | "running" | "error";

interface HandState {
  gestureMachine: GestureStateMachine;
}

const createHandState = (): HandState => ({
  gestureMachine: new GestureStateMachine(4),
});

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const runningRef = useRef(false);
  const handStatesRef = useRef(new Map<Handedness, HandState>());

  const [status, setStatus] = useState<TrackingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hands, setHands] = useState<TrackedHand[]>([]);

  const stop = useCallback(() => {
    runningRef.current = false;

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    stopCamera(streamRef.current);
    streamRef.current = null;
    closeHandTracker();
    handStatesRef.current.clear();
    setHands([]);
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (runningRef.current || status === "starting") return;

    try {
      setStatus("starting");
      setError(null);

      const video = videoRef.current;
      if (!video) throw new Error("Camera preview is unavailable.");

      streamRef.current = await startCamera(video);
      const tracker = await initializeHandTracker();

      runningRef.current = true;
      setStatus("running");

      const detect = () => {
        if (!runningRef.current) return;

        if (video.readyState >= 2) {
          const results = tracker.detectForVideo(video, performance.now());
          const nextHands: TrackedHand[] = [];

          results.landmarks.forEach((landmarks, index) => {
            const categoryName = results.handedness[index]?.[0]?.categoryName;
            if (categoryName !== "Left" && categoryName !== "Right") return;

            const handedness = categoryName as Handedness;
            const points = landmarks.map((point) => ({
              x: point.x,
              y: point.y,
              z: point.z,
            }));
            let handState = handStatesRef.current.get(handedness);
            if (!handState) {
              handState = createHandState();
              handStatesRef.current.set(handedness, handState);
            }

            const gesture = handState.gestureMachine.update(
              classifyGesture(points),
            );
            nextHands.push({
              handedness,
              landmarks: points,
              gesture,
              point: { x: 1 - points[8].x, y: points[8].y },
            });
          });

          setHands(nextHands);
        }

        animationRef.current = requestAnimationFrame(detect);
      };

      detect();
    } catch (err) {
      stopCamera(streamRef.current);
      streamRef.current = null;
      closeHandTracker();
      runningRef.current = false;
      setError(
        err instanceof Error ? err.message : "Unable to start hand tracking.",
      );
      setStatus("error");
    }
  }, [status]);

  useEffect(() => () => {
    runningRef.current = false;
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    stopCamera(streamRef.current);
    closeHandTracker();
  }, []);

  return { videoRef, hands, status, error, start, stop };
}
