// src/lib/imageProcessing.ts

import * as Type from "../types";

/**
 * ImageDataからUint8Arrayを取得
 */
export function extractPixelData(imageData: ImageData): Uint8Array {
  return new Uint8Array(imageData.data);
}

/**
 * キャンバスから ImageData を取得
 */
export function getImageDataFromCanvas(
  canvas: HTMLCanvasElement
): ImageData | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * ImageData をキャンバスに描画
 */
export function drawImageDataToCanvas(
  canvas: HTMLCanvasElement,
  imageData: ImageData
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.putImageData(imageData, 0, 0);
}

/**
 * 画像ファイルをCanvasに読み込む
 */
export function loadImageToCanvas(
  file: File,
  canvas: HTMLCanvasElement
): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * JavaScript版グレースケール処理
 */
export function grayscaleFilterJS(pixelData: Uint8Array): void {
  for (let i = 0; i < pixelData.length; i += 4) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];

    // グレースケール：加重平均
    const gray = r * 0.299 + g * 0.587 + b * 0.114;

    pixelData[i] = gray;
    pixelData[i + 1] = gray;
    pixelData[i + 2] = gray;
    // pixelData[i + 3] は変更しない
  }
}

/**
 * Wasm版グレースケール処理
 */
export function grayscaleFilterWasm(
  pixelData: Uint8Array,
  wasmModule: Type.WasmExports
): void {
  const ptr = wasmModule.memory.buffer as ArrayBuffer;

  // Wasmメモリにピクセルデータをコピー
  const wasmMemory = new Uint8Array(ptr);
  wasmMemory.set(pixelData);

  // Wasm関数を呼び出し（メモリアドレスと長さを渡す）
  wasmModule.grayscaleFilter(0, pixelData.length);

  // 処理結果をピクセルデータに反映
  pixelData.set(new Uint8Array(ptr, 0, pixelData.length));
}

/**
 * パフォーマンス計測用ラッパー
 */
export async function measurePerformance(
  name: string,
  fn: () => void
): Promise<number> {
  const start = performance.now();
  fn();
  const end = performance.now();
  const time = end - start;
  console.log(`${name}: ${time.toFixed(2)}ms`);
  return time;
}
