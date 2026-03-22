use wasm_bindgen::prelude::*;

/// 背景ぼかしフィルター: セグメンテーションマスクを使って背景のみにぼかしを適用
/// mask: 1byte/pixel (0=背景, 255=人物)
/// 3パス Box Blur（ガウシアン近似）+ マスク合成
#[wasm_bindgen]
pub fn background_blur_filter(
    src: &[u8],
    dst: &mut [u8],
    mask: &[u8],
    width: u32,
    height: u32,
    blur_radius: u32,
) {
    let w = width as usize;
    let h = height as usize;
    let pixel_count = w * h;
    let len = pixel_count * 4;

    if blur_radius == 0 || src.len() < len || dst.len() < len || mask.len() < pixel_count {
        dst[..src.len()].copy_from_slice(src);
        return;
    }

    // 3パス Box Blur でガウシアンを近似
    // 各パスの半径 = 元の半径 / 3 (最低1)
    let pass_radius = ((blur_radius / 3) as usize).max(1);

    let mut buf_a = src.to_vec();
    let mut buf_b = vec![0u8; len];

    for _pass in 0..3 {
        // 水平パス: buf_a → buf_b
        box_blur_horizontal(&buf_a, &mut buf_b, w, h, pass_radius);
        // 垂直パス: buf_b → buf_a
        box_blur_vertical(&buf_b, &mut buf_a, w, h, pass_radius);
    }

    // buf_a にぼかし結果が入っている
    // マスク合成: dst = src * (mask/255) + blurred * (1 - mask/255)
    for i in 0..pixel_count {
        let alpha = mask[i] as f32 / 255.0; // 1.0 = 人物(元画像), 0.0 = 背景(ぼかし)
        let inv_alpha = 1.0 - alpha;
        let pi = i * 4;

        dst[pi] = (src[pi] as f32 * alpha + buf_a[pi] as f32 * inv_alpha) as u8;
        dst[pi + 1] = (src[pi + 1] as f32 * alpha + buf_a[pi + 1] as f32 * inv_alpha) as u8;
        dst[pi + 2] = (src[pi + 2] as f32 * alpha + buf_a[pi + 2] as f32 * inv_alpha) as u8;
        dst[pi + 3] = src[pi + 3]; // アルファチャネルはそのまま
    }
}

/// 水平方向 Box Blur (分離フィルタ)
fn box_blur_horizontal(src: &[u8], dst: &mut [u8], w: usize, h: usize, r: usize) {
    let diameter = (2 * r + 1) as f32;

    for y in 0..h {
        let row = y * w * 4;
        let mut sum_r: u32 = 0;
        let mut sum_g: u32 = 0;
        let mut sum_b: u32 = 0;

        // 初期ウィンドウ: [0, r] を積算
        for x in 0..=r.min(w - 1) {
            let idx = row + x * 4;
            sum_r += src[idx] as u32;
            sum_g += src[idx + 1] as u32;
            sum_b += src[idx + 2] as u32;
        }
        // 左端は境界外を最端ピクセルで埋める
        if r > 0 {
            let idx = row;
            sum_r += src[idx] as u32 * r as u32;
            sum_g += src[idx + 1] as u32 * r as u32;
            sum_b += src[idx + 2] as u32 * r as u32;
        }

        for x in 0..w {
            let out_idx = row + x * 4;
            dst[out_idx] = (sum_r as f32 / diameter) as u8;
            dst[out_idx + 1] = (sum_g as f32 / diameter) as u8;
            dst[out_idx + 2] = (sum_b as f32 / diameter) as u8;
            dst[out_idx + 3] = src[out_idx + 3];

            // スライディングウィンドウ: 右端を追加、左端を除去
            let right = (x + r + 1).min(w - 1);
            let left = if x >= r { x - r } else { 0 };

            let add_idx = row + right * 4;
            let rem_idx = row + left * 4;

            sum_r += src[add_idx] as u32;
            sum_r -= src[rem_idx] as u32;
            sum_g += src[add_idx + 1] as u32;
            sum_g -= src[rem_idx + 1] as u32;
            sum_b += src[add_idx + 2] as u32;
            sum_b -= src[rem_idx + 2] as u32;
        }
    }
}

/// 垂直方向 Box Blur (分離フィルタ)
fn box_blur_vertical(src: &[u8], dst: &mut [u8], w: usize, h: usize, r: usize) {
    let diameter = (2 * r + 1) as f32;

    for x in 0..w {
        let col = x * 4;
        let mut sum_r: u32 = 0;
        let mut sum_g: u32 = 0;
        let mut sum_b: u32 = 0;

        // 初期ウィンドウ: [0, r] を積算
        for y in 0..=r.min(h - 1) {
            let idx = y * w * 4 + col;
            sum_r += src[idx] as u32;
            sum_g += src[idx + 1] as u32;
            sum_b += src[idx + 2] as u32;
        }
        // 上端は境界外を最端ピクセルで埋める
        if r > 0 {
            let idx = col;
            sum_r += src[idx] as u32 * r as u32;
            sum_g += src[idx + 1] as u32 * r as u32;
            sum_b += src[idx + 2] as u32 * r as u32;
        }

        for y in 0..h {
            let out_idx = y * w * 4 + col;
            dst[out_idx] = (sum_r as f32 / diameter) as u8;
            dst[out_idx + 1] = (sum_g as f32 / diameter) as u8;
            dst[out_idx + 2] = (sum_b as f32 / diameter) as u8;
            dst[out_idx + 3] = src[out_idx + 3];

            // スライディングウィンドウ: 下端を追加、上端を除去
            let bottom = (y + r + 1).min(h - 1);
            let top = if y >= r { y - r } else { 0 };

            let add_idx = bottom * w * 4 + col;
            let rem_idx = top * w * 4 + col;

            sum_r += src[add_idx] as u32;
            sum_r -= src[rem_idx] as u32;
            sum_g += src[add_idx + 1] as u32;
            sum_g -= src[rem_idx + 1] as u32;
            sum_b += src[add_idx + 2] as u32;
            sum_b -= src[rem_idx + 2] as u32;
        }
    }
}
