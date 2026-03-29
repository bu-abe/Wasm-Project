import { useState } from "react";
import { diff as wasmDiff, diffWithTiming, type WasmTiming } from "./wasmDiff";
import { diff as jsDiff, type Edit } from "./jsDiff";
import { generateTextPair } from "./generateText";
import { DiffView } from "./DiffView";

const BENCH_SIZES = [100, 500, 1000, 5000, 10000];

interface BenchResult {
  lines: number;
  wasmMs: number;
  wasmTiming: WasmTiming;
  jsMs: number;
  jsonParseMs: number;
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

        const { result: wasmResult, timing: wasmTiming } = diffWithTiming(o, n);
        const wasmMs = wasmTiming.totalMs;

        const jsonStart = performance.now();
        JSON.parse(wasmResult);
        const jsonParseMs = performance.now() - jsonStart;

        const jsStart = performance.now();
        jsDiff(o, n);
        const jsMs = performance.now() - jsStart;

        results.push({ lines, wasmMs, wasmTiming, jsMs, jsonParseMs });
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
                <th style={{ textAlign: "right", padding: "8px", color: "#4ec9b0" }}>WASM 合計</th>
                <th style={{ textAlign: "right", padding: "8px", color: "#e0a050" }}>↳ lower</th>
                <th style={{ textAlign: "right", padding: "8px", color: "#e0a050" }}>↳ exec</th>
                <th style={{ textAlign: "right", padding: "8px", color: "#e0a050" }}>↳ lift</th>
                <th style={{ textAlign: "right", padding: "8px", color: "#e0a050" }}>↳ JSON.parse</th>
                <th style={{ textAlign: "right", padding: "8px", color: "#569cd6" }}>JS 合計</th>
                <th style={{ textAlign: "left", padding: "8px", width: "30%" }}>内訳</th>
              </tr>
            </thead>
            <tbody>
              {benchResults.map((r) => {
                const wasmTotal = r.wasmTiming.totalMs + r.jsonParseMs;
                const segments = [
                  { label: "lower", ms: r.wasmTiming.lowerMs, color: "#e8733a" },
                  { label: "exec", ms: r.wasmTiming.execMs, color: "#4ec9b0" },
                  { label: "lift", ms: r.wasmTiming.liftMs, color: "#c084fc" },
                  { label: "parse", ms: r.jsonParseMs, color: "#e0a050" },
                ];
                return (
                  <tr key={r.lines} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px", textAlign: "right" }}>
                      {r.lines.toLocaleString()}
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", color: "#4ec9b0" }}>
                      {wasmTotal.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", color: "#e8733a" }}>
                      {r.wasmTiming.lowerMs.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", color: "#4ec9b0" }}>
                      {r.wasmTiming.execMs.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", color: "#c084fc" }}>
                      {r.wasmTiming.liftMs.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", color: "#e0a050" }}>
                      {r.jsonParseMs.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", color: "#569cd6" }}>
                      {r.jsMs.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <div style={{ display: "flex", height: "16px", borderRadius: "3px", overflow: "hidden" }}>
                        {segments.map((seg) => (
                          <div
                            key={seg.label}
                            title={`${seg.label}: ${seg.ms.toFixed(2)} ms`}
                            style={{
                              width: `${(seg.ms / wasmTotal) * 100}%`,
                              backgroundColor: seg.color,
                              minWidth: seg.ms > 0 ? "2px" : 0,
                            }}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: "8px", display: "flex", gap: "16px", fontSize: "12px" }}>
            <span><span style={{ color: "#e8733a" }}>■</span> lower (JS→WASM)</span>
            <span><span style={{ color: "#4ec9b0" }}>■</span> exec (diff計算)</span>
            <span><span style={{ color: "#c084fc" }}>■</span> lift (WASM→JS)</span>
            <span><span style={{ color: "#e0a050" }}>■</span> JSON.parse</span>
          </div>
        </div>
      )}

      {/* diff 表示 */}
      <DiffView edits={edits} />
    </div>
  );
}

export default App;
