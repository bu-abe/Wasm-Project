import { useState } from "react";
import { diff as wasmDiff } from "./wasmDiff";
import { diff as jsDiff, type Edit } from "./jsDiff";
import { generateTextPair } from "./generateText";
import { DiffView } from "./DiffView";

const BENCH_SIZES = [100, 500, 1000, 5000, 10000];

interface BenchResult {
  lines: number;
  wasmMs: number;
  jsMs: number;
}

function App() {
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [edits, setEdits] = useState<Edit[]>([]);
  const [wasmTime, setWasmTime] = useState<number | null>(null);
  const [jsTime, setJsTime] = useState<number | null>(null);
  const [benchResults, setBenchResults] = useState<BenchResult[]>([]);
  const [benchRunning, setBenchRunning] = useState(false);

  const handleDiff = () => {
    const wasmStart = performance.now();
    const wasmResult = wasmDiff(oldText, newText);
    const wasmElapsed = performance.now() - wasmStart;
    const wasmEdits: Edit[] = JSON.parse(wasmResult);

    const jsStart = performance.now();
    jsDiff(oldText, newText);
    const jsElapsed = performance.now() - jsStart;

    setEdits(wasmEdits);
    setWasmTime(wasmElapsed);
    setJsTime(jsElapsed);
  };

  const handleGenerate = (lineCount: number) => {
    const { oldText: o, newText: n } = generateTextPair(lineCount);
    setOldText(o);
    setNewText(n);
    setEdits([]);
    setWasmTime(null);
    setJsTime(null);
  };

  const handleBenchmark = () => {
    setBenchRunning(true);
    // UIを更新させるためにsetTimeoutで遅延
    setTimeout(() => {
      const results: BenchResult[] = [];
      for (const lines of BENCH_SIZES) {
        const { oldText: o, newText: n } = generateTextPair(lines);

        const wasmStart = performance.now();
        wasmDiff(o, n);
        const wasmMs = performance.now() - wasmStart;

        const jsStart = performance.now();
        jsDiff(o, n);
        const jsMs = performance.now() - jsStart;

        results.push({ lines, wasmMs, jsMs });
      }
      setBenchResults(results);
      setBenchRunning(false);
    }, 50);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Diff Tool（WASM vs JS）</h1>

      {/* テキスト入力 */}
      <div className="editor-grid">
        <div className="editor-pane">
          <label className="editor-label">Original</label>
          <textarea
            className="editor-textarea"
            value={oldText}
            onChange={(e) => setOldText(e.target.value)}
            placeholder="古いテキストを入力..."
            spellCheck={false}
          />
        </div>
        <div className="editor-pane">
          <label className="editor-label">Modified</label>
          <textarea
            className="editor-textarea"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="新しいテキストを入力..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* 操作ボタン */}
      <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={handleDiff}>差分を計算</button>
        {BENCH_SIZES.slice(0, 3).map((n) => (
          <button key={n} onClick={() => handleGenerate(n)}>
            {n}行生成
          </button>
        ))}
        <button onClick={handleBenchmark} disabled={benchRunning}>
          {benchRunning ? "計測中..." : "ベンチマーク実行"}
        </button>
      </div>

      {/* diff 結果の処理時間 */}
      {wasmTime !== null && jsTime !== null && (
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            gap: "24px",
            fontSize: "14px",
          }}
        >
          <span style={{ color: "#4ec9b0" }}>
            WASM: {wasmTime.toFixed(3)} ms
          </span>
          <span style={{ color: "#569cd6" }}>
            JS: {jsTime.toFixed(3)} ms
          </span>
          <span style={{ color: "#d4d4d4" }}>
            （{wasmTime < jsTime ? "WASM" : "JS"} が{" "}
            {(Math.max(wasmTime, jsTime) / Math.min(wasmTime, jsTime)).toFixed(1)}
            x 速い）
          </span>
        </div>
      )}

      {/* ベンチマーク結果 */}
      {benchResults.length > 0 && (
        <div style={{ marginTop: "24px", textAlign: "left" }}>
          <h3>ベンチマーク結果</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
              fontFamily: "var(--mono)",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ textAlign: "right", padding: "8px" }}>行数</th>
                <th style={{ textAlign: "right", padding: "8px", color: "#4ec9b0" }}>WASM</th>
                <th style={{ textAlign: "right", padding: "8px", color: "#569cd6" }}>JS</th>
                <th style={{ textAlign: "right", padding: "8px" }}>倍率</th>
                <th style={{ textAlign: "left", padding: "8px", width: "40%" }}>比較</th>
              </tr>
            </thead>
            <tbody>
              {benchResults.map((r) => {
                const maxMs = Math.max(r.wasmMs, r.jsMs);
                const ratio = r.wasmMs < r.jsMs
                  ? `JS の ${(r.jsMs / r.wasmMs).toFixed(1)}x 速い`
                  : `JS の ${(r.wasmMs / r.jsMs).toFixed(1)}x 遅い`;
                return (
                  <tr key={r.lines} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px", textAlign: "right" }}>
                      {r.lines.toLocaleString()}
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", color: "#4ec9b0" }}>
                      {r.wasmMs.toFixed(2)} ms
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", color: "#569cd6" }}>
                      {r.jsMs.toFixed(2)} ms
                    </td>
                    <td style={{ padding: "8px", textAlign: "right" }}>
                      {ratio}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div
                          style={{
                            height: "8px",
                            width: `${(r.wasmMs / maxMs) * 100}%`,
                            backgroundColor: "#4ec9b0",
                            borderRadius: "2px",
                          }}
                        />
                        <div
                          style={{
                            height: "8px",
                            width: `${(r.jsMs / maxMs) * 100}%`,
                            backgroundColor: "#569cd6",
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* diff 表示 */}
      <DiffView edits={edits} />
    </div>
  );
}

export default App;
