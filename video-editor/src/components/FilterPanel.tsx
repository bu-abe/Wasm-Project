import { useVideoStore } from '../store/videoStore'
import { AdjustmentSlider } from './AdjustmentSlider'

export function FilterPanel() {
  const filters = useVideoStore((s) => s.filters)
  const setFilter = useVideoStore((s) => s.setFilter)
  const resetFilters = useVideoStore((s) => s.resetFilters)

  const toggleFilters: Array<{ key: 'grayscale' | 'sepia' | 'invert'; label: string }> = [
    { key: 'grayscale', label: 'グレースケール' },
    { key: 'sepia', label: 'セピア' },
    { key: 'invert', label: '反転' },
  ]

  return (
    <div className="bg-gray-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold">フィルター</h2>
        <button
          onClick={resetFilters}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          リセット
        </button>
      </div>

      {/* トグルフィルター */}
      <div className="grid grid-cols-3 gap-2">
        {toggleFilters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key, !filters[key])}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
              filters[key]
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* スライダーフィルター */}
      <div className="space-y-3">
        <AdjustmentSlider
          label="明るさ"
          value={filters.brightness}
          min={-255}
          max={255}
          onChange={(v) => setFilter('brightness', v)}
        />
        <AdjustmentSlider
          label="コントラスト"
          value={filters.contrast}
          min={-100}
          max={100}
          onChange={(v) => setFilter('contrast', v)}
        />
        <AdjustmentSlider
          label="彩度"
          value={filters.saturation}
          min={-100}
          max={100}
          onChange={(v) => setFilter('saturation', v)}
        />
        <AdjustmentSlider
          label="ブラー"
          value={filters.blur}
          min={0}
          max={20}
          onChange={(v) => setFilter('blur', v)}
        />
      </div>
    </div>
  )
}
