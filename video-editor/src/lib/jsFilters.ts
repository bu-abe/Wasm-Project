import type { FilterSettings } from '../types'

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)))
}

function applyGrayscale(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722)
    data[i] = gray
    data[i + 1] = gray
    data[i + 2] = gray
  }
}

function applyBrightness(data: Uint8ClampedArray, value: number): void {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + value)
    data[i + 1] = clamp(data[i + 1] + value)
    data[i + 2] = clamp(data[i + 2] + value)
  }
}

function applyContrast(data: Uint8ClampedArray, value: number): void {
  const factor = (259 * (value + 255)) / (255 * (259 - value))
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128)
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128)
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128)
  }
}

function applySaturation(data: Uint8ClampedArray, value: number): void {
  const s = 1 + value / 100
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const gray = 0.2989 * r + 0.587 * g + 0.114 * b
    data[i] = clamp(gray + s * (r - gray))
    data[i + 1] = clamp(gray + s * (g - gray))
    data[i + 2] = clamp(gray + s * (b - gray))
  }
}

function applySepia(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    data[i] = clamp(r * 0.393 + g * 0.769 + b * 0.189)
    data[i + 1] = clamp(r * 0.349 + g * 0.686 + b * 0.168)
    data[i + 2] = clamp(r * 0.272 + g * 0.534 + b * 0.131)
  }
}

function applyInvert(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]
    data[i + 1] = 255 - data[i + 1]
    data[i + 2] = 255 - data[i + 2]
  }
}

function applyBlur(data: Uint8ClampedArray, width: number, height: number, radius: number): Uint8ClampedArray {
  if (radius === 0) return data
  const src = new Uint8ClampedArray(data)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sumR = 0, sumG = 0, sumB = 0, count = 0
      for (let ky = Math.max(0, y - radius); ky <= Math.min(height - 1, y + radius); ky++) {
        for (let kx = Math.max(0, x - radius); kx <= Math.min(width - 1, x + radius); kx++) {
          const idx = (ky * width + kx) * 4
          sumR += src[idx]
          sumG += src[idx + 1]
          sumB += src[idx + 2]
          count++
        }
      }
      const out = (y * width + x) * 4
      data[out] = sumR / count
      data[out + 1] = sumG / count
      data[out + 2] = sumB / count
    }
  }
  return data
}

export function applyJsFilters(
  imageData: ImageData,
  filters: FilterSettings
): ImageData {
  const { data, width, height } = imageData

  if (filters.grayscale) applyGrayscale(data)
  if (filters.sepia) applySepia(data)
  if (filters.invert) applyInvert(data)
  if (filters.brightness !== 0) applyBrightness(data, filters.brightness)
  if (filters.contrast !== 0) applyContrast(data, filters.contrast)
  if (filters.saturation !== 0) applySaturation(data, filters.saturation)
  if (filters.blur > 0) applyBlur(data, width, height, filters.blur)

  return imageData
}
