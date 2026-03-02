'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-fusion-primary text-white hover:bg-fusion-primary-light active:scale-[0.98] shadow-fusion-sm hover:shadow-fusion-md',
  secondary: 'bg-fusion-copper text-white hover:bg-fusion-copper-light active:scale-[0.98] shadow-fusion-sm hover:shadow-fusion-md',
  outline:   'bg-transparent text-fusion-primary border border-fusion-primary/30 hover:bg-fusion-primary-50 active:scale-[0.98]',
  ghost:     'bg-transparent text-fusion-text-secondary hover:bg-fusion-cream hover:text-fusion-text active:scale-[0.98]',
  danger:    'bg-fusion-danger text-white hover:opacity-90 active:scale-[0.98] shadow-fusion-sm',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center font-medium
          rounded-[var(--fusion-radius)]
          transition-all duration-150
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-fusion-sage focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
