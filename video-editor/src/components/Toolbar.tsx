import { useRef } from 'react'
import { useVideoStore } from '../store/videoStore'
import { useCamera } from '../hooks/useCamera'

export function Toolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoUrl = useVideoStore((s) => s.videoUrl)
  const isPlaying = useVideoStore((s) => s.isPlaying)
  const renderMode = useVideoStore((s) => s.renderMode)
  const sourceMode = useVideoStore((s) => s.sourceMode)
  const setVideoFile = useVideoStore((s) => s.setVideoFile)
  const clearVideo = useVideoStore((s) => s.clearVideo)
  const setIsPlaying = useVideoStore((s) => s.setIsPlaying)
  const setRenderMode = useVideoStore((s) => s.setRenderMode)

  const { startCamera, stopCamera, error: cameraError } = useCamera()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // カメラが起動中なら停止
      if (sourceMode === 'camera') stopCamera()
      setVideoFile(file)
    }
    e.target.value = ''
  }

  const hasSource = sourceMode === 'camera' || !!videoUrl

  return (
    <div className="space-y-2">
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

        {/* カメラボタン */}
        {sourceMode === 'camera' ? (
          <button
            onClick={stopCamera}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            カメラ停止
          </button>
        ) : (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            カメラ起動
          </button>
        )}

        {/* Play / Pause (ファイルモードのみ) */}
        {sourceMode === 'file' && (
          <button
            disabled={!videoUrl}
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isPlaying ? '⏸ 一時停止' : '▶ 再生'}
          </button>
        )}

        {/* クリアボタン */}
        {hasSource && sourceMode === 'file' && (
          <button
            onClick={clearVideo}
            className="px-4 py-2 bg-gray-700 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            クリア
          </button>
        )}

        {/* ソースモード表示 */}
        <span className="text-xs text-gray-400">
          {sourceMode === 'camera' ? '📷 カメラ' : '📁 ファイル'}
        </span>

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

      {cameraError && (
        <div className="text-xs text-red-400">{cameraError}</div>
      )}
    </div>
  )
}
