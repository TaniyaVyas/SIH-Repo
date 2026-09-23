import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number; // Duration in ms
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  delay?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  duration = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  delay = 0,
}) => {
  const [value, setValue] = useState(from);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setValue(to);
      return;
    }

    const startAnimation = () => {
      const step = (timestamp: number) => {
        if (!startTime.current) startTime.current = timestamp;
        const progress = Math.min((timestamp - startTime.current) / duration, 1);

        // Quintic out easing for a medical, smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const current = from + (to - from) * easeOut;

        setValue(current);

        if (progress < 1) {
          rafId.current = requestAnimationFrame(step);
        } else {
          setValue(to);
        }
      };

      rafId.current = requestAnimationFrame(step);
    };

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (delay > 0) {
      timeoutId = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (timeoutId) clearTimeout(timeoutId);
      startTime.current = null;
    };
  }, [from, to, duration, delay]);

  const formatted = decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString();

  return (
    <span className={`tabular-nums font-mono ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
};
