export type RenderMode = "js" | "wasm";
export type SourceMode = "file" | "camera";

export interface FilterSettings {
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  brightness: number; // -255..255
  contrast: number; // -100..100
  saturation: number; // -100..100
  blur: number; // 0..20
  backgroundBlur: boolean;
  backgroundBlurRadius: number; // 0..40
}

export interface PerformanceStats {
  fps: number;
  msPerFrame: number;
  frameCount: number;
}
