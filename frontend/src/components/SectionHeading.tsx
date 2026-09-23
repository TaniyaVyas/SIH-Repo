import React from 'react';

interface SectionHeadingProps {
  badge: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  lightBadge?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  subtitle,
  align = 'center',
}) => {
  return (
    <div className={`mb-12 md:mb-16 ${align === 'center' ? 'text-center max-w-3xl mx-auto' : 'text-left max-w-2xl'}`}>
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 border border-[#DDE5DC] bg-[#FFFDF8] text-[#1F7A5A] shadow-warm-sm`}>
        <span className="w-2 h-2 rounded-full bg-[#E76F51]" />
        <span>{badge}</span>
      </div>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#17221C] font-display">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-[#65736B] leading-relaxed font-sans">
          {subtitle}
        </p>
      )}
    </div>
  );
};
