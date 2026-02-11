interface AdjustmentSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function AdjustmentSlider({
  label,
  value,
  min,
  max,
  onChange,
}: AdjustmentSliderProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400 w-10 text-right">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}
