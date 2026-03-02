type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-fusion-cream text-fusion-text-secondary',
  success: 'bg-fusion-success/10 text-fusion-success',
  warning: 'bg-fusion-warning/10 text-fusion-warning',
  danger:  'bg-fusion-danger/10 text-fusion-danger',
  info:    'bg-fusion-info/10 text-fusion-info',
  neutral: 'bg-fusion-cream-dark/40 text-fusion-text-secondary',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-fusion-text-muted',
  success: 'bg-fusion-success',
  warning: 'bg-fusion-warning',
  danger:  'bg-fusion-danger',
  info:    'bg-fusion-info',
  neutral: 'bg-fusion-text-muted',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
};

export function Badge({ variant = 'default', size = 'md', dot = false, pulse = false, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
      `}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span className={`absolute inset-0 rounded-full animate-ping opacity-75 ${dotColors[variant]}`} />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColors[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
}
