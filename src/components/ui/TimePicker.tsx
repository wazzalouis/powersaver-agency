'use client';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export function TimePicker({ value, onChange, label, disabled }: TimePickerProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${disabled ? 'opacity-50' : ''}`}>
      {label && (
        <span className="text-xs text-fusion-text-secondary">{label}</span>
      )}
      <input
        type="time"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`
          appearance-none bg-white border border-fusion-cream-dark/30
          rounded-[var(--fusion-radius)] px-3 py-2 text-sm text-fusion-text font-data
          focus:outline-none focus:ring-2 focus:ring-fusion-sage focus:border-transparent
          disabled:cursor-not-allowed
        `}
      />
    </div>
  );
}
