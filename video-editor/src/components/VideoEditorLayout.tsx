import { Toolbar } from "./Toolbar";
import { VideoCanvas } from "./VideoCanvas";
import { FilterPanel } from "./FilterPanel";
import type * as VideoWasmModule from "../wasm-pkg/video_filter.js"; // @ts-ignore - wasm-pack ビルド後に生成されるファイル

interface VideoEditorLayoutProps {
  wasmModule: typeof VideoWasmModule;
}

export function VideoEditorLayout({ wasmModule }: VideoEditorLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ヘッダー */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <h1 className="text-xl font-bold">Video Editor</h1>
          <span className="text-xs text-gray-500">
            Rust + wasm-pack WASM Filter Demo
          </span>
          {wasmModule && (
            <span className="text-xs text-green-400 ml-auto">
              WASM 準備完了
            </span>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        <Toolbar />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          <VideoCanvas wasmModule={wasmModule} />
          <FilterPanel />
        </div>
      </main>
    </div>
  );
}
