'use client';

import { useEffect, useState } from 'react';
import { colors } from '@/lib/brand-config';

interface EfficiencyGaugeProps {
  value: number; // 0-100
  size?: number;
  label?: string;
}

export function EfficiencyGauge({ value, size = 160, label }: EfficiencyGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 50);
    return () => clearTimeout(timer);
  }, [value]);

  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + radius * 0.15; // shift centre down slightly for semi-circle

  // Arc runs from 180° (left) to 0° (right) — a semicircle
  const startAngle = 180;
  const endAngle = 0;
  const totalArc = startAngle - endAngle; // 180°
  const filledAngle = startAngle - (animatedValue / 100) * totalArc;

  function polarToCartesian(angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy - radius * Math.sin(rad),
    };
  }

  const bgStart = polarToCartesian(startAngle);
  const bgEnd = polarToCartesian(endAngle);
  const fillEnd = polarToCartesian(filledAngle);

  const bgArcFlag = 0; // always <= 180° for full background
  const fillArcFlag = animatedValue > 50 ? 1 : 0;

  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${bgArcFlag} 1 ${bgEnd.x} ${bgEnd.y}`;
  const fillPath = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${fillArcFlag} 1 ${fillEnd.x} ${fillEnd.y}`;

  // Colour based on value
  const gaugeColor =
    value >= 85 ? colors.success : value >= 75 ? colors.warning : colors.danger;

  const fontSize = size * 0.2;
  const labelFontSize = size * 0.09;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${cy + strokeWidth}`}>
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke={colors.cream.dark}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={fillPath}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.3s ease',
          }}
        />
        {/* Value text */}
        <text
          x={cx}
          y={cy - radius * 0.15}
          textAnchor="middle"
          fill={colors.neutral[900]}
          fontSize={fontSize}
          fontWeight={600}
          fontFamily="'DM Sans', sans-serif"
        >
          {Math.round(animatedValue)}%
        </text>
        {label && (
          <text
            x={cx}
            y={cy + radius * 0.15}
            textAnchor="middle"
            fill={colors.neutral[500]}
            fontSize={labelFontSize}
            fontFamily="'DM Sans', sans-serif"
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}
