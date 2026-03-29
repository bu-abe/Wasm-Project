import { useState } from "react";
import type { Edit } from "./lib/jsDiff";
import "./DiffView.css";

type ViewMode = "unified" | "split";

interface DiffViewProps {
  edits: Edit[];
}

interface LineNum {
  old: number | null;
  new: number | null;
}

function computeLineNumbers(edits: Edit[]): LineNum[] {
  let oldLine = 1;
  let newLine = 1;
  return edits.map((edit) => {
    if (edit.type === 0) {
      return { old: oldLine++, new: newLine++ };
    } else if (edit.type === 2) {
      return { old: oldLine++, new: null };
    } else {
      return { old: null, new: newLine++ };
    }
  });
}

function UnifiedView({ edits }: { edits: Edit[] }) {
  const lineNums = computeLineNumbers(edits);

  return (
    <table className="diff-table">
      <tbody>
        {edits.map((edit, i) => {
          const cls =
            edit.type === 1 ? "diff-add" : edit.type === 2 ? "diff-del" : "";
          const prefix = edit.type === 1 ? "+" : edit.type === 2 ? "-" : " ";
          return (
            <tr key={i} className={cls}>
              <td className="diff-gutter diff-gutter-old">
                {lineNums[i].old ?? ""}
              </td>
              <td className="diff-gutter diff-gutter-new">
                {lineNums[i].new ?? ""}
              </td>
              <td className="diff-prefix">{prefix}</td>
              <td className="diff-content">{edit.text}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SplitView({ edits }: { edits: Edit[] }) {
  const leftLines: { num: number | null; text: string; type: Edit["type"] }[] =
    [];
  const rightLines: {
    num: number | null;
    text: string;
    type: Edit["type"];
  }[] = [];

  let oldLine = 1;
  let newLine = 1;

  // DEL と ADD のペアをマッチさせるため、一旦バッファする
  let i = 0;
  while (i < edits.length) {
    const edit = edits[i];
    if (edit.type === 0) {
      leftLines.push({ num: oldLine++, text: edit.text, type: 0 });
      rightLines.push({ num: newLine++, text: edit.text, type: 0 });
      i++;
    } else if (edit.type === 2) {
      // DEL の連続を集める
      const dels: Edit[] = [];
      while (i < edits.length && edits[i].type === 2) {
        dels.push(edits[i]);
        i++;
      }
      // 続く ADD を集める
      const adds: Edit[] = [];
      while (i < edits.length && edits[i].type === 1) {
        adds.push(edits[i]);
        i++;
      }
      const maxLen = Math.max(dels.length, adds.length);
      for (let j = 0; j < maxLen; j++) {
        leftLines.push(
          j < dels.length
            ? { num: oldLine++, text: dels[j].text, type: 2 }
            : { num: null, text: "", type: 0 },
        );
        rightLines.push(
          j < adds.length
            ? { num: newLine++, text: adds[j].text, type: 1 }
            : { num: null, text: "", type: 0 },
        );
      }
    } else {
      // 単独の ADD
      leftLines.push({ num: null, text: "", type: 0 });
      rightLines.push({ num: newLine++, text: edit.text, type: 1 });
      i++;
    }
  }

  return (
    <div className="diff-split">
      <table className="diff-table">
        <tbody>
          {leftLines.map((line, i) => (
            <tr key={i} className={line.type === 2 ? "diff-del" : ""}>
              <td className="diff-gutter">{line.num ?? ""}</td>
              <td className="diff-content">{line.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="diff-table">
        <tbody>
          {rightLines.map((line, i) => (
            <tr key={i} className={line.type === 1 ? "diff-add" : ""}>
              <td className="diff-gutter">{line.num ?? ""}</td>
              <td className="diff-content">{line.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DiffView({ edits }: DiffViewProps) {
  const [mode, setMode] = useState<ViewMode>("unified");

  if (edits.length === 0) return null;

  const addCount = edits.filter((e) => e.type === 1).length;
  const delCount = edits.filter((e) => e.type === 2).length;

  return (
    <div className="diff-container">
      <div className="diff-header">
        <div className="diff-stats">
          <span className="diff-stat-add">+{addCount}</span>
          <span className="diff-stat-del">-{delCount}</span>
        </div>
        <div className="diff-mode-toggle">
          <button
            className={mode === "unified" ? "active" : ""}
            onClick={() => setMode("unified")}
          >
            Unified
          </button>
          <button
            className={mode === "split" ? "active" : ""}
            onClick={() => setMode("split")}
          >
            Split
          </button>
        </div>
      </div>
      <div className="diff-body">
        {mode === "unified" ? (
          <UnifiedView edits={edits} />
        ) : (
          <SplitView edits={edits} />
        )}
      </div>
    </div>
  );
}
