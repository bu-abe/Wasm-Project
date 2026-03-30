import type { WasmExports } from "../types";
import type { FilterSettings } from "../store/editorStore";

// WASMメモリレイアウト:
// [0 ... pixelBytes-1]       : 作業バッファ (処理用)
// [pixelBytes ... *2-1]      : 元画像バックアップ
// [pixelBytes*2 ... *3-1]    : blur/sharpen dst バッファ

function ensureMemory(wasm: WasmExports, bytes: number): void {
  const current = wasm.memory.buffer.byteLength;
  if (bytes > current) {
    wasm.memory.grow(Math.ceil((bytes - current) / 65536));
  }
}

// 最後にWASMメモリに書き込んだ元画像の参照
let cachedOriginalData: ImageData | null = null;

function initWasmImage(wasm: WasmExports, imageData: ImageData): void {
  const pixelBytes = imageData.data.byteLength;
  ensureMemory(wasm, pixelBytes * 3);
  // 元画像をバックアップ領域 (offset: pixelBytes) に書き込む
  const wasmMem = new Uint8Array(wasm.memory.buffer);
  wasmMem.set(new Uint8Array(imageData.data.buffer), pixelBytes);
  cachedOriginalData = imageData;
}

export function applyFilters(
  wasm: WasmExports,
  originalData: ImageData,
  filters: FilterSettings,
): ImageData {
  const { width, height } = originalData;
  const pixelBytes = originalData.data.byteLength;

  // 元画像が変わった(または未初期化)場合のみJSヒープ→WASMコピーが走る
  if (cachedOriginalData !== originalData) {
    console.time("[WASM] JS→WASMコピー (set)");
    initWasmImage(wasm, originalData);
    console.timeEnd("[WASM] JS→WASMコピー (set)");
  } else {
    ensureMemory(wasm, pixelBytes * 3);
  }

  // 元画像バックアップ → 作業バッファへ
  const wasmMem = new Uint8Array(wasm.memory.buffer);
  console.time("[WASM] バックアップ復元 (copyWithin)");
  wasmMem.copyWithin(0, pixelBytes, pixelBytes * 2);
  console.timeEnd("[WASM] バックアップ復元 (copyWithin)");

  const offset = 0;
  const length = pixelBytes;

  // フィルターパイプライン: 元画像から順次適用
  console.time("[WASM] フィルター処理");
  // 1. 明るさ
  if (filters.brightness !== 0) {
    const value = Math.round((filters.brightness / 100) * 255);
    wasm.brightnessFilter(offset, length, value);
  }
  // 2. コントラスト
  if (filters.contrast !== 0) {
    wasm.contrastFilter(offset, length, filters.contrast);
  }
  // 3. 彩度
  if (filters.saturation !== 0) {
    wasm.saturationFilter(offset, length, filters.saturation);
  }
  // 4. グレースケール
  if (filters.grayscale) {
    wasm.grayscaleFilter(offset, length);
  }
  // 5. セピア
  if (filters.sepia) {
    wasm.sepiaFilter(offset, length);
  }
  // 6. 反転
  if (filters.invert) {
    wasm.invertFilter(offset, length);
  }
  // 7. ブラー (src=0, dst=pixelBytes*2)
  if (filters.blur > 0) {
    const dst = pixelBytes * 2;
    wasm.boxBlurFilter(offset, dst, width, height, filters.blur);
    wasmMem.copyWithin(0, dst, dst + pixelBytes);
  }
  // 8. シャープ化 (src=0, dst=pixelBytes*2)
  if (filters.sharpness > 0) {
    const dst = pixelBytes * 2;
    wasm.sharpenFilter(offset, dst, width, height, filters.sharpness);
    wasmMem.copyWithin(0, dst, dst + pixelBytes);
  }

  console.timeEnd("[WASM] フィルター処理");

  // 結果を読み出し
  console.time("[WASM] WASM→JS読出し (subarray)");
  const result = new ImageData(width, height);
  result.data.set(wasmMem.subarray(0, pixelBytes));
  console.timeEnd("[WASM] WASM→JS読出し (subarray)");

  return result;
}
