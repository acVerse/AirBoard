import { classifyGesture } from "../vision/gestureClassifier";
import { GestureStateMachine } from "../vision/gestureStateMachine";
import { useCallback, useEffect, useRef, useState } from "react";
import { initializeHandTracker, closeHandTracker } from "../vision/handTracker";
import { startCamera, stopCamera } from "../vision/cameraManager";
import type { HandPoint } from "../vision/landmarkProcessor";

type TrackingStatus = "idle" | "starting" | "running" | "error";

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export function useHandTracking() {
  const gestureMachineRef = useRef(new GestureStateMachine(5));
  const [currentGesture, setCurrentGesture] = useState("UNKNOWN");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const runningRef = useRef(false);

  const [status, setStatus] = useState<TrackingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<HandPoint[]>([]);

  const drawLandmarks = useCallback((points: HandPoint[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw hand connections
    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth = 4;

    HAND_CONNECTIONS.forEach(([start, end]) => {
      const pointA = points[start];
      const pointB = points[end];

      if (!pointA || !pointB) return;

      ctx.beginPath();
      ctx.moveTo(
        pointA.x * canvas.width,
        pointA.y * canvas.height
      );
      ctx.lineTo(
        pointB.x * canvas.width,
        pointB.y * canvas.height
      );
      ctx.stroke();
    });

    // Draw all 21 landmarks
    points.forEach((point, index) => {
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, index === 8 ? 10 : 5, 0, Math.PI * 2);

      ctx.fillStyle = index === 8 ? "#FF4081" : "#FFFFFF";
      ctx.fill();

      ctx.strokeStyle = "#00A8CC";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    stopCamera(streamRef.current);
    streamRef.current = null;

    closeHandTracker();

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }

    setLandmarks([]);
    const stableGesture =
        gestureMachineRef.current.update("UNKNOWN");
        setCurrentGesture(stableGesture);
        setStatus("idle");
    gestureMachineRef.current.reset();
    setCurrentGesture("UNKNOWN");
  }, []);

  const start = useCallback(async () => {
    if (runningRef.current || status === "starting") return;

    try {
      setStatus("starting");
      setError(null);

      const video = videoRef.current;

      if (!video) {
        throw new Error("Video element not found.");
      }

      streamRef.current = await startCamera(video);

      const tracker = await initializeHandTracker();

      runningRef.current = true;
      setStatus("running");

      const detect = () => {
        if (!runningRef.current) return;

        if (video.readyState >= 2) {
          const results = tracker.detectForVideo(
            video,
            performance.now()
          );

          const detectedHands = results.landmarks;

          if (detectedHands.length > 0) {
            const points = detectedHands[0].map((point) => ({
              x: point.x,
              y: point.y,
              z: point.z,
            }));

            setLandmarks(points);
            drawLandmarks(points);
            const detectedGesture = classifyGesture(points);
            const stableGesture =
                gestureMachineRef.current.update(detectedGesture);

            setCurrentGesture(stableGesture);
          } else {
            setLandmarks([]);
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");

            if (canvas && ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
        }

        animationRef.current = requestAnimationFrame(detect);
      };

      detect();

    } catch (err) {
      stopCamera(streamRef.current);
      streamRef.current = null;

      closeHandTracker();

      runningRef.current = false;

      const message =
        err instanceof Error ? err.message : "Unable to start hand tracking.";

      setError(message);
      setStatus("error");
    }
  }, [drawLandmarks, status]);

  useEffect(() => {
    return () => {
      runningRef.current = false;

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      stopCamera(streamRef.current);
      closeHandTracker();
    };
  }, []);

  return {
  videoRef,
  canvasRef,
  landmarks,
  status,
  error,
  currentGesture,
  start,
  stop,
};
}