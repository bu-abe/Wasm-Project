import { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "../store/editorStore";
import { useWasm } from "./useWasm";
import { applyFilters } from "../lib/wasmFilters";
import { applyFiltersJS } from "../lib/jsFilters";

export function useImageEditor() {
  const { wasmModule, loading, error } = useWasm();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { originalImageData, filters, renderMode, setOriginalImageData } = useEditorStore();

  // フィルター変更時にキャンバスを再描画
  useEffect(() => {
    if (!originalImageData || !canvasRef.current) return;
    if (renderMode === "wasm" && !wasmModule) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const result =
      renderMode === "wasm" && wasmModule
        ? applyFilters(wasmModule, originalImageData, filters)
        : applyFiltersJS(originalImageData, filters);

    ctx.putImageData(result, 0, 0);
  }, [originalImageData, filters, wasmModule, renderMode]);

  // 画像アップロード処理
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!canvasRef.current) return;

      const img = new Image();
      const url = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const canvas = canvasRef.current!;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          setOriginalImageData(imageData);
          resolve();
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
      });

      URL.revokeObjectURL(url);
    },
    [setOriginalImageData]
  );

  // ダウンロード処理
  const handleDownload = useCallback(
    (format: "png" | "jpeg" = "png") => {
      if (!canvasRef.current || !originalImageData) return;

      const link = document.createElement("a");
      const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
      link.download = `edited-image.${format}`;
      link.href = canvasRef.current.toDataURL(mimeType, 0.95);
      link.click();
    },
    [originalImageData]
  );

  return {
    canvasRef,
    loading,
    error,
    handleImageUpload,
    handleDownload,
    hasImage: !!originalImageData,
  };
}
