import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Zap } from 'lucide-react';

interface SpeedometerGaugeProps {
  targetRisk: number; // 0.0 to 1.0
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
  riskColor: string;
  isLowRisk: boolean;
  isMediumRisk: boolean;
  isHighRisk: boolean;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  targetRisk,
  riskTier,
  riskColor,
  isLowRisk,
  isMediumRisk,
  isHighRisk,
}) => {
  // Current animated gauge value (0.0 to 1.0)
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [isIgnitionSweeping, setIsIgnitionSweeping] = useState<boolean>(true);
  const [isPeakFlashing, setIsPeakFlashing] = useState<boolean>(false);
  const animRef = useRef<number | null>(null);

  // Engine Startup Needle Sweep Function
  const runStartupGaugeSweep = (finalTarget: number) => {
    setIsIgnitionSweeping(true);
    setIsPeakFlashing(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const startTime = performance.now();
    const sweepUpDuration = 650; // 0 to 1.0 (top speed sweep)
    const holdDuration = 160; // peak flash hold at max speed
    const settleDuration = 750; // 1.0 down to calibrated target settling

    const step = (now: number) => {
      const elapsed = now - startTime;

      if (elapsed < sweepUpDuration) {
        // Phase 1: Powerful sports car needle sweep to TOP SPEED (0 -> 1.0)
        const t = elapsed / sweepUpDuration;
        // Ease-out cubic with slight overshoot
        const progress = Math.min(1.0, 1 - Math.pow(1 - t, 3) + 0.02 * Math.sin(t * Math.PI));
        setCurrentValue(Math.max(0, Math.min(1.0, progress)));
        animRef.current = requestAnimationFrame(step);
      } else if (elapsed < sweepUpDuration + holdDuration) {
        // Phase 2: Peak flash at top speed / redline (100%)
        setCurrentValue(1.0);
        setIsPeakFlashing(true);
        animRef.current = requestAnimationFrame(step);
      } else if (elapsed < sweepUpDuration + holdDuration + settleDuration) {
        // Phase 3: Sweep down from 1.0 and settle at calibrated target with subtle realistic damping
        setIsPeakFlashing(false);
        const t = (elapsed - (sweepUpDuration + holdDuration)) / settleDuration;
        // Damped harmonic settle
        const settleDecay = Math.pow(1 - t, 2.5);
        const value = finalTarget + (1.0 - finalTarget) * settleDecay * Math.cos(t * Math.PI * 1.5);
        setCurrentValue(Math.max(0, Math.min(1.0, value)));
        animRef.current = requestAnimationFrame(step);
      } else {
        // Finished: lock precisely at final target
        setCurrentValue(finalTarget);
        setIsIgnitionSweeping(false);
        setIsPeakFlashing(false);
      }
    };

    animRef.current = requestAnimationFrame(step);
  };

  // Trigger startup sweep on mount (engine start simulation)
  useEffect(() => {
    const timer = setTimeout(() => {
      runStartupGaugeSweep(targetRisk);
    }, 150);

    return () => {
      clearTimeout(timer);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // When user drags sliders after ignition sweep, smoothly update target
  useEffect(() => {
    if (!isIgnitionSweeping) {
      setCurrentValue(targetRisk);
    }
  }, [targetRisk, isIgnitionSweeping]);

  // Dimensions & Center
  const cx = 160;
  const cy = 160;
  const r = 112;

  // Dial sweeps 240 degrees: from -120° (0.0) to +120° (1.0)
  // At 0.0 -> -120deg (pointing bottom-left)
  // At 0.5 -> 0deg (pointing straight UP)
  // At 1.0 -> +120deg (pointing bottom-right)
  const needleAngle = -120 + currentValue * 240;

  // Generate tick marks
  const ticks = [];
  const totalTicks = 21; // every 5%
  for (let i = 0; i < totalTicks; i++) {
    const fraction = i / (totalTicks - 1);
    const angleDeg = -120 + fraction * 240;
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    const isMajor = i % 4 === 0; // 0.0, 0.2, 0.4, 0.6, 0.8, 1.0
    const tickLen = isMajor ? 13 : 6;
    const innerR = r - tickLen;

    const x1 = cx + r * Math.cos(angleRad);
    const y1 = cy + r * Math.sin(angleRad);
    const x2 = cx + innerR * Math.cos(angleRad);
    const y2 = cy + innerR * Math.sin(angleRad);

    // Label position for major ticks
    const labelR = r - 24;
    const lx = cx + labelR * Math.cos(angleRad);
    const ly = cy + labelR * Math.sin(angleRad);

    const isRedline = fraction >= 0.6;
    const isAmber = fraction >= 0.3 && fraction < 0.6;
    const tickColor = isRedline ? '#EF4444' : isAmber ? '#F59E0B' : '#10B981';

    ticks.push({
      id: i,
      x1,
      y1,
      x2,
      y2,
      lx,
      ly,
      isMajor,
      label: fraction.toFixed(1),
      isRedline,
      tickColor,
    });
  }

  // Active risk color and tier text
  const displayPercentage = Math.round(currentValue * 100);
  const currentRiskColor =
    currentValue >= 0.6 ? '#EF4444' : currentValue >= 0.3 ? '#E9A23B' : '#10B981';

  return (
    <div className="w-full flex flex-col items-center">
      {/* ─── SPEEDOMETER GAUGE INSTRUMENT CLUSTER ─── */}
      <div className="relative w-full max-w-[340px] sm:max-w-[370px] aspect-[4/3] flex items-center justify-center select-none">
        {/* Subtle Ambient Radial Backlight Glow */}
        <div
          className="absolute inset-4 rounded-full blur-2xl transition-all duration-300 pointer-events-none"
          style={{
            backgroundColor: isPeakFlashing ? '#EF4444' : currentRiskColor,
            opacity: isPeakFlashing ? 0.6 : 0.22,
          }}
        />

        <svg viewBox="0 0 320 255" className="w-full h-full overflow-visible">
          <defs>
            {/* Outer Bezel Rim Gradient */}
            <radialGradient id="speedo-bezel" cx="50%" cy="50%" r="50%">
              <stop offset="86%" stopColor="#1B2822" />
              <stop offset="93%" stopColor="#2D3E35" />
              <stop offset="97%" stopColor="#14201A" />
              <stop offset="100%" stopColor="#0B120E" />
            </radialGradient>

            {/* Dial Face Carbon Gradient */}
            <radialGradient id="speedo-dial-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0B1C15" />
              <stop offset="65%" stopColor="#07140E" />
              <stop offset="100%" stopColor="#030806" />
            </radialGradient>

            {/* Needle Red Glow Filter */}
            <filter id="speedo-needle-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#EF4444" floodOpacity="0.85" />
            </filter>

            {/* Metallic Center Cap Hub */}
            <radialGradient id="speedo-hub" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#CBD5E1" />
              <stop offset="70%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#1E293B" />
            </radialGradient>
          </defs>

          {/* 1. OUTER CHROME & TITANIUM BEZEL */}
          <circle cx={cx} cy={cy} r="142" fill="url(#speedo-bezel)" stroke="#374B40" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="138" fill="none" stroke="#E9A23B" strokeWidth="0.8" strokeOpacity="0.25" />

          {/* 2. INNER DIAL FACE (Dark Tachometer / Speedometer Cluster) */}
          <circle cx={cx} cy={cy} r="135" fill="url(#speedo-dial-bg)" stroke="#0E1B15" strokeWidth="1.5" />

          {/* 3. SPEEDOMETER COLOR ARCS */}
          {/* Base Background Track Arc */}
          <path
            d="M 62.9 216 A 112 112 0 1 1 257.1 216"
            fill="none"
            stroke="#162820"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Safe Green Zone (0.0 to 0.3) */}
          <path
            d="M 62.9 216 A 112 112 0 0 1 98.7 94.4"
            fill="none"
            stroke="#10B981"
            strokeWidth="6"
            strokeLinecap="round"
            opacity={currentValue < 0.3 ? 1 : 0.55}
          />

          {/* Caution Amber Zone (0.3 to 0.6) */}
          <path
            d="M 98.7 94.4 A 112 112 0 0 1 201.7 79.6"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="6"
            opacity={currentValue >= 0.3 && currentValue < 0.6 ? 1 : 0.55}
          />

          {/* Redline Danger Zone (0.6 to 1.0) with High Glow */}
          <path
            d="M 201.7 79.6 A 112 112 0 0 1 257.1 216"
            fill="none"
            stroke="#EF4444"
            strokeWidth="8"
            strokeLinecap="round"
            opacity={currentValue >= 0.6 || isPeakFlashing ? 1 : 0.6}
            filter={isPeakFlashing || currentValue >= 0.6 ? 'url(#speedo-needle-glow)' : undefined}
          />

          {/* 4. SPEEDOMETER TICK MARKS & LABELS */}
          {ticks.map((t) => (
            <g key={t.id}>
              {/* Tick Mark */}
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.tickColor}
                strokeWidth={t.isMajor ? 2.5 : 1.2}
                strokeLinecap="round"
                opacity={t.isMajor ? 0.95 : 0.5}
              />

              {/* Major Tick Label Numbers (0.0, 0.2, 0.4, 0.6, 0.8, 1.0) */}
              {t.isMajor && (
                <text
                  x={t.lx}
                  y={t.ly + 3.5}
                  fontSize="9.5"
                  fill={t.isRedline ? '#EF4444' : t.tickColor}
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                  opacity={0.9}
                >
                  {t.label}
                </text>
              )}
            </g>
          ))}

          {/* Dial Header Label (placed neatly away from ticks) */}
          <text
            x={cx}
            y={cy - 48}
            fill="#7C9285"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="0.14em"
            textAnchor="middle"
          >
            CONFIDENCE CALIBRATION
          </text>

          {/* Redline Indicator Label */}
          <text
            x={238}
            y={122}
            fill="#EF4444"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="black"
            letterSpacing="0.08em"
            textAnchor="middle"
          >
            REDLINE
          </text>

          {/* 5. HIGH-VISIBILITY SPEEDOMETER NEEDLE (Anchored at 0,0 via translate) */}
          <g transform={`translate(${cx}, ${cy}) rotate(${needleAngle})`}>
            {/* Luminous Red Motion Shadow */}
            <line
              x1="0"
              y1="16"
              x2="0"
              y2="-106"
              stroke="#EF4444"
              strokeWidth="5"
              strokeLinecap="round"
              filter="url(#speedo-needle-glow)"
              opacity="0.8"
            />

            {/* Needle Main Blade (Crisp Pure White Body) */}
            <polygon
              points="-3.5,14 3.5,14 1.2,-104 -1.2,-104"
              fill="#FFFFFF"
            />

            {/* Needle Glowing Neon-Red Tip */}
            <polygon
              points="-2.5,-75 2.5,-75 1,-108 -1,-108"
              fill="#EF4444"
              filter="url(#speedo-needle-glow)"
            />

            {/* Needle Centerline */}
            <line
              x1="0"
              y1="12"
              x2="0"
              y2="-106"
              stroke="#EF4444"
              strokeWidth="1.2"
            />
          </g>

          {/* 6. CENTER METALLIC INSTRUMENT HUB CAP */}
          <circle cx={cx} cy={cy} r="18" fill="url(#speedo-hub)" stroke="#08140E" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="12" fill="#0D1A14" stroke="#475569" strokeWidth="1" />
          <circle
            cx={cx}
            cy={cy}
            r="5"
            fill={isPeakFlashing ? '#EF4444' : currentRiskColor}
            className="transition-colors duration-200"
          />
        </svg>

        {/* 7. CENTRAL DIGITAL HUD (Base of Gauge) */}
        <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[9px] font-mono tracking-widest text-[#7C9285] uppercase font-bold">
            PREDICTION ERROR RISK
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className="font-mono font-black text-3xl sm:text-4xl tracking-tight transition-colors duration-200 drop-shadow-md"
              style={{ color: isPeakFlashing ? '#EF4444' : currentRiskColor }}
            >
              {displayPercentage}
            </span>
            <span
              className="font-mono font-black text-lg"
              style={{ color: isPeakFlashing ? '#EF4444' : currentRiskColor }}
            >
              %
            </span>
          </div>

          {/* Live Dynamic Status Badge */}
          <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0B1812] border border-[#1F7A5A]/40 text-[9px] font-mono font-bold tracking-wider text-[#A2B8AB]">
            <span
              className="w-1.5 h-1.5 rounded-full transition-colors duration-200"
              style={{
                backgroundColor: currentRiskColor,
                boxShadow: `0 0 6px ${currentRiskColor}`,
              }}
            />
            <span>
              {isIgnitionSweeping
                ? isPeakFlashing
                  ? 'REDLINE TRIPWIRE TEST'
                  : 'IGNITION CALIBRATION...'
                : `${riskTier} RISK • CALIBRATED`}
            </span>
          </div>
        </div>
      </div>

      {/* ─── ENGINE START IGNITION BUTTON & RE-SWEEP CONTROL ─── */}
      <div className="mt-2 flex items-center justify-center gap-3">
        <button
          onClick={() => runStartupGaugeSweep(targetRisk)}
          disabled={isIgnitionSweeping}
          className={`group relative flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-200 ${
            isIgnitionSweeping
              ? 'bg-[#152B20] border-[#10B981]/50 text-white cursor-wait'
              : 'bg-gradient-to-r from-[#124B3A] via-[#175643] to-[#1F7A5A] hover:from-[#175643] hover:to-[#258764] text-white border-[#1F7A5A]/50 shadow-md shadow-[#124B3A]/30 hover:scale-105 active:scale-95'
          }`}
          title="Simulate sports-car engine start needle sweep (0 to 100% and settle)"
          data-cursor="button"
        >
          {/* Engine Start Outer Ring Indicator */}
          <div className="relative w-4 h-4 rounded-full border-2 border-white/60 flex items-center justify-center shrink-0">
            <Zap size={9} className="text-[#E9A23B] fill-[#E9A23B]" />
          </div>

          <span className="font-sans font-extrabold text-xs tracking-wider uppercase">
            {isIgnitionSweeping ? 'Engine Starting...' : 'Engine Start • Gauge Sweep'}
          </span>

          <RotateCcw
            size={12}
            className={`text-white/80 transition-transform group-hover:rotate-180 ${
              isIgnitionSweeping ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
};
