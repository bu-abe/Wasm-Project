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

// 既存のコードはそのまま残す

// グレースケール処理
// pixelData: RGBA形式のピクセルデータ（長さは width * height * 4）
// width, height: 画像の幅と高さ
export function grayscaleFilter(
  pixelDataPtr: usize,
  pixelDataLength: u32
): void {
  const pixelData = changetype<Uint8Array>(pixelDataPtr);

  // 4バイト（RGBA）単位でループ
  for (let i: u32 = 0; i < pixelDataLength; i += 4) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];
    // A (alpha) はそのまま

    // グレースケール：加重平均
    // 人間の目の感度を考慮した係数
    const gray = u8(r * 0.299 + g * 0.587 + b * 0.114);

    pixelData[i] = gray;
    pixelData[i + 1] = gray;
    pixelData[i + 2] = gray;
    // pixelData[i + 3] は変更しない（アルファ値維持）
  }
}
