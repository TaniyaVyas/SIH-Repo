import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

export const TopBrandHeader: React.FC = () => {
  return (
    <NavLink
      to="/"
      className="group flex items-center gap-3 text-left py-0.5 px-1 rounded-2xl transition-all duration-300 select-none hover:bg-[#124B3A]/5"
      title="Return to Home Dashboard"
    >
      {/* ─── ANIMATED HIGH-TECH LOGO (Permanent Brand in Top Header) ─── */}
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B3327] via-[#124B3A] to-[#1F7A5A] p-0.5 shadow-md shadow-[#124B3A]/25 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#1F7A5A]/30 transition-all duration-300">
        {/* Animated Scanner Ring */}
        <motion.div
          className="absolute inset-0 rounded-xl border border-[#E9A23B]/40 pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 0px rgba(31, 122, 90, 0)',
              '0 0 10px rgba(31, 122, 90, 0.6)',
              '0 0 0px rgba(31, 122, 90, 0)',
            ],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="w-full h-full rounded-[10px] bg-[#0A261D] flex items-center justify-center relative overflow-hidden">
          {/* Animated Sweeping Radar Beam */}
          <motion.div
            className="absolute inset-0 origin-center bg-gradient-to-r from-transparent via-[#1F7A5A]/40 to-transparent pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />

          {/* SVG Eye with Pulsing Pupil */}
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-[#FFFDF8] relative z-10 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Eye Outline */}
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            {/* Outer Iris */}
            <circle cx="12" cy="12" r="3" stroke="#E9A23B" strokeWidth="1.75" />
            {/* Inner Pupil with Live Pulse */}
            <circle cx="12" cy="12" r="1.25" fill="#FFFDF8" />
          </svg>

          {/* Calibrated Lens Grid Crosshairs */}
          <div className="absolute inset-0 border border-white/5 pointer-events-none" />
        </div>
      </div>

      {/* ─── BRAND TYPOGRAPHY (Matching Photo 2 exactly) ─── */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-display font-black text-base sm:text-[17px] tracking-tight text-[#124B3A] group-hover:text-[#1F7A5A] transition-colors">
            RETINA-FUSION
          </span>
          <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-[#E9A23B] to-[#F4A261] text-[#0A261D] shadow-xs tracking-wider">
            360
          </span>
        </div>

        <div className="mt-1">
          <span className="text-[10px] text-[#65736B] font-mono font-semibold tracking-wider uppercase">
            CLINICAL AI
          </span>
        </div>
      </div>
    </NavLink>
  );
};
