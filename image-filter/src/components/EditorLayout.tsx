import { useEffect } from "react";
import { useImageEditor } from "../hooks/useImageEditor";
import { useEditorStore } from "../store/editorStore";
import { Toolbar } from "./Toolbar";
import { FilterPanel } from "./FilterPanel";
import { Canvas } from "./Canvas";

export function EditorLayout() {
  const { canvasRef, loading, error, handleImageUpload, handleDownload, hasImage } =
    useImageEditor();
  const { undo, redo } = useEditorStore();

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
      />
      <div className="flex flex-1 overflow-hidden flex-col-reverse md:flex-row">
        {hasImage && <FilterPanel />}
        <Canvas canvasRef={canvasRef} hasImage={hasImage} />
      </div>
    </div>
  );
}
