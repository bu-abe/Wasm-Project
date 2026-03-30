import type { BenchmarkResult, Stats } from "../hooks/useBenchmark";

function SpeedBadge({ baseline, target }: { baseline: number; target: number }) {
  const ratio = baseline / target;
  const isFaster = ratio >= 1;
  return (
    <span
      className={`text-[10px] font-bold font-mono px-1 rounded ${
        isFaster ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
      }`}
    >
      {isFaster
        ? `${ratio.toFixed(1)}x 速い`
        : `${(1 / ratio).toFixed(1)}x 遅い`}
    </span>
  );
}

function StatBar({
  label,
  stats,
  maxTime,
  color,
  jsMedian,
}: {
  label: string;
  stats: Stats;
  maxTime: number;
  color: string;
  jsMedian: number;
}) {
  const barWidth = maxTime > 0 ? (stats.median / maxTime) * 100 : 0;
  const minWidth = maxTime > 0 ? (stats.min / maxTime) * 100 : 0;
  const maxWidth = maxTime > 0 ? (stats.max / maxTime) * 100 : 0;

  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center">
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-mono ${color}`}>
            {stats.median.toFixed(2)} ms
          </span>
          {label !== "JS" && (
            <SpeedBadge baseline={jsMedian} target={stats.median} />
          )}
        </div>
      </div>
      <div className="relative h-2.5 bg-gray-700/50 rounded overflow-hidden">
        <div
          className="absolute h-full opacity-20 rounded"
          style={{
            left: `${minWidth}%`,
            width: `${maxWidth - minWidth}%`,
            backgroundColor: "currentColor",
          }}
        />
        <div
          className={`h-full rounded transition-all duration-300 ${color.replace("text-", "bg-")}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div className="flex gap-2 text-[10px] text-gray-500 font-mono">
        <span>avg {stats.avg.toFixed(2)}</span>
        <span>min {stats.min.toFixed(2)}</span>
        <span>max {stats.max.toFixed(2)}</span>
      </div>
    </div>
  );
}

interface BenchmarkOverlayProps {
  result: BenchmarkResult | null;
  isRunning: boolean;
  progress: number;
  iterations: number;
  onClose: () => void;
}

export function BenchmarkOverlay({
  result,
  isRunning,
  progress,
  iterations,
  onClose,
}: BenchmarkOverlayProps) {
  return (
    <div className="absolute top-3 right-3 z-10">
      <div className="w-72 bg-gray-800/95 backdrop-blur border border-gray-700 rounded-lg shadow-2xl">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            ベンチマーク
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-sm leading-none transition"
          >
            &times;
          </button>
        </div>

        <div className="p-3 space-y-3">
          {isRunning && (
            <>
              <div className="text-xs text-gray-400 text-center">
                計測中... ({progress}/{iterations})
              </div>
              <div className="h-1 bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-200"
                  style={{ width: `${(progress / iterations) * 100}%` }}
                />
              </div>
            </>
          )}

          {result && !isRunning && (
            <>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>{result.pixelCount.toLocaleString()} px</span>
                <span>{iterations} 回・中央値</span>
              </div>

              {(() => {
                const maxTime = Math.max(
                  result.js.max,
                  result.wasm.max,
                  result.webgl.max,
                  result.wasmWorker.max
                );
                return (
                  <div className="space-y-2">
                    <StatBar
                      label="JS"
                      stats={result.js}
                      maxTime={maxTime}
                      color="text-yellow-400"
                      jsMedian={result.js.median}
                    />
                    <StatBar
                      label="WASM"
                      stats={result.wasm}
                      maxTime={maxTime}
                      color="text-blue-400"
                      jsMedian={result.js.median}
                    />
                    <StatBar
                      label="WebGL"
                      stats={result.webgl}
                      maxTime={maxTime}
                      color="text-green-400"
                      jsMedian={result.js.median}
                    />
                    <StatBar
                      label="WASM+Worker"
                      stats={result.wasmWorker}
                      maxTime={maxTime}
                      color="text-purple-400"
                      jsMedian={result.js.median}
                    />
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
