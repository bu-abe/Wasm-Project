import { useRef } from "react";
import { useVideoStore } from "../store/videoStore";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import { PerformanceOverlay } from "./PerformanceOverlay";
import type * as VideoWasmModule from "../wasm-pkg/video_filter.js"; // @ts-ignore - wasm-pack ビルド後に生成されるファイル

interface VideoCanvasProps {
  wasmModule: typeof VideoWasmModule;
}

export function VideoCanvas({ wasmModule }: VideoCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoUrl = useVideoStore((s) => s.videoUrl);

  useVideoPlayer({ videoRef, canvasRef, wasmModule });

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center w-full aspect-video bg-gray-800 rounded-xl text-gray-500 text-sm">
        動画をアップロードしてください
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* hidden video element — フレームソース */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="hidden"
        playsInline
        loop
        crossOrigin="anonymous"
      />
      {/* 描画先キャンバス */}
      <canvas ref={canvasRef} className="w-full rounded-xl bg-black" />
      <PerformanceOverlay />
    </div>
  );
}
