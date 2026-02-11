// Wasmのエクスポート関数の型定義
export interface WasmExports {
  fibonacci: (n: number) => number;
  add: (a: number, b: number) => number;
  grayscaleFilter: (offset: number, length: number) => void;
  brightnessFilter: (offset: number, length: number, value: number) => void;
  contrastFilter: (offset: number, length: number, value: number) => void;
  saturationFilter: (offset: number, length: number, value: number) => void;
  sepiaFilter: (offset: number, length: number) => void;
  invertFilter: (offset: number, length: number) => void;
  boxBlurFilter: (
    src: number,
    dst: number,
    width: number,
    height: number,
    radius: number
  ) => void;
  sharpenFilter: (
    src: number,
    dst: number,
    width: number,
    height: number,
    amount: number
  ) => void;
  memory: WebAssembly.Memory;
}
