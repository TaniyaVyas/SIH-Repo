import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Status message mapping matching user requirements
  const getStatusText = (prog: number) => {
    if (prog < 25) return "Loading vision engine...";
    if (prog < 50) return "Mapping retinal anatomy...";
    if (prog < 75) return "Preparing evidence engine...";
    return "Initializing trustworthy AI...";
  };

  useEffect(() => {
    const startTime = performance.now();
    const duration = 2100; // ~2.1 seconds target (within 1.5 - 2.5s window)

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(rawProgress);

      if (rawProgress < 100) {
        requestAnimationFrame(animate);
      } else {
        // Trigger smooth premium fade-out exit
        setTimeout(() => setIsExiting(true), 150);
        setTimeout(onComplete, 550);
      }
    };

    const animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [onComplete]);

  // Stage flags based on 0-20%, 20-40%, 40-60%, 60-80%, 80-100%
  const phase1_Retina = progress >= 5;       // 0-20%: Retinal structure appears
  const phase2_Vessels = progress >= 20;     // 20-40%: Vessel network draws itself
  const phase3_Nodes = progress >= 40;       // 40-60%: AI nodes activate
  const phase4_ScanRing = progress >= 60;    // 60-80%: Scanning ring moves across
  const phase5_Brand = progress >= 80;       // 80-100%: Brand title & readiness

  // Calculate dynamic vessel path drawing offset (for 20% to 45% range)
  const vesselDrawFraction = Math.min(Math.max((progress - 20) / 25, 0), 1);
  const strokeOffset = 1000 * (1 - vesselDrawFraction);

  // Scan line Y position for 60% to 80% range
  const scanFraction = Math.min(Math.max((progress - 60) / 25, 0), 1);
  const scanSweepY = 20 + scanFraction * 200;

  // Floating particles coordinates
  const particles = [
    { cx: 75, cy: 95, r: 2.2, color: '#E9A23B', delay: '0s' },
    { cx: 165, cy: 75, r: 2.5, color: '#E76F51', delay: '0.4s' },
    { cx: 180, cy: 155, r: 2.0, color: '#1F7A5A', delay: '0.8s' },
    { cx: 65, cy: 165, r: 2.4, color: '#E9A23B', delay: '1.2s' },
    { cx: 120, cy: 50, r: 1.8, color: '#E76F51', delay: '0.2s' },
    { cx: 130, cy: 190, r: 2.2, color: '#1F7A5A', delay: '0.6s' },
    { cx: 95, cy: 130, r: 1.6, color: '#E9A23B', delay: '1.0s' },
    { cx: 150, cy: 110, r: 2.0, color: '#E76F51', delay: '1.4s' },
  ];

  // AI graph nodes for Phase 3
  const aiNodes = [
    { cx: 80, cy: 120, label: "v_disc", color: "#1F7A5A" },
    { cx: 155, cy: 120, label: "v_fovea", color: "#124B3A" },
    { cx: 120, cy: 75, label: "v_sup", color: "#E9A23B" },
    { cx: 125, cy: 165, label: "v_inf", color: "#E9A23B" },
    { cx: 175, cy: 95, label: "v_les1", color: "#E76F51" },
    { cx: 165, cy: 150, label: "v_les2", color: "#E76F51" },
  ];

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F8F6EF] transition-all duration-500 ease-out select-none ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 45%, rgba(31, 122, 90, 0.09) 0%, rgba(231, 111, 81, 0.05) 40%, transparent 70%),
          linear-gradient(to right, rgba(18, 75, 58, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(18, 75, 58, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 28px 28px, 28px 28px'
      }}
    >
      {/* Central Eye / Retinal Biometric Canvas */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        {/* Ambient Warm Organic Glow */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 ${
            phase1_Retina ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(233, 162, 59, 0.15) 0%, rgba(31, 122, 90, 0.1) 50%, transparent 70%)',
            filter: 'blur(16px)'
          }}
        />

        {/* Outer Circular Caliper & Orbiting Ring */}
        <div
          className={`absolute inset-2 rounded-full border border-dashed border-[#1F7A5A]/40 transition-all duration-700 ${
            phase1_Retina ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
          }`}
          style={{ animation: 'spin 18s linear infinite' }}
        />

        {/* Outer Fine Tickmarks Ring */}
        <div
          className={`absolute inset-6 rounded-full border border-[#DDE5DC] transition-all duration-500 ${
            phase1_Retina ? 'opacity-80 scale-100' : 'opacity-0 scale-90'
          }`}
        />

        {/* Main Retinal SVG Sphere */}
        <svg
          viewBox="0 0 240 240"
          className="w-56 h-56 sm:w-64 sm:h-64 rounded-full relative z-10 overflow-hidden shadow-2xl border-2 border-[#DDE5DC]/80 bg-[#17221C]"
        >
          <defs>
            {/* Fundus Warm Radial Gradient (Deep charcoal/wine/terracotta - strictly zero blue) */}
            <radialGradient id="loaderFundus" cx="46%" cy="50%" r="52%">
              <stop offset="0%" stopColor="#8C2D1C" />
              <stop offset="50%" stopColor="#5E1B0E" />
              <stop offset="85%" stopColor="#320C06" />
              <stop offset="100%" stopColor="#17221C" />
            </radialGradient>

            {/* Optic Disc Gradient (Warm Saffron / Ivory) */}
            <radialGradient id="loaderDisc" cx="45%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#FFFDF8" />
              <stop offset="40%" stopColor="#E9A23B" />
              <stop offset="90%" stopColor="#9E6110" />
            </radialGradient>

            {/* Foveal Center Dark Pit */}
            <radialGradient id="loaderFovea" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#240702" />
              <stop offset="70%" stopColor="#4D1309" />
              <stop offset="100%" stopColor="#8C2D1C" stopOpacity="0" />
            </radialGradient>

            {/* Scan Sweep Laser Gradient */}
            <linearGradient id="scanBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E76F51" stopOpacity="0" />
              <stop offset="70%" stopColor="#E76F51" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#E9A23B" stopOpacity="0.95" />
            </linearGradient>

            {/* Glow Filter for Vessels & Nodes */}
            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#1F7A5A" floodOpacity="0.8" />
            </filter>
            <filter id="coralGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#E76F51" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* 0-20%: Base Retinal Fundus Globe */}
          <circle
            cx="120"
            cy="120"
            r="118"
            fill="url(#loaderFundus)"
            className={`transition-opacity duration-700 ${phase1_Retina ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Optic Disc & Fovea Landmarks (Phase 1) */}
          <g className={`transition-all duration-700 ${phase1_Retina ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            {/* Optic Disc (Nasal Coordinate: ~80, 120) */}
            <ellipse cx="80" cy="120" rx="16" ry="19" fill="url(#loaderDisc)" />
            <ellipse cx="78" cy="119" rx="7" ry="9" fill="#FFFDF8" opacity="0.8" />

            {/* Fovea / Macula (Temporal Coordinate: ~155, 122) */}
            <circle cx="155" cy="122" r="22" fill="url(#loaderFovea)" />
            <circle cx="155" cy="122" r="2.5" fill="#17221C" />
            <circle cx="155" cy="122" r="7" fill="none" stroke="#E9A23B" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.6" />
          </g>

          {/* 20-40%: Vascular Network Self-Drawing */}
          <g
            className={`transition-opacity duration-500 ${phase2_Vessels ? 'opacity-100' : 'opacity-0'}`}
            filter="url(#emeraldGlow)"
          >
            {/* Superior Temporal Arcade Arch */}
            <path
              d="M 80 110 C 95 65, 125 50, 160 55 C 190 60, 210 85, 225 105"
              fill="none"
              stroke="#1F7A5A"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeDasharray="1000"
              strokeDashoffset={strokeOffset}
            />
            {/* Superior Branchlets */}
            <path
              d="M 125 56 Q 145 38, 175 32"
              fill="none"
              stroke="#1F7A5A"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="1000"
              strokeDashoffset={strokeOffset}
            />
            <path
              d="M 160 58 Q 175 75, 185 85"
              fill="none"
              stroke="#2CA077"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeDasharray="1000"
              strokeDashoffset={strokeOffset}
            />

            {/* Inferior Temporal Arcade Arch */}
            <path
              d="M 80 130 C 95 175, 130 195, 165 190 C 195 185, 215 160, 230 140"
              fill="none"
              stroke="#1F7A5A"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeDasharray="1000"
              strokeDashoffset={strokeOffset}
            />
            {/* Inferior Branchlets */}
            <path
              d="M 130 188 Q 155 208, 185 212"
              fill="none"
              stroke="#1F7A5A"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="1000"
              strokeDashoffset={strokeOffset}
            />
            <path
              d="M 165 186 Q 175 168, 190 160"
              fill="none"
              stroke="#2CA077"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeDasharray="1000"
              strokeDashoffset={strokeOffset}
            />

            {/* Nasal Vessels */}
            <path
              d="M 72 116 Q 50 105, 25 100"
              fill="none"
              stroke="#1F7A5A"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="1000"
              strokeDashoffset={strokeOffset}
            />
            <path
              d="M 72 124 Q 50 135, 28 145"
              fill="none"
              stroke="#1F7A5A"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="1000"
              strokeDashoffset={strokeOffset}
            />
          </g>

          {/* Floating Retinal Glowing Particles */}
          {particles.map((p, idx) => (
            <circle
              key={idx}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill={p.color}
              className={`transition-all duration-700 ${
                phase1_Retina ? 'opacity-75' : 'opacity-0'
              }`}
              style={{
                animation: `pulse 2.2s ease-in-out infinite`,
                animationDelay: p.delay
              }}
            />
          ))}

          {/* 40-60%: AI Graph Nodes & Topological Connections */}
          {phase3_Nodes && (
            <g className="transition-opacity duration-500 opacity-100">
              {/* Connecting Relational Edges */}
              <line x1="80" y1="120" x2="155" y2="122" stroke="#E9A23B" strokeWidth="1.4" strokeDasharray="3 2" />
              <line x1="80" y1="120" x2="120" y2="75" stroke="#1F7A5A" strokeWidth="1.2" strokeDasharray="3 2" />
              <line x1="80" y1="120" x2="125" y2="165" stroke="#1F7A5A" strokeWidth="1.2" strokeDasharray="3 2" />
              <line x1="155" y1="122" x2="120" y2="75" stroke="#1F7A5A" strokeWidth="1.2" strokeDasharray="3 2" />
              <line x1="155" y1="122" x2="175" y2="95" stroke="#E76F51" strokeWidth="1.6" filter="url(#coralGlow)" />
              <line x1="155" y1="122" x2="165" y2="150" stroke="#E76F51" strokeWidth="1.6" filter="url(#coralGlow)" />

              {/* Individual AI Nodes with Pulse */}
              {aiNodes.map((node, idx) => (
                <g key={idx} className="animate-pulse-slow">
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="4"
                    fill={node.color}
                    stroke="#FFFDF8"
                    strokeWidth="1.2"
                  />
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="8"
                    fill="none"
                    stroke={node.color}
                    strokeWidth="0.8"
                    opacity="0.5"
                    className="animate-ping"
                  />
                </g>
              ))}
            </g>
          )}

          {/* 60-80%: Circular / Vertical Laser Scanning Ring Moving Across */}
          {phase4_ScanRing && (
            <g className="transition-opacity duration-300 pointer-events-none">
              {/* Sweeping Horizontal Laser Band */}
              <rect
                x="0"
                y={scanSweepY - 24}
                width="240"
                height="24"
                fill="url(#scanBeamGrad)"
              />
              {/* Sharp Laser Beam Line */}
              <line
                x1="0"
                y1={scanSweepY}
                x2="240"
                y2={scanSweepY}
                stroke="#E9A23B"
                strokeWidth="1.8"
                filter="url(#coralGlow)"
              />

              {/* Concentric Scan Target Ring expanding over Fovea */}
              <circle
                cx="155"
                cy="122"
                r={16 + (scanFraction * 35)}
                fill="none"
                stroke="#E76F51"
                strokeWidth="1.4"
                opacity={0.8 - scanFraction * 0.7}
              />
            </g>
          )}

          {/* Lens Center Optical Crosshair */}
          <g opacity="0.35" stroke="#FFFDF8" strokeWidth="0.8">
            <line x1="120" y1="12" x2="120" y2="28" />
            <line x1="120" y1="212" x2="120" y2="228" />
            <line x1="12" y1="120" x2="28" y2="120" />
            <line x1="212" y1="120" x2="228" y2="120" />
          </g>
        </svg>

        {/* Outer Circular Optical Ring Pulse */}
        <div
          className={`absolute -inset-1 rounded-full border border-[#E9A23B]/30 transition-all duration-700 pointer-events-none ${
            phase4_ScanRing ? 'scale-110 opacity-70' : 'scale-100 opacity-20'
          }`}
        />
      </div>

      {/* 80-100%: Brand Title & Status Transition */}
      <div className="mt-8 text-center px-4 max-w-sm">
        {/* Main Status Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#E76F51] animate-ping" />
          <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-[#1F7A5A]">
            Initializing Retinal Intelligence
          </span>
        </div>

        {/* 80-100% Brand Name Reveal */}
        <h2
          className={`text-2xl sm:text-3xl font-extrabold text-[#17221C] font-display tracking-tight transition-all duration-500 ${
            phase5_Brand ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-1'
          }`}
        >
          RETINA-FUSION <span className="text-[#1F7A5A]">360</span>
        </h2>

        {/* Dynamic Statuses Displayed Sequentially */}
        <div className="h-6 mt-1 flex items-center justify-center">
          <p className="text-xs font-mono text-[#65736B] transition-all duration-300">
            {getStatusText(progress)}
          </p>
        </div>

        {/* Progress Bar with Approved Palette (No Blue!) */}
        <div className="w-56 mx-auto mt-4">
          <div className="h-1.5 w-full bg-[#DDE5DC] rounded-full overflow-hidden p-[1px]">
            <div
              className="h-full rounded-full transition-all duration-200 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #124B3A 0%, #1F7A5A 50%, #E9A23B 85%, #E76F51 100%)'
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#65736B] mt-2">
            <span>CALIBRATING</span>
            <span className="font-bold text-[#124B3A]">{progress}%</span>
          </div>
        </div>

        {/* Sub-label guarantee */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-mono text-[#65736B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A5A]" />
          <span>Structure • Evidence • Trust</span>
        </div>
      </div>
    </div>
  );
};
