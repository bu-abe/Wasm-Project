// 差分の種類を表す定数
enum EditType {
  KEEP = 0, // 変更なし
  ADD = 1, // 追加された行
  DEL = 2, // 削除された行
}

// 1行分の差分情報を表す
class Edit {
  type: EditType;
  text: string;

  constructor(type: EditType, text: string) {
    this.type = type;
    this.text = text;
  }
}

// テキストを行ごとに分割する
function splitLines(text: string): string[] {
  return text.replaceAll("\r\n", "\n").split("\n");
}

// Myers diffのコア：編集距離を計算し、経路を記録する
function computeEditPath(oldLines: string[], newLines: string[]): i32[] {
  // 各テキストの行数
  const oldLen = oldLines.length;
  const newLen = newLines.length;

  const maxDist = oldLen + newLen; // 最大編集距離（合計行数）

  // 各対角線上での最大到達x座標を記録する配列
  const furthestX = new Array<i32>(2 * maxDist + 1).fill(0);

  // 各編集距離ごとのfurthestXのスナップショット（バックトラック用）
  const trace = new Array<Array<i32>>();

  // 編集距離dを0から増やしながら最短経路を探す
  for (let dist = 0; dist <= maxDist; dist++) {
    trace.push(furthestX.slice(0)); // 現在のfurthestXを記録しておく

    // 対角線番号は -dist 〜 +dist の範囲で2つおきに走査
    for (let diagonal = -dist; diagonal <= dist; diagonal += 2) {
      const idx = diagonal + maxDist;

      // 上から来るか（追加）、左から来るか（削除）を判断
      let x: i32;
      if (
        diagonal == -dist ||
        (diagonal != dist && furthestX[idx - 1] < furthestX[idx + 1])
      ) {
        x = furthestX[idx + 1]; // 上から来る → 新しいテキストの行を追加
      } else {
        x = furthestX[idx - 1] + 1; // 左から来る → 古いテキストの行を削除
      }
      let y = x - diagonal;

      // 同じ行が続く限り対角線を進む（変更なしの行をスキップ）
      while (x < oldLen && y < newLen && oldLines[x] == newLines[y]) {
        x++;
        y++;
      }

      furthestX[idx] = x;

      // 全行処理完了
      if (x >= oldLen && y >= newLen) {
        return trace.flat();
      }
    }
  }
  return trace.flat();
}

// traceを逆順に辿って実際の編集経路を復元する
function backtrack(
  oldLines: string[],
  newLines: string[],
  trace: Array<i32[]>,
  maxDist: i32,
): Edit[] {
  const result = new Array<Edit>();

  // 右下（ゴール）から開始
  let x = oldLines.length as i32;
  let y = newLines.length as i32;

  // traceを逆順に辿る
  for (let dist = trace.length - 1; dist >= 0; dist--) {
    const furthestX = trace[dist];
    const diagonal = x - y;
    const idx = diagonal + maxDist;

    // このdistのときどちらから来たかを判断
    const prevDiagonal =
      diagonal == -(dist as i32) ||
      (diagonal != (dist as i32) && furthestX[idx - 1] < furthestX[idx + 1])
        ? diagonal + 1 // 上から来た（ADD）
        : diagonal - 1; // 左から来た（DEL）

    const prevX = furthestX[(prevDiagonal + maxDist) as i32];
    const prevY = prevX - prevDiagonal;

    // 対角線を逆に辿る（KEEP）
    while (x > prevX && y > prevY) {
      x--;
      y--;
      result.push(new Edit(EditType.KEEP, oldLines[x]));
    }

    // どちらから来たかでADD or DEL
    if (dist > 0) {
      if (x == prevX) {
        // 上から来た → ADD
        y--;
        result.push(new Edit(EditType.ADD, newLines[y]));
      } else {
        // 左から来た → DEL
        x--;
        result.push(new Edit(EditType.DEL, oldLines[x]));
      }
    }
  }

  // 逆順に追加したので反転する
  result.reverse();
  return result;
}

// JS側から呼び出すエントリーポイント
// @returns JSON文字列 例: [{"type":1,"text":"追加行"},{"type":2,"text":"削除行"}]
export function diff(oldText: string, newText: string): string {
  // 行ごとに分割
  const oldLines = splitLines(oldText);
  const newLines = splitLines(newText);

  // 編集経路を計算
  const maxDist = (oldLines.length + newLines.length) as i32;
  const flatTrace = computeEditPath(oldLines, newLines);

  // flatTraceを2次元配列に戻す
  const traceSize = 2 * maxDist + 1;
  const trace = new Array<Array<i32>>();
  for (let i = 0; i < flatTrace.length; i += traceSize) {
    trace.push(flatTrace.slice(i, i + traceSize));
  }

  // バックトラックで編集経路を復元
  const edits = backtrack(oldLines, newLines, trace, maxDist);

  // JSON文字列として返す
  let json = "[";
  for (let i = 0; i < edits.length; i++) {
    if (i > 0) json += ",";
    json += `{"type":${edits[i].type},"text":"${edits[i].text}"}`;
  }
  json += "]";

  return json;
}
