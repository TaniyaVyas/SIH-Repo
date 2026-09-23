import React, { useEffect, useState, useRef } from 'react';

export type CursorVariant = 'default' | 'button' | 'card' | 'retina' | 'link' | 'node' | 'text';

export const CustomCursor: React.FC = () => {
  const [variant, setVariant] = useState<CursorVariant>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchOrReduced, setIsTouchOrReduced] = useState(false);

  // Raw mouse coordinates
  const mousePos = useRef({ x: -100, y: -100 });
  // Interpolated coordinates for smooth trailing
  const trailingPos = useRef({ x: -100, y: -100 });

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Detect touch device, mobile screen, or prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReducedMotion || isCoarsePointer || window.innerWidth < 1024) {
      setIsTouchOrReduced(true);
      return;
    }

    let lastVariantCheck = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const now = performance.now();
      if (now - lastVariantCheck < 50) return;
      lastVariantCheck = now;

      // Inspect hovered element to set variant
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest('[data-cursor="retina"]') || target.closest('canvas') || target.closest('.retinal-view')) {
        setVariant('retina');
      } else if (target.closest('[data-cursor="node"]') || target.closest('.graph-node')) {
        setVariant('node');
      } else if (target.closest('button') || target.closest('[data-cursor="button"]') || target.closest('.btn-interactive')) {
        setVariant('button');
      } else if (target.closest('[data-cursor="card"]') || target.closest('.interactive-card')) {
        setVariant('card');
      } else if (target.closest('a') || target.closest('[data-cursor="link"]')) {
        setVariant('link');
      } else if (target.closest('h1') || target.closest('h2') || target.closest('[data-cursor="text"]')) {
        setVariant('text');
      } else {
        setVariant('default');
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth animation loop using requestAnimationFrame
    const animate = () => {
      // Linear interpolation factor for buttery 60fps tracking
      const ease = 0.18;
      trailingPos.current.x += (mousePos.current.x - trailingPos.current.x) * ease;
      trailingPos.current.y += (mousePos.current.y - trailingPos.current.y) * ease;

      // Update dot position directly for instant precision
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Update ring and glow positions with smooth trailing
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${trailingPos.current.x}px, ${trailingPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${trailingPos.current.x}px, ${trailingPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible]);

  if (isTouchOrReduced || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Soft cursor-following ambient glow */}
      <div
        ref={glowRef}
        className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-25 blur-2xl transition-opacity duration-300 pointer-events-none"
        style={{
          background: variant === 'retina'
            ? 'radial-gradient(circle, rgba(31,122,90,0.4) 0%, rgba(233,162,59,0.2) 50%, transparent 80%)'
            : variant === 'button'
            ? 'radial-gradient(circle, rgba(231,111,81,0.35) 0%, rgba(31,122,90,0.2) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(31,122,90,0.25) 0%, transparent 70%)',
        }}
      />

      {/* Main cursor dot */}
      <div
        ref={dotRef}
        className={`absolute top-0 left-0 rounded-full transition-all duration-150 pointer-events-none ${
          variant === 'retina'
            ? 'w-2 h-2 bg-[#E76F51] shadow-[0_0_8px_#E76F51]'
            : variant === 'node'
            ? 'w-2 h-2 bg-[#E9A23B] ring-2 ring-[#E9A23B]'
            : variant === 'button'
            ? 'w-2.5 h-2.5 bg-[#124B3A]'
            : variant === 'card'
            ? 'w-2 h-2 bg-[#1F7A5A]'
            : variant === 'text'
            ? 'w-1.5 h-4 rounded-sm bg-[#124B3A]'
            : variant === 'link'
            ? 'w-2 h-2 bg-[#E9A23B]'
            : 'w-2 h-2 bg-[#124B3A]'
        }`}
      />

      {/* Outer trailing ring / reticle */}
      <div
        ref={ringRef}
        className={`absolute top-0 left-0 pointer-events-none transition-all duration-200 flex items-center justify-center ${
          variant === 'retina'
            ? 'w-14 h-14 rounded-full border-2 border-dashed border-[#1F7A5A] animate-spin'
            : variant === 'node'
            ? 'w-11 h-11 rounded-lg border border-[#E9A23B] rotate-45 scale-110'
            : variant === 'button'
            ? 'w-12 h-12 rounded-full border-2 border-[#124B3A]/60 bg-[#124B3A]/10 scale-125'
            : variant === 'card'
            ? 'w-10 h-10 rounded-md border border-[#1F7A5A]/50 bg-[#1F7A5A]/5'
            : variant === 'text'
            ? 'w-8 h-8 rounded-full border border-[#124B3A]/30 scale-90'
            : variant === 'link'
            ? 'w-8 h-8 rounded-full border border-[#E9A23B] scale-110'
            : 'w-7 h-7 rounded-full border border-[#124B3A]/30'
        }`}
        style={{
          animationDuration: variant === 'retina' ? '8s' : undefined,
        }}
      >
        {variant === 'retina' && (
          <div className="w-1.5 h-1.5 rounded-full bg-[#E76F51]/90" />
        )}
        {variant === 'node' && (
          <div className="w-1 h-1 rounded-full bg-[#E9A23B]" />
        )}
      </div>
    </div>
  );
};
