// Wasmのエクスポート関数の型定義
export interface WasmExports {
  fibonacci: (n: number) => number;
  add: (a: number, b: number) => number;
  grayscaleFilter: (pixelDataPtr: number, pixelDataLength: number) => void;
  memory: WebAssembly.Memory;
}
