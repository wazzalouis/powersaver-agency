import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';

type CardVariant = 'default' | 'elevated' | 'accent' | 'highlight';
type CardPadding = 'compact' | 'default' | 'spacious' | 'none';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding | 'sm' | 'md' | 'lg';
  hover?: boolean;
  header?: ReactNode;
  headerAction?: ReactNode;
  highlightColor?: string;
}

const paddingStyles: Record<string, string> = {
  none:     '',
  compact:  'p-3',
  sm:       'p-4',
  default:  'p-5',
  md:       'p-6',
  spacious: 'p-8',
  lg:       'p-8',
};

const variantStyles: Record<CardVariant, string> = {
  default:  'bg-white border border-fusion-cream-dark/30 shadow-fusion-sm',
  elevated: 'bg-white border border-fusion-cream-dark/20 shadow-fusion-md',
  accent:   'bg-fusion-primary text-fusion-cream-light border border-fusion-primary-light/20',
  highlight: 'bg-white border border-fusion-cream-dark/30 shadow-fusion-sm border-l-[3px]',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'default', hover = false, header, headerAction, highlightColor, className = '', children, style, ...props }, ref) => {
    const highlightStyle = variant === 'highlight' && highlightColor
      ? { borderLeftColor: highlightColor, ...style }
      : style;

    return (
      <div
        ref={ref}
        className={`
          rounded-[var(--fusion-radius-lg)]
          ${hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-fusion-lg cursor-pointer' : ''}
          ${variantStyles[variant]}
          ${paddingStyles[padding] || paddingStyles.default}
          ${className}
        `}
        style={highlightStyle}
        {...props}
      >
        {header && (
          <div className={`flex items-center justify-between ${children ? 'mb-4' : ''}`}>
            <div className={`text-sm font-medium ${variant === 'accent' ? 'text-fusion-cream-light' : 'text-fusion-text'}`}>
              {header}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        )}
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
