import { useEffect, useState } from "react";
import { useImageEditor } from "../hooks/useImageEditor";
import { useEditorStore } from "../store/editorStore";
import { useBenchmark } from "../hooks/useBenchmark";
import { Toolbar } from "./Toolbar";
import { FilterPanel } from "./FilterPanel";
import { Canvas } from "./Canvas";
import { BenchmarkOverlay } from "./BenchmarkOverlay";

export function EditorLayout() {
  const { canvasRef, loading, error, handleImageUpload, handleDownload, hasImage } =
    useImageEditor();
  const { undo, redo } = useEditorStore();
  const { runBenchmark, result, isRunning, progress, iterations } = useBenchmark();
  const [showBenchmark, setShowBenchmark] = useState(false);

  const handleBenchmark = () => {
    setShowBenchmark(true);
    runBenchmark();
  };

  // キーボードショートカット
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-gray-400">
        WASM モジュールを読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-red-400">
        WASM の読み込みに失敗しました: {error.message}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <Toolbar
        onImageUpload={handleImageUpload}
        onDownload={handleDownload}
        hasImage={hasImage}
        onBenchmark={handleBenchmark}
        isBenchmarkRunning={isRunning}
      />
      <div className="flex flex-1 overflow-hidden flex-col-reverse md:flex-row">
        {hasImage && <FilterPanel />}
        <Canvas
          canvasRef={canvasRef}
          hasImage={hasImage}
          overlay={
            showBenchmark && (
              <BenchmarkOverlay
                result={result}
                isRunning={isRunning}
                progress={progress}
                iterations={iterations}
                onClose={() => setShowBenchmark(false)}
              />
            )
          }
        />
      </div>
    </div>
  );
}
