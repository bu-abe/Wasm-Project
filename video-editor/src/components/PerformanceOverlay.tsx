import { useVideoStore } from '../store/videoStore'

export function PerformanceOverlay() {
  const perf = useVideoStore((s) => s.perf)
  const renderMode = useVideoStore((s) => s.renderMode)

  return (
    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-mono rounded px-2 py-1 space-y-0.5 pointer-events-none">
      <div className="flex gap-2 items-center">
        <span
          className={`px-1 rounded text-[10px] font-bold ${
            renderMode === 'wasm' ? 'bg-orange-500' : 'bg-blue-500'
          }`}
        >
          {renderMode.toUpperCase()}
        </span>
        <span>{perf.fps} FPS</span>
      </div>
      <div>{perf.msPerFrame.toFixed(1)} ms/frame</div>
    </div>
  )
}
