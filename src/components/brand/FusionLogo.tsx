import { Zap } from 'lucide-react';

interface FusionLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

const sizes = {
  sm: { icon: 16, text: 'text-sm', sub: 'text-[8px]' },
  md: { icon: 20, text: 'text-base', sub: 'text-[10px]' },
  lg: { icon: 28, text: 'text-xl', sub: 'text-xs' },
};

export function FusionLogo({ size = 'md', variant = 'dark' }: FusionLogoProps) {
  const s = sizes[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-fusion-primary';
  const subColor = variant === 'light' ? 'text-fusion-sage' : 'text-fusion-text-secondary';

  return (
    <div className="flex items-center gap-2">
      <div className="rounded-[var(--fusion-radius)] bg-fusion-sage p-1.5">
        <Zap size={s.icon} className="text-fusion-primary-dark" />
      </div>
      <div>
        <span className={`${s.text} font-semibold ${textColor} tracking-wide`}>
          FUSION<span className="font-light">STUDENTS</span>
        </span>
        <p className={`${s.sub} ${subColor} tracking-widest uppercase`}>Energy Intelligence</p>
      </div>
    </div>
  );
}
