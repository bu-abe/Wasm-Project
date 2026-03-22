import { useEffect, useRef, useCallback, useState } from "react";
// @ts-ignore - MediaPipe tasks-vision の型定義が bundler moduleResolution で解決されないため
import { ImageSegmenter, FilesetResolver } from "@mediapipe/tasks-vision";

export function useSegmentation() {
  const segmenterRef = useRef<ImageSegmenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // マスクアップスケール用オフスクリーンCanvas
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );
        if (cancelled) return;

        const segmenter = await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          outputCategoryMask: true,
          outputConfidenceMasks: false,
        });
        if (cancelled) {
          segmenter.close();
          return;
        }

        segmenterRef.current = segmenter;
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError("セグメンテーションモデルの読み込みに失敗しました");
          setLoading(false);
          console.error("Segmentation init error:", e);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      segmenterRef.current?.close();
      segmenterRef.current = null;
    };
  }, []);

  const segmentFrame = useCallback(
    (
      video: HTMLVideoElement,
      timestamp: number,
      targetWidth: number,
      targetHeight: number
    ): Uint8Array | null => {
      const segmenter = segmenterRef.current;
      if (!segmenter || video.readyState < 2) return null;

      let resultMask: Uint8Array | null = null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      segmenter.segmentForVideo(video, timestamp, (result: any) => {
        const categoryMask = result.categoryMask;
        if (!categoryMask) return;

        const maskData = categoryMask.getAsUint8Array();
        const maskWidth = categoryMask.width;
        const maskHeight = categoryMask.height;

        // マスクをフレームサイズにアップスケール
        if (maskWidth === targetWidth && maskHeight === targetHeight) {
          // マスク値を変換: 255=人物(クリア), 0=背景(ぼかし)
          resultMask = new Uint8Array(maskData.length);
          for (let i = 0; i < maskData.length; i++) {
            resultMask[i] = maskData[i] === 0 ? 255 : 0;
          }
        } else {
          // オフスクリーンCanvasでアップスケール
          if (!maskCanvasRef.current) {
            maskCanvasRef.current = document.createElement("canvas");
          }
          const canvas = maskCanvasRef.current;
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return;

          // マスクデータを一時Canvasに書き込み
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = maskWidth;
          tempCanvas.height = maskHeight;
          const tempCtx = tempCanvas.getContext("2d")!;
          const imgData = tempCtx.createImageData(maskWidth, maskHeight);
          for (let i = 0; i < maskData.length; i++) {
            const val = maskData[i] === 0 ? 255 : 0;
            const pi = i * 4;
            imgData.data[pi] = val;
            imgData.data[pi + 1] = val;
            imgData.data[pi + 2] = val;
            imgData.data[pi + 3] = 255;
          }
          tempCtx.putImageData(imgData, 0, 0);

          // アップスケール描画
          ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);
          const scaled = ctx.getImageData(0, 0, targetWidth, targetHeight);

          // R チャネルだけ取り出し（グレースケールなのでどれでも同じ）
          resultMask = new Uint8Array(targetWidth * targetHeight);
          for (let i = 0; i < resultMask.length; i++) {
            resultMask[i] = scaled.data[i * 4];
          }
        }
      });

      return resultMask;
    },
    []
  );

  return { segmentFrame, loading, error };
}
