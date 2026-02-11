import { useEditorStore } from "../store/editorStore";
import { AdjustmentSlider } from "./AdjustmentSlider";

export function FilterPanel() {
  const { filters, updateFilter, resetFilters } = useEditorStore();

  return (
    <div className="w-64 bg-gray-800 p-4 overflow-y-auto border-r border-gray-700 flex flex-col">
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

      <div className="mt-auto pt-4">
        <button
          onClick={resetFilters}
          className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition"
        >
          リセット
        </button>
      </div>
    </div>
  );
}
