import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, padding = 'md', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-[var(--fusion-radius-lg)] border border-fusion-cream-dark/30
          shadow-[var(--fusion-shadow-sm)]
          ${hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--fusion-shadow-lg)]' : ''}
          ${paddingStyles[padding]} ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
