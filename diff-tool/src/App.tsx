import { useState } from "react";
import { diff as wasmDiff } from "./wasmDiff";

type EditType = 0 | 1 | 2; // KEEP, ADD, DEL
interface Edit {
  type: EditType;
  text: string;
}

function App() {
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [edits, setEdits] = useState<Edit[]>([]);
  const [time, setTime] = useState<number | null>(null);

  const handleDiff = () => {
    const start = performance.now();
    const result = wasmDiff(oldText, newText);
    const elapsed = performance.now() - start;

    setEdits(JSON.parse(result));
    setTime(elapsed);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Diff Tool（WASM vs JS）</h1>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        <div>
          <h3>古いテキスト</h3>
          <textarea
            value={oldText}
            onChange={(e) => setOldText(e.target.value)}
            style={{ width: "100%", height: "200px" }}
          />
        </div>
        <div>
          <h3>新しいテキスト</h3>
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            style={{ width: "100%", height: "200px" }}
          />
        </div>
      </div>
      <button style={{ marginTop: "16px" }} onClick={handleDiff}>
        差分を計算
      </button>

      {time !== null && (
        <p style={{ marginTop: "8px", color: "#666" }}>
          WASM処理時間: {time.toFixed(3)} ms
        </p>
      )}

      {edits.length > 0 && (
        <pre
          style={{
            marginTop: "16px",
            padding: "16px",
            background: "#1e1e1e",
            color: "#d4d4d4",
            borderRadius: "8px",
            overflow: "auto",
            lineHeight: "1.6",
          }}
        >
          {edits.map((edit, i) => {
            const style =
              edit.type === 1
                ? { color: "#4ec9b0", backgroundColor: "rgba(78,201,176,0.1)" }
                : edit.type === 2
                  ? { color: "#f14c4c", backgroundColor: "rgba(241,76,76,0.1)" }
                  : {};
            const prefix = edit.type === 1 ? "+" : edit.type === 2 ? "-" : " ";
            return (
              <div key={i} style={{ ...style, padding: "0 8px" }}>
                {prefix} {edit.text}
              </div>
            );
          })}
        </pre>
      )}
    </div>
  );
}

export default App;
