import type { FilterSettings } from "../store/editorStore";

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function applyGrayscale(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = data[i + 1] = data[i + 2] = gray;
  }
}

function applyBrightness(data: Uint8ClampedArray, value: number): void {
  const v = Math.round((value / 100) * 255);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + v);
    data[i + 1] = clamp(data[i + 1] + v);
    data[i + 2] = clamp(data[i + 2] + v);
  }
}

function applyContrast(data: Uint8ClampedArray, value: number): void {
  const factor = (259 * (value + 255)) / (255 * (259 - value));
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128);
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
  }
}

function applySaturation(data: Uint8ClampedArray, value: number): void {
  const factor = (value + 100) / 100;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    data[i] = clamp(gray + factor * (r - gray));
    data[i + 1] = clamp(gray + factor * (g - gray));
    data[i + 2] = clamp(gray + factor * (b - gray));
  }
}

function applySepia(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    data[i] = clamp(r * 0.393 + g * 0.769 + b * 0.189);
    data[i + 1] = clamp(r * 0.349 + g * 0.686 + b * 0.168);
    data[i + 2] = clamp(r * 0.272 + g * 0.534 + b * 0.131);
  }
}

function applyInvert(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
}

function applyBoxBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray<ArrayBuffer> {
  const diameter = radius * 2 + 1;
  const tmp = new Uint8ClampedArray(data.length);
  const dst = new Uint8ClampedArray(data.length);

  // 水平パス: data → tmp
  for (let y = 0; y < height; y++) {
    let rSum = 0, gSum = 0, bSum = 0, aSum = 0;

    for (let dx = -radius; dx <= radius; dx++) {
      const sx = Math.max(0, Math.min(width - 1, dx));
      const idx = (y * width + sx) * 4;
      rSum += data[idx]; gSum += data[idx + 1];
      bSum += data[idx + 2]; aSum += data[idx + 3];
    }
    tmp[y * width * 4] = rSum / diameter;
    tmp[y * width * 4 + 1] = gSum / diameter;
    tmp[y * width * 4 + 2] = bSum / diameter;
    tmp[y * width * 4 + 3] = aSum / diameter;

    for (let x = 1; x < width; x++) {
      const removeX = Math.max(0, x - radius - 1);
      const ri = (y * width + removeX) * 4;
      rSum -= data[ri]; gSum -= data[ri + 1];
      bSum -= data[ri + 2]; aSum -= data[ri + 3];

      const addX = Math.min(width - 1, x + radius);
      const ai = (y * width + addX) * 4;
      rSum += data[ai]; gSum += data[ai + 1];
      bSum += data[ai + 2]; aSum += data[ai + 3];

      const oi = (y * width + x) * 4;
      tmp[oi] = rSum / diameter; tmp[oi + 1] = gSum / diameter;
      tmp[oi + 2] = bSum / diameter; tmp[oi + 3] = aSum / diameter;
    }
  }

  // 垂直パス: tmp → dst
  for (let x = 0; x < width; x++) {
    let rSum = 0, gSum = 0, bSum = 0, aSum = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      const sy = Math.max(0, Math.min(height - 1, dy));
      const idx = (sy * width + x) * 4;
      rSum += tmp[idx]; gSum += tmp[idx + 1];
      bSum += tmp[idx + 2]; aSum += tmp[idx + 3];
    }
    dst[x * 4] = rSum / diameter; dst[x * 4 + 1] = gSum / diameter;
    dst[x * 4 + 2] = bSum / diameter; dst[x * 4 + 3] = aSum / diameter;

    for (let y = 1; y < height; y++) {
      const removeY = Math.max(0, y - radius - 1);
      const ri = (removeY * width + x) * 4;
      rSum -= tmp[ri]; gSum -= tmp[ri + 1];
      bSum -= tmp[ri + 2]; aSum -= tmp[ri + 3];

      const addY = Math.min(height - 1, y + radius);
      const ai = (addY * width + x) * 4;
      rSum += tmp[ai]; gSum += tmp[ai + 1];
      bSum += tmp[ai + 2]; aSum += tmp[ai + 3];

      const oi = (y * width + x) * 4;
      dst[oi] = rSum / diameter; dst[oi + 1] = gSum / diameter;
      dst[oi + 2] = bSum / diameter; dst[oi + 3] = aSum / diameter;
    }
  }

  return dst;
}

function applySharpen(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  amount: number
): Uint8ClampedArray<ArrayBuffer> {
  const factor = amount / 100;
  const center = 1 + 4 * factor;
  const edge = -factor;
  const dst = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        let val = center * data[idx + c];
        val += edge * data[((y > 0 ? y - 1 : y) * width + x) * 4 + c];
        val += edge * data[((y < height - 1 ? y + 1 : y) * width + x) * 4 + c];
        val += edge * data[(y * width + (x > 0 ? x - 1 : x)) * 4 + c];
        val += edge * data[(y * width + (x < width - 1 ? x + 1 : x)) * 4 + c];
        dst[idx + c] = clamp(val);
      }
      dst[idx + 3] = data[idx + 3];
    }
  }

  return dst;
}

export function applyFiltersJS(
  originalData: ImageData,
  filters: FilterSettings
): ImageData {
  const { width, height } = originalData;
  let data = new Uint8ClampedArray(originalData.data);

  if (filters.brightness !== 0) applyBrightness(data, filters.brightness);
  if (filters.contrast !== 0) applyContrast(data, filters.contrast);
  if (filters.saturation !== 0) applySaturation(data, filters.saturation);
  if (filters.grayscale) applyGrayscale(data);
  if (filters.sepia) applySepia(data);
  if (filters.invert) applyInvert(data);
  if (filters.blur > 0) data = applyBoxBlur(data, width, height, filters.blur);
  if (filters.sharpness > 0) data = applySharpen(data, width, height, filters.sharpness);

  const result = new ImageData(width, height);
  result.data.set(data);
  return result;
}
