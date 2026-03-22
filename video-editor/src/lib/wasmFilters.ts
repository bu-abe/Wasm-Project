import type { FilterSettings } from "../types";
import type * as VideoWasmModule from "../wasm-pkg/video_filter.js"; // @ts-ignore - wasm-pack ビルド後に生成されるファイル

export function applyWasmFilters(
  imageData: ImageData,
  filters: FilterSettings,
  wasm: typeof VideoWasmModule,
  mask?: Uint8Array | null
): ImageData {
  const { data, width, height } = imageData;

  // Uint8ClampedArray → Uint8Array ビュー（コピーなし）
  const pixels = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

  if (filters.backgroundBlur && mask) {
    const src = new Uint8Array(pixels);
    const dst = new Uint8Array(pixels.length);
    wasm.background_blur_filter(src, dst, mask, width, height, filters.backgroundBlurRadius);
    pixels.set(dst);
  }

  if (filters.grayscale) wasm.grayscale_filter(pixels);
  if (filters.sepia) wasm.sepia_filter(pixels);
  if (filters.invert) wasm.invert_filter(pixels);
  if (filters.brightness !== 0) wasm.brightness_filter(pixels, filters.brightness);
  if (filters.contrast !== 0) wasm.contrast_filter(pixels, filters.contrast);
  if (filters.saturation !== 0) wasm.saturation_filter(pixels, filters.saturation);
  if (filters.blur > 0) {
    const src = new Uint8Array(pixels);
    const dst = new Uint8Array(pixels.length);
    wasm.blur_filter(src, dst, width, height, filters.blur);
    pixels.set(dst);
  }

  return imageData;
}
