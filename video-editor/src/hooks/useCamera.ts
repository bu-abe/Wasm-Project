import { useCallback, useState } from "react";
import { useVideoStore } from "../store/videoStore";

export function useCamera() {
  const [error, setError] = useState<string | null>(null);
  const setCameraStream = useVideoStore((s) => s.setCameraStream);
  const setSourceMode = useVideoStore((s) => s.setSourceMode);
  const setIsPlaying = useVideoStore((s) => s.setIsPlaying);
  const stopCameraStore = useVideoStore((s) => s.stopCamera);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: false,
      });
      setCameraStream(stream);
      setSourceMode("camera");
      setIsPlaying(true);
    } catch (e) {
      const msg =
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "カメラへのアクセスが拒否されました"
          : "カメラの起動に失敗しました";
      setError(msg);
    }
  }, [setCameraStream, setSourceMode, setIsPlaying]);

  const stopCamera = useCallback(() => {
    stopCameraStore();
    setError(null);
  }, [stopCameraStore]);

  return { startCamera, stopCamera, error };
}
