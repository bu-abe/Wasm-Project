const subjects = [
  "ユーザーが", "システムが", "サーバーが", "クライアントが", "管理者が",
  "アプリケーションが", "データベースが", "プロセスが", "モジュールが", "APIが",
];

const verbs = [
  "リクエストを送信する", "データを取得する", "ファイルを読み込む",
  "エラーを検出する", "ログを記録する", "設定を更新する",
  "キャッシュをクリアする", "接続を確立する", "認証を行う",
  "レスポンスを返す", "処理を開始する", "結果を保存する",
  "メモリを解放する", "イベントを発火する", "状態を変更する",
  "バリデーションを実行する", "トークンを検証する", "セッションを管理する",
];

const conditions = [
  "タイムアウトが発生した場合、", "権限が不足している場合、",
  "初回アクセスの場合、", "データが存在しない場合、",
  "リトライ回数を超えた場合、", "バージョンが異なる場合、",
  "ネットワークが不安定な場合、", "負荷が高い場合、",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSentence(): string {
  if (Math.random() < 0.3) {
    return pick(conditions) + pick(subjects) + pick(verbs);
  }
  return pick(subjects) + pick(verbs);
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
    const line = randomSentence();
    oldLines.push(line);

    if (Math.random() < changeRate) {
      const action = Math.random();
      if (action < 0.33) {
        // 変更
        newLines.push(randomSentence());
      } else if (action < 0.66) {
        // 削除（newに追加しない）
      } else {
        // 追加
        newLines.push(line);
        newLines.push(randomSentence());
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
