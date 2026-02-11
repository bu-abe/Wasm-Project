import type { WasmExports } from "../types";
import type { FilterSettings } from "../store/editorStore";

function ensureMemory(wasm: WasmExports, bytes: number): void {
  const current = wasm.memory.buffer.byteLength;
  if (bytes > current) {
    wasm.memory.grow(Math.ceil((bytes - current) / 65536));
  }
}

export function applyFilters(
  wasm: WasmExports,
  originalData: ImageData,
  filters: FilterSettings
): ImageData {
  const { width, height } = originalData;
  const pixelBytes = originalData.data.byteLength;

  // blur/sharpen は src→dst で2倍必要
  const needsTwoBuffers = filters.blur > 0 || filters.sharpness > 0;
  const requiredBytes = needsTwoBuffers ? pixelBytes * 2 : pixelBytes;
  ensureMemory(wasm, requiredBytes);

  // WASM メモリにコピー (offset 0)
  const wasmMem = new Uint8Array(wasm.memory.buffer);
  wasmMem.set(new Uint8Array(originalData.data.buffer), 0);

  const offset: number = 0;
  const length: number = pixelBytes;

  // フィルターパイプライン: 元画像から順次適用
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

  // 7. ブラー (src=0, dst=pixelBytes)
  if (filters.blur > 0) {
    const dst = pixelBytes;
    wasm.boxBlurFilter(offset, dst, width, height, filters.blur);
    // dst → src にコピーバック
    const mem = new Uint8Array(wasm.memory.buffer);
    mem.copyWithin(0, dst, dst + pixelBytes);
  }

  // 8. シャープ化 (src=0, dst=pixelBytes)
  if (filters.sharpness > 0) {
    const dst = pixelBytes;
    wasm.sharpenFilter(offset, dst, width, height, filters.sharpness);
    // dst → src にコピーバック
    const mem = new Uint8Array(wasm.memory.buffer);
    mem.copyWithin(0, dst, dst + pixelBytes);
  }

  // 結果を読み出し
  const result = new ImageData(width, height);
  const resultMem = new Uint8Array(wasm.memory.buffer, 0, pixelBytes);
  result.data.set(resultMem);

  return result;
}
