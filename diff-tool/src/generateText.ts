const words = [
  "const", "let", "function", "return", "if", "else", "for", "while",
  "import", "export", "class", "interface", "type", "async", "await",
  "try", "catch", "throw", "new", "this", "true", "false", "null",
  "console", "log", "error", "map", "filter", "reduce", "forEach",
  "push", "pop", "slice", "splice", "indexOf", "includes", "length",
  "value", "index", "result", "data", "item", "name", "count", "total",
];

function randomLine(): string {
  const len = 3 + Math.floor(Math.random() * 8);
  const tokens: string[] = [];
  for (let i = 0; i < len; i++) {
    tokens.push(words[Math.floor(Math.random() * words.length)]);
  }
  return tokens.join(" ");
}

/**
 * lineCount行のテキストペアを生成する。
 * changeRate (0~1) の割合で行を変更・追加・削除する。
 */
export function generateTextPair(
  lineCount: number,
  changeRate: number = 0.3,
): { oldText: string; newText: string } {
  const oldLines: string[] = [];
  const newLines: string[] = [];

  for (let i = 0; i < lineCount; i++) {
    const line = randomLine();
    oldLines.push(line);

    if (Math.random() < changeRate) {
      const action = Math.random();
      if (action < 0.33) {
        // 変更
        newLines.push(randomLine());
      } else if (action < 0.66) {
        // 削除（newに追加しない）
      } else {
        // 追加
        newLines.push(line);
        newLines.push(randomLine());
      }
    } else {
      newLines.push(line);
    }
  }

  return {
    oldText: oldLines.join("\n"),
    newText: newLines.join("\n"),
  };
}
