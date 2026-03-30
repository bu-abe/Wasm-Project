// Web Worker: WASM モジュールをロードしてフィルター処理を実行
// メインスレッドからピクセルデータを受け取り、処理結果を返す

import { instantiate } from "@wasm-project/image-filter";
import type { WasmExports } from "../../types";
import type { FilterSettings } from "../../store/editorStore";

let wasm: WasmExports | null = null;

// WASM 初期化
async function initWasm(): Promise<void> {
  // Worker 内では import.meta.url ベースで .wasm を fetch
  const wasmUrl = new URL(
    "@wasm-project/image-filter/build/release.wasm",
    import.meta.url,
  ).href;
  const module = await WebAssembly.compileStreaming(fetch(wasmUrl));
  wasm = (await instantiate(module, {})) as unknown as WasmExports;
}

function ensureMemory(bytes: number): void {
  const current = wasm!.memory.buffer.byteLength;
  if (bytes > current) {
    wasm!.memory.grow(Math.ceil((bytes - current) / 65536));
  }
}

function applyFiltersInWorker(
  pixelData: Uint8Array,
  width: number,
  height: number,
  filters: FilterSettings,
): Uint8Array {
  const pixelBytes = pixelData.byteLength;
  ensureMemory(pixelBytes * 3);

  // WASMメモリレイアウト:
  if (!wasm) return new Uint8Array(0);

  // ピクセルデータを WASM メモリの作業バッファ (offset 0) にコピー
  const wasmMem = new Uint8Array(wasm.memory.buffer);
  wasmMem.set(pixelData, 0);

  const offset = 0;
  const length = pixelBytes;

  // フィルターパイプライン
  if (filters.brightness !== 0) {
    const value = Math.round((filters.brightness / 100) * 255);
    wasm.brightnessFilter(offset, length, value);
  }
  if (filters.contrast !== 0) {
    wasm.contrastFilter(offset, length, filters.contrast);
  }
  if (filters.saturation !== 0) {
    wasm.saturationFilter(offset, length, filters.saturation);
  }
  if (filters.grayscale) {
    wasm.grayscaleFilter(offset, length);
  }
  if (filters.sepia) {
    wasm.sepiaFilter(offset, length);
  }
  if (filters.invert) {
    wasm.invertFilter(offset, length);
  }
  if (filters.blur > 0) {
    const dst = pixelBytes * 2;
    wasm.boxBlurFilter(offset, dst, width, height, filters.blur);
    // grow 後に wasmMem が無効化される可能性があるので再取得
    const mem = new Uint8Array(wasm.memory.buffer);
    mem.copyWithin(0, dst, dst + pixelBytes);
  }
  if (filters.sharpness > 0) {
    const dst = pixelBytes * 2;
    wasm.sharpenFilter(offset, dst, width, height, filters.sharpness);
    const mem = new Uint8Array(wasm.memory.buffer);
    mem.copyWithin(0, dst, dst + pixelBytes);
  }

  // 結果を読み出し
  const resultMem = new Uint8Array(wasm.memory.buffer);
  return resultMem.slice(0, pixelBytes);
}

// メッセージハンドラ
self.onmessage = async (e: MessageEvent) => {
  const { type, id } = e.data;

  if (type === "init") {
    try {
      await initWasm();
      self.postMessage({ type: "init", id, success: true });
    } catch (err) {
      self.postMessage({
        type: "init",
        id,
        success: false,
        error: String(err),
      });
    }
    return;
  }

  if (type === "applyFilters") {
    const { pixelData, width, height, filters } = e.data;
    try {
      const result = applyFiltersInWorker(
        new Uint8Array(pixelData),
        width,
        height,
        filters,
      );
      // Transferable で返してコピーを回避
      self.postMessage(
        { type: "applyFilters", id, result: result.buffer },
        { transfer: [result.buffer] },
      );
    } catch (err) {
      self.postMessage({
        type: "applyFilters",
        id,
        error: String(err),
      });
    }
  }
};
