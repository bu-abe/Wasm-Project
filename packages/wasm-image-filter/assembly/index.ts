// フィボナッチ数列を計算
export function fibonacci(n: i32): i32 {
  if (n <= 1) return n;

  let a: i32 = 0;
  let b: i32 = 1;

  for (let i: i32 = 2; i <= n; i++) {
    const temp: i32 = a + b;
    a = b;
    b = temp;
  }

  return b;
}

// 足し算（動作確認用）
export function add(a: i32, b: i32): i32 {
  return a + b;
}

// グレースケール処理
export function grayscaleFilter(offset: u32, length: u32): void {
  for (let i: u32 = offset; i < offset + length; i += 4) {
    const r = load<u8>(i);
    const g = load<u8>(i + 1);
    const b = load<u8>(i + 2);
    const gray: u8 = u8(f32(r) * 0.299 + f32(g) * 0.587 + f32(b) * 0.114);
    store<u8>(i, gray);
    store<u8>(i + 1, gray);
    store<u8>(i + 2, gray);
  }
}

// 明るさ調整 (value: -255〜255)
export function brightnessFilter(offset: u32, length: u32, value: i32): void {
  for (let i: u32 = offset; i < offset + length; i += 4) {
    const r = i32(load<u8>(i)) + value;
    const g = i32(load<u8>(i + 1)) + value;
    const b = i32(load<u8>(i + 2)) + value;
    store<u8>(i, u8(max(0, min(255, r))));
    store<u8>(i + 1, u8(max(0, min(255, g))));
    store<u8>(i + 2, u8(max(0, min(255, b))));
  }
}

// コントラスト調整 (factor: -100〜100 → 内部で変換)
export function contrastFilter(offset: u32, length: u32, value: i32): void {
  // value: -100〜100 → factor 計算
  const factor: f32 = f32(i32(259) * (value + i32(255))) / f32(i32(255) * (i32(259) - value));
  for (let i: u32 = offset; i < offset + length; i += 4) {
    const r = factor * (f32(load<u8>(i)) - 128.0) + 128.0;
    const g = factor * (f32(load<u8>(i + 1)) - 128.0) + 128.0;
    const b = factor * (f32(load<u8>(i + 2)) - 128.0) + 128.0;
    store<u8>(i, u8(max<f32>(0, min<f32>(255, r))));
    store<u8>(i + 1, u8(max<f32>(0, min<f32>(255, g))));
    store<u8>(i + 2, u8(max<f32>(0, min<f32>(255, b))));
  }
}

// 彩度調整 (value: -100〜100)
export function saturationFilter(offset: u32, length: u32, value: i32): void {
  const factor: f32 = (f32(value) + 100.0) / 100.0;
  for (let i: u32 = offset; i < offset + length; i += 4) {
    const r = f32(load<u8>(i));
    const g = f32(load<u8>(i + 1));
    const b = f32(load<u8>(i + 2));
    const gray: f32 = r * 0.299 + g * 0.587 + b * 0.114;
    const nr = gray + factor * (r - gray);
    const ng = gray + factor * (g - gray);
    const nb = gray + factor * (b - gray);
    store<u8>(i, u8(max<f32>(0, min<f32>(255, nr))));
    store<u8>(i + 1, u8(max<f32>(0, min<f32>(255, ng))));
    store<u8>(i + 2, u8(max<f32>(0, min<f32>(255, nb))));
  }
}

// セピア効果
export function sepiaFilter(offset: u32, length: u32): void {
  for (let i: u32 = offset; i < offset + length; i += 4) {
    const r = f32(load<u8>(i));
    const g = f32(load<u8>(i + 1));
    const b = f32(load<u8>(i + 2));
    const nr = r * 0.393 + g * 0.769 + b * 0.189;
    const ng = r * 0.349 + g * 0.686 + b * 0.168;
    const nb = r * 0.272 + g * 0.534 + b * 0.131;
    store<u8>(i, u8(min<f32>(255, nr)));
    store<u8>(i + 1, u8(min<f32>(255, ng)));
    store<u8>(i + 2, u8(min<f32>(255, nb)));
  }
}

// 色反転
export function invertFilter(offset: u32, length: u32): void {
  for (let i: u32 = offset; i < offset + length; i += 4) {
    store<u8>(i, 255 - load<u8>(i));
    store<u8>(i + 1, 255 - load<u8>(i + 1));
    store<u8>(i + 2, 255 - load<u8>(i + 2));
  }
}

// ボックスブラー (src→dst, スライディングウィンドウ方式)
// 水平パス(src→dst) → 垂直パス(dst→src) → src→dst にコピー
export function boxBlurFilter(
  src: u32,
  dst: u32,
  width: u32,
  height: u32,
  radius: u32
): void {
  const diameter: f32 = f32(radius * 2 + 1);

  // === 水平パス: src → dst ===
  for (let y: u32 = 0; y < height; y++) {
    let rSum: f32 = 0;
    let gSum: f32 = 0;
    let bSum: f32 = 0;
    let aSum: f32 = 0;

    // 最初のウィンドウを構築 (x=0 のための初期合計)
    for (let dx: i32 = -i32(radius); dx <= i32(radius); dx++) {
      const sx: u32 = u32(max(0, min(i32(width) - 1, dx)));
      const idx: u32 = src + (y * width + sx) * 4;
      rSum += f32(load<u8>(idx));
      gSum += f32(load<u8>(idx + 1));
      bSum += f32(load<u8>(idx + 2));
      aSum += f32(load<u8>(idx + 3));
    }

    // x=0 の結果を書き込み
    const outIdx0: u32 = dst + y * width * 4;
    store<u8>(outIdx0, u8(rSum / diameter));
    store<u8>(outIdx0 + 1, u8(gSum / diameter));
    store<u8>(outIdx0 + 2, u8(bSum / diameter));
    store<u8>(outIdx0 + 3, u8(aSum / diameter));

    // x=1〜 はスライド: 左端を引いて右端を足す
    for (let x: u32 = 1; x < width; x++) {
      // 左端: 抜けるピクセル (x - radius - 1)
      const removeX: u32 = u32(max(0, i32(x) - i32(radius) - 1));
      const removeIdx: u32 = src + (y * width + removeX) * 4;
      rSum -= f32(load<u8>(removeIdx));
      gSum -= f32(load<u8>(removeIdx + 1));
      bSum -= f32(load<u8>(removeIdx + 2));
      aSum -= f32(load<u8>(removeIdx + 3));

      // 右端: 入るピクセル (x + radius)
      const addX: u32 = u32(min(i32(width) - 1, i32(x) + i32(radius)));
      const addIdx: u32 = src + (y * width + addX) * 4;
      rSum += f32(load<u8>(addIdx));
      gSum += f32(load<u8>(addIdx + 1));
      bSum += f32(load<u8>(addIdx + 2));
      aSum += f32(load<u8>(addIdx + 3));

      const outIdx: u32 = dst + (y * width + x) * 4;
      store<u8>(outIdx, u8(rSum / diameter));
      store<u8>(outIdx + 1, u8(gSum / diameter));
      store<u8>(outIdx + 2, u8(bSum / diameter));
      store<u8>(outIdx + 3, u8(aSum / diameter));
    }
  }

  // === 垂直パス: dst → src (一時的にsrc領域を使う) ===
  for (let x: u32 = 0; x < width; x++) {
    let rSum: f32 = 0;
    let gSum: f32 = 0;
    let bSum: f32 = 0;
    let aSum: f32 = 0;

    // 最初のウィンドウを構築 (y=0 のための初期合計)
    for (let dy: i32 = -i32(radius); dy <= i32(radius); dy++) {
      const sy: u32 = u32(max(0, min(i32(height) - 1, dy)));
      const idx: u32 = dst + (sy * width + x) * 4;
      rSum += f32(load<u8>(idx));
      gSum += f32(load<u8>(idx + 1));
      bSum += f32(load<u8>(idx + 2));
      aSum += f32(load<u8>(idx + 3));
    }

    const outIdx0: u32 = src + x * 4;
    store<u8>(outIdx0, u8(rSum / diameter));
    store<u8>(outIdx0 + 1, u8(gSum / diameter));
    store<u8>(outIdx0 + 2, u8(bSum / diameter));
    store<u8>(outIdx0 + 3, u8(aSum / diameter));

    for (let y: u32 = 1; y < height; y++) {
      const removeY: u32 = u32(max(0, i32(y) - i32(radius) - 1));
      const removeIdx: u32 = dst + (removeY * width + x) * 4;
      rSum -= f32(load<u8>(removeIdx));
      gSum -= f32(load<u8>(removeIdx + 1));
      bSum -= f32(load<u8>(removeIdx + 2));
      aSum -= f32(load<u8>(removeIdx + 3));

      const addY: u32 = u32(min(i32(height) - 1, i32(y) + i32(radius)));
      const addIdx: u32 = dst + (addY * width + x) * 4;
      rSum += f32(load<u8>(addIdx));
      gSum += f32(load<u8>(addIdx + 1));
      bSum += f32(load<u8>(addIdx + 2));
      aSum += f32(load<u8>(addIdx + 3));

      const outIdx: u32 = src + (y * width + x) * 4;
      store<u8>(outIdx, u8(rSum / diameter));
      store<u8>(outIdx + 1, u8(gSum / diameter));
      store<u8>(outIdx + 2, u8(bSum / diameter));
      store<u8>(outIdx + 3, u8(aSum / diameter));
    }
  }

  // 結果が src にあるので dst にコピー
  memory.copy(dst, src, width * height * 4);
}

// シャープ化 (src→dst, amount: 0〜100)
export function sharpenFilter(
  src: u32,
  dst: u32,
  width: u32,
  height: u32,
  amount: i32
): void {
  const factor: f32 = f32(amount) / 100.0;
  // シャープ化カーネル: center = 1 + 4*factor, neighbors = -factor
  const center: f32 = 1.0 + 4.0 * factor;
  const edge: f32 = -factor;

  for (let y: u32 = 0; y < height; y++) {
    for (let x: u32 = 0; x < width; x++) {
      const idx: u32 = src + (y * width + x) * 4;

      for (let c: u32 = 0; c < 3; c++) {
        let val: f32 = center * f32(load<u8>(idx + c));

        // 上
        if (y > 0) {
          val += edge * f32(load<u8>(src + ((y - 1) * width + x) * 4 + c));
        } else {
          val += edge * f32(load<u8>(idx + c));
        }
        // 下
        if (y < height - 1) {
          val += edge * f32(load<u8>(src + ((y + 1) * width + x) * 4 + c));
        } else {
          val += edge * f32(load<u8>(idx + c));
        }
        // 左
        if (x > 0) {
          val += edge * f32(load<u8>(src + (y * width + x - 1) * 4 + c));
        } else {
          val += edge * f32(load<u8>(idx + c));
        }
        // 右
        if (x < width - 1) {
          val += edge * f32(load<u8>(src + (y * width + x + 1) * 4 + c));
        } else {
          val += edge * f32(load<u8>(idx + c));
        }

        store<u8>(dst + (y * width + x) * 4 + c, u8(max<f32>(0, min<f32>(255, val))));
      }
      // alpha をコピー
      store<u8>(dst + (y * width + x) * 4 + 3, load<u8>(idx + 3));
    }
  }
}
