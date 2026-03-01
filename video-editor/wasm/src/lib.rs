use wasm_bindgen::prelude::*;

/// グレースケールフィルター: 各ピクセルをグレースケールに変換
#[wasm_bindgen]
pub fn grayscale_filter(pixels: &mut [u8]) {
    let len = pixels.len();
    let mut i = 0;
    while i + 3 < len {
        let r = pixels[i] as u32;
        let g = pixels[i + 1] as u32;
        let b = pixels[i + 2] as u32;
        // ITU-R BT.709 輝度係数
        let gray = ((r * 2126 + g * 7152 + b * 722) / 10000) as u8;
        pixels[i] = gray;
        pixels[i + 1] = gray;
        pixels[i + 2] = gray;
        // pixels[i + 3] はアルファ値: 変更しない
        i += 4;
    }
}

/// 明るさフィルター: value (-255..255)
#[wasm_bindgen]
pub fn brightness_filter(pixels: &mut [u8], value: i32) {
    let len = pixels.len();
    let mut i = 0;
    while i + 3 < len {
        pixels[i] = clamp(pixels[i] as i32 + value);
        pixels[i + 1] = clamp(pixels[i + 1] as i32 + value);
        pixels[i + 2] = clamp(pixels[i + 2] as i32 + value);
        i += 4;
    }
}

/// コントラストフィルター: value (-100..100)
#[wasm_bindgen]
pub fn contrast_filter(pixels: &mut [u8], value: i32) {
    let factor = (259.0 * (value as f64 + 255.0)) / (255.0 * (259.0 - value as f64));
    let len = pixels.len();
    let mut i = 0;
    while i + 3 < len {
        pixels[i] = clamp((factor * (pixels[i] as f64 - 128.0) + 128.0) as i32);
        pixels[i + 1] = clamp((factor * (pixels[i + 1] as f64 - 128.0) + 128.0) as i32);
        pixels[i + 2] = clamp((factor * (pixels[i + 2] as f64 - 128.0) + 128.0) as i32);
        i += 4;
    }
}

/// 彩度フィルター: value (-100..100)
#[wasm_bindgen]
pub fn saturation_filter(pixels: &mut [u8], value: i32) {
    let s = 1.0 + value as f64 / 100.0;
    let len = pixels.len();
    let mut i = 0;
    while i + 3 < len {
        let r = pixels[i] as f64;
        let g = pixels[i + 1] as f64;
        let b = pixels[i + 2] as f64;
        let gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        pixels[i] = clamp((gray + s * (r - gray)) as i32);
        pixels[i + 1] = clamp((gray + s * (g - gray)) as i32);
        pixels[i + 2] = clamp((gray + s * (b - gray)) as i32);
        i += 4;
    }
}

/// セピアフィルター
#[wasm_bindgen]
pub fn sepia_filter(pixels: &mut [u8]) {
    let len = pixels.len();
    let mut i = 0;
    while i + 3 < len {
        let r = pixels[i] as f64;
        let g = pixels[i + 1] as f64;
        let b = pixels[i + 2] as f64;
        pixels[i] = clamp((r * 0.393 + g * 0.769 + b * 0.189) as i32);
        pixels[i + 1] = clamp((r * 0.349 + g * 0.686 + b * 0.168) as i32);
        pixels[i + 2] = clamp((r * 0.272 + g * 0.534 + b * 0.131) as i32);
        i += 4;
    }
}

/// 反転フィルター
#[wasm_bindgen]
pub fn invert_filter(pixels: &mut [u8]) {
    let len = pixels.len();
    let mut i = 0;
    while i + 3 < len {
        pixels[i] = 255 - pixels[i];
        pixels[i + 1] = 255 - pixels[i + 1];
        pixels[i + 2] = 255 - pixels[i + 2];
        i += 4;
    }
}

/// ボックスブラーフィルター: src から dst へ (radius: 0..20)
#[wasm_bindgen]
pub fn blur_filter(src: &[u8], dst: &mut [u8], width: u32, height: u32, radius: u32) {
    if radius == 0 {
        dst.copy_from_slice(src);
        return;
    }

    let w = width as usize;
    let h = height as usize;
    let r = radius as usize;

    for y in 0..h {
        for x in 0..w {
            let mut sum_r: u32 = 0;
            let mut sum_g: u32 = 0;
            let mut sum_b: u32 = 0;
            let mut count: u32 = 0;

            let y_start = if y >= r { y - r } else { 0 };
            let y_end = (y + r + 1).min(h);
            let x_start = if x >= r { x - r } else { 0 };
            let x_end = (x + r + 1).min(w);

            for ky in y_start..y_end {
                for kx in x_start..x_end {
                    let idx = (ky * w + kx) * 4;
                    sum_r += src[idx] as u32;
                    sum_g += src[idx + 1] as u32;
                    sum_b += src[idx + 2] as u32;
                    count += 1;
                }
            }

            let out_idx = (y * w + x) * 4;
            dst[out_idx] = (sum_r / count) as u8;
            dst[out_idx + 1] = (sum_g / count) as u8;
            dst[out_idx + 2] = (sum_b / count) as u8;
            dst[out_idx + 3] = src[out_idx + 3];
        }
    }
}

#[inline]
fn clamp(v: i32) -> u8 {
    v.clamp(0, 255) as u8
}
