type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-fusion-cream text-fusion-text-secondary',
  success: 'bg-fusion-success/10 text-fusion-success',
  warning: 'bg-fusion-warning/10 text-fusion-warning',
  danger:  'bg-fusion-danger/10 text-fusion-danger',
  info:    'bg-fusion-info/10 text-fusion-info',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantStyles[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
}
