import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'coral';

interface MotionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  showArrow?: boolean;
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  successText?: string;
  enableMagnetic?: boolean;
  className?: string;
}

export const MotionButton: React.FC<MotionButtonProps> = ({
  variant = 'primary',
  children,
  icon,
  showArrow = false,
  isLoading = false,
  isSuccess = false,
  loadingText,
  successText,
  enableMagnetic = true,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Variants styling strictly conforming to Zero-Blue Palette
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white shadow-md shadow-[#124B3A]/20 hover:shadow-[#1F7A5A]/35 hover:shadow-lg border border-white/10',
    secondary:
      'bg-[#FFFDF8] hover:bg-[#FAF4ED] text-[#124B3A] border border-[#DDE5DC] hover:border-[#1F7A5A] shadow-xs hover:shadow-md hover:shadow-[#124B3A]/10',
    accent:
      'bg-gradient-to-r from-[#E9A23B] to-[#D88D23] hover:from-[#EFA944] hover:to-[#DE942A] text-white shadow-md shadow-[#E9A23B]/25 hover:shadow-lg hover:shadow-[#E9A23B]/40 border border-white/15',
    coral:
      'bg-gradient-to-r from-[#E76F51] to-[#D45B3E] hover:from-[#ED785B] hover:to-[#DB6345] text-white shadow-md shadow-[#E76F51]/25 hover:shadow-lg hover:shadow-[#E76F51]/40 border border-white/15',
    ghost:
      'bg-transparent hover:bg-[#124B3A]/5 text-[#124B3A] hover:text-[#1F7A5A] border border-transparent hover:border-[#DDE5DC]/80',
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!enableMagnetic || disabled || isLoading || isSuccess) return;
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Subtle magnetic attraction factor (max 4px translation)
    const distanceX = (e.clientX - centerX) * 0.12;
    const distanceY = (e.clientY - centerY) * 0.12;

    setPosition({
      x: Math.max(Math.min(distanceX, 5), -5),
      y: Math.max(Math.min(distanceY, 5), -5),
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.96 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.5 }}
      onClick={disabled || isLoading ? undefined : onClick}
      disabled={disabled || isLoading}
      data-cursor="button"
      className={`group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 select-none overflow-hidden ${
        variantStyles[variant]
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...(props as any)}
    >
      {/* Soft ambient inner glow sweep */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Loading State */}
      {isLoading && (
        <span className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{loadingText || 'Processing...'}</span>
        </span>
      )}

      {/* Success State */}
      {!isLoading && isSuccess && (
        <span className="flex items-center gap-1.5 text-emerald-100">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
          </motion.span>
          <span>{successText || 'Complete'}</span>
        </span>
      )}

      {/* Default State */}
      {!isLoading && !isSuccess && (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {showArrow && (
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200 shrink-0" />
          )}
        </>
      )}
    </motion.button>
  );
};
