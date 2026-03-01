export type RenderMode = "js" | "wasm";

export interface FilterSettings {
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  brightness: number; // -255..255
  contrast: number; // -100..100
  saturation: number; // -100..100
  blur: number; // 0..20
}

export interface PerformanceStats {
  fps: number;
  msPerFrame: number;
  frameCount: number;
}
