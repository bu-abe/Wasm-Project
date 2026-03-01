import { useRef } from 'react'
import { useVideoStore } from '../store/videoStore'

export function Toolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoUrl = useVideoStore((s) => s.videoUrl)
  const isPlaying = useVideoStore((s) => s.isPlaying)
  const renderMode = useVideoStore((s) => s.renderMode)
  const setVideoFile = useVideoStore((s) => s.setVideoFile)
  const clearVideo = useVideoStore((s) => s.clearVideo)
  const setIsPlaying = useVideoStore((s) => s.setIsPlaying)
  const setRenderMode = useVideoStore((s) => s.setRenderMode)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setVideoFile(file)
    // inputをリセットして同じファイルを再選択可能に
    e.target.value = ''
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* アップロードボタン */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
      >
        動画を開く
      </button>

      {/* Play / Pause */}
      <button
        disabled={!videoUrl}
        onClick={() => setIsPlaying(!isPlaying)}
        className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
      >
        {isPlaying ? '⏸ 一時停止' : '▶ 再生'}
      </button>

      {/* クリアボタン */}
      {videoUrl && (
        <button
          onClick={clearVideo}
          className="px-4 py-2 bg-gray-700 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          クリア
        </button>
      )}

      {/* JS / WASM 切替 */}
      <div className="ml-auto flex items-center gap-1 bg-gray-800 rounded-lg p-1">
        {(['js', 'wasm'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setRenderMode(mode)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              renderMode === mode
                ? mode === 'wasm'
                  ? 'bg-orange-500 text-white'
                  : 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {mode.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
