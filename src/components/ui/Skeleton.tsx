interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-fusion-cream rounded-[var(--fusion-radius)] ${className}`}
      style={{ width, height }}
    />
  );
}
