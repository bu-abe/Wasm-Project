import { useEditorStore } from "../store/editorStore";
import { AdjustmentSlider } from "./AdjustmentSlider";
import { useBenchmark } from "../hooks/useBenchmark";

export function FilterPanel() {
  const { filters, updateFilter, resetFilters } = useEditorStore();
  const { runBenchmark, result, isRunning } = useBenchmark();

  return (
    <div className="md:w-64 w-full md:h-auto h-52 bg-gray-800 p-4 overflow-y-auto md:border-r md:border-t-0 border-t border-gray-700 flex flex-col shrink-0">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        調整
      </h2>

      <AdjustmentSlider
        label="明るさ"
        value={filters.brightness}
        min={-100}
        max={100}
        onChange={(v) => updateFilter("brightness", v)}
      />
      <AdjustmentSlider
        label="コントラスト"
        value={filters.contrast}
        min={-100}
        max={100}
        onChange={(v) => updateFilter("contrast", v)}
      />
      <AdjustmentSlider
        label="彩度"
        value={filters.saturation}
        min={-100}
        max={100}
        onChange={(v) => updateFilter("saturation", v)}
      />
      <AdjustmentSlider
        label="ぼかし"
        value={filters.blur}
        min={0}
        max={20}
        onChange={(v) => updateFilter("blur", v)}
      />
      <AdjustmentSlider
        label="シャープ"
        value={filters.sharpness}
        min={0}
        max={100}
        onChange={(v) => updateFilter("sharpness", v)}
      />

      <div className="border-t border-gray-700 mt-4 pt-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          エフェクト
        </h2>
        <label className="flex items-center gap-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.grayscale}
            onChange={(e) => updateFilter("grayscale", e.target.checked)}
            className="rounded accent-blue-500"
          />
          <span className="text-sm text-gray-300">グレースケール</span>
        </label>
        <label className="flex items-center gap-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.sepia}
            onChange={(e) => updateFilter("sepia", e.target.checked)}
            className="rounded accent-blue-500"
          />
          <span className="text-sm text-gray-300">セピア</span>
        </label>
        <label className="flex items-center gap-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.invert}
            onChange={(e) => updateFilter("invert", e.target.checked)}
            className="rounded accent-blue-500"
          />
          <span className="text-sm text-gray-300">反転</span>
        </label>
      </div>

      <div className="mt-auto pt-4 flex flex-col gap-2">
        <button
          onClick={resetFilters}
          className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition"
        >
          リセット
        </button>

        <div className="border-t border-gray-700 pt-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            JS vs WASM vs WebGL
          </h2>
          <button
            onClick={runBenchmark}
            disabled={isRunning}
            className="w-full px-3 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-sm rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? "計測中..." : "ベンチマーク実行"}
          </button>

          {result && (
            <div className="mt-2 text-xs space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>画素数</span>
                <span>{result.pixelCount.toLocaleString()} px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-400">JS</span>
                <span className="text-yellow-400 font-mono">{result.jsTime.toFixed(2)} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-400">WASM</span>
                <span className="text-blue-400 font-mono">{result.wasmTime.toFixed(2)} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">WebGL</span>
                <span className="text-green-400 font-mono">{result.webglTime.toFixed(2)} ms</span>
              </div>
              <div className="flex flex-col gap-0.5 border-t border-gray-700 pt-1 mt-1">
                <div className="flex justify-between">
                  <span className="text-gray-300">WASM vs JS</span>
                  <span className={`font-bold font-mono ${result.speedupWasm >= 1 ? "text-green-400" : "text-red-400"}`}>
                    {result.speedupWasm >= 1
                      ? `${result.speedupWasm.toFixed(2)}x 速い`
                      : `${(1 / result.speedupWasm).toFixed(2)}x 遅い`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">WebGL vs JS</span>
                  <span className={`font-bold font-mono ${result.speedupWebGL >= 1 ? "text-green-400" : "text-red-400"}`}>
                    {result.speedupWebGL >= 1
                      ? `${result.speedupWebGL.toFixed(2)}x 速い`
                      : `${(1 / result.speedupWebGL).toFixed(2)}x 遅い`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">WebGL vs WASM</span>
                  <span className={`font-bold font-mono ${result.speedupWebGLvsWasm >= 1 ? "text-green-400" : "text-red-400"}`}>
                    {result.speedupWebGLvsWasm >= 1
                      ? `${result.speedupWebGLvsWasm.toFixed(2)}x 速い`
                      : `${(1 / result.speedupWebGLvsWasm).toFixed(2)}x 遅い`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
