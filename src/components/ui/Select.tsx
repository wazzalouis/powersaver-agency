import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, className = '', ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={`
          appearance-none w-full bg-white border border-fusion-cream-dark/30
          rounded-[var(--fusion-radius)] px-3 py-2 pr-8 text-sm text-fusion-text
          focus:outline-none focus:ring-2 focus:ring-fusion-sage focus:border-transparent
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fusion-text-muted pointer-events-none" />
    </div>
  ),
);

Select.displayName = 'Select';
