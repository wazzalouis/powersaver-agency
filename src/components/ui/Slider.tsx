'use client';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  valueLabel?: string | ((value: number) => string);
  disabled?: boolean;
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  valueLabel,
  disabled,
}: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;
  const displayValue =
    typeof valueLabel === 'function'
      ? valueLabel(value)
      : valueLabel ?? String(value);

  return (
    <div className={`flex flex-col gap-1.5 ${disabled ? 'opacity-50' : ''}`}>
      {(label || valueLabel !== undefined) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs text-fusion-text-secondary">{label}</span>
          )}
          <span className="text-xs font-medium text-fusion-text font-data">
            {displayValue}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="fusion-slider w-full"
        style={
          {
            '--slider-percent': `${percent}%`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
