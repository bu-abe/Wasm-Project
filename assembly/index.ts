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
