import { useRef, useEffect } from "react";
import { useVideoStore } from "../store/videoStore";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import { useSegmentation } from "../hooks/useSegmentation";
import { PerformanceOverlay } from "./PerformanceOverlay";
import type * as VideoWasmModule from "../wasm-pkg/video_filter.js"; // @ts-ignore - wasm-pack ビルド後に生成されるファイル

interface VideoCanvasProps {
  wasmModule: typeof VideoWasmModule;
}

export function VideoCanvas({ wasmModule }: VideoCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoUrl = useVideoStore((s) => s.videoUrl);
  const sourceMode = useVideoStore((s) => s.sourceMode);
  const cameraStream = useVideoStore((s) => s.cameraStream);

  const { segmentFrame, loading: segLoading, error: segError } = useSegmentation();

  // カメラストリームを video 要素にバインド
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (sourceMode === "camera" && cameraStream) {
      video.srcObject = cameraStream;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [sourceMode, cameraStream]);

  useVideoPlayer({ videoRef, canvasRef, wasmModule, segmentFrame });

  const hasSource = sourceMode === "camera" ? !!cameraStream : !!videoUrl;

  if (!hasSource) {
    return (
      <div className="flex items-center justify-center w-full aspect-video bg-gray-800 rounded-xl text-gray-500 text-sm">
        動画をアップロード、またはカメラを起動してください
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* hidden video element — フレームソース */}
      <video
        ref={videoRef}
        src={sourceMode === "file" ? videoUrl ?? undefined : undefined}
        className="hidden"
        playsInline
        loop={sourceMode === "file"}
        muted={sourceMode === "camera"}
        autoPlay={sourceMode === "camera"}
        crossOrigin="anonymous"
      />
      {/* 描画先キャンバス */}
      <canvas ref={canvasRef} className="w-full rounded-xl bg-black" />
      <PerformanceOverlay />
      {segLoading && (
        <div className="absolute top-2 left-2 text-xs text-yellow-400 bg-black/60 px-2 py-1 rounded">
          セグメンテーションモデル読み込み中...
        </div>
      )}
      {segError && (
        <div className="absolute top-2 left-2 text-xs text-red-400 bg-black/60 px-2 py-1 rounded">
          {segError}
        </div>
      )}
    </div>
  );
}
