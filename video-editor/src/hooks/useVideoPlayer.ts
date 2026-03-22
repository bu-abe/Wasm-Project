import { useEffect, useRef, useCallback } from "react";
import { useVideoStore } from "../store/videoStore";
import { applyJsFilters } from "../lib/jsFilters";
import { applyWasmFilters } from "../lib/wasmFilters";
import type { FilterSettings, RenderMode, SourceMode } from "../types";
import { usePerformance } from "./usePerformance";
import type * as VideoWasmModule from "../wasm-pkg/video_filter.js"; // @ts-ignore - wasm-pack ビルド後に生成されるファイル

type SegmentFrameFn = (
  video: HTMLVideoElement,
  timestamp: number,
  targetWidth: number,
  targetHeight: number
) => Uint8Array | null;

interface UseVideoPlayerOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  wasmModule: typeof VideoWasmModule;
  segmentFrame?: SegmentFrameFn | null;
}

export function useVideoPlayer({
  videoRef,
  canvasRef,
  wasmModule,
  segmentFrame,
}: UseVideoPlayerOptions) {
  const rafRef = useRef<number | null>(null);
  const { recordFrame, reset } = usePerformance();
  const segmentFrameRef = useRef(segmentFrame);
  segmentFrameRef.current = segmentFrame;

  // stale closure 対策: ストア値をrefで同期
  const storeRef = useRef<{
    filters: FilterSettings;
    renderMode: RenderMode;
    isPlaying: boolean;
    sourceMode: SourceMode;
  }>({
    filters: useVideoStore.getState().filters,
    renderMode: useVideoStore.getState().renderMode,
    isPlaying: useVideoStore.getState().isPlaying,
    sourceMode: useVideoStore.getState().sourceMode,
  });

  useEffect(() => {
    return useVideoStore.subscribe((state) => {
      storeRef.current = {
        filters: state.filters,
        renderMode: state.renderMode,
        isPlaying: state.isPlaying,
        sourceMode: state.sourceMode,
      };
    });
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    stopLoop();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const loop = () => {
      if (!storeRef.current.isPlaying) {
        stopLoop();
        return;
      }

      const { filters, renderMode } = storeRef.current;
      const t0 = performance.now();

      // キャンバスサイズをビデオに合わせる
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const hasAnyFilter =
        filters.grayscale ||
        filters.sepia ||
        filters.invert ||
        filters.brightness !== 0 ||
        filters.contrast !== 0 ||
        filters.saturation !== 0 ||
        filters.blur > 0 ||
        filters.backgroundBlur;

      if (hasAnyFilter) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 背景ぼかし用のセグメンテーションマスクを取得
        let mask: Uint8Array | null = null;
        if (filters.backgroundBlur && segmentFrameRef.current) {
          mask = segmentFrameRef.current(
            video,
            performance.now(),
            canvas.width,
            canvas.height
          );
        }

        if (renderMode === "wasm" && wasmModule) {
          applyWasmFilters(imageData, filters, wasmModule, mask);
        } else {
          applyJsFilters(imageData, filters, mask);
        }

        ctx.putImageData(imageData, 0, 0);
      }

      const elapsed = performance.now() - t0;
      recordFrame(elapsed);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [videoRef, canvasRef, wasmModule, recordFrame, stopLoop]);

  const isPlaying = useVideoStore((s) => s.isPlaying);
  const setIsPlaying = useVideoStore((s) => s.setIsPlaying);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
      startLoop();
    } else {
      video.pause();
      stopLoop();
      reset();
    }
  }, [isPlaying, videoRef, startLoop, stopLoop, setIsPlaying, reset]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  return { startLoop, stopLoop };
}
