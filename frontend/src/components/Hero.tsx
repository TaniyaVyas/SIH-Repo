import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, ArrowRight, WifiOff, Shield, Sparkles, UserCheck, 
  Activity, Eye, Camera, Network, CheckCircle2, Sliders, Layers
} from 'lucide-react';

interface HeroProps {
  onLaunchDemo: () => void;
  onExplorePipeline: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLaunchDemo, onExplorePipeline }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x: x * 22, y: y * 22 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Anatomical Markers for interactive fundus hologram
  const anatomicalMarkers = [
    { id: 'disc', name: 'Optic Disc (ONH)', cx: 70, cy: 110, tag: 'Nerve Trunk • Origin', color: '#E9A23B' },
    { id: 'fovea', name: 'Fovea Centralis', cx: 145, cy: 112, tag: 'FAZ Avascular Zone', color: '#124B3A' },
    { id: 'sup_arcade', name: 'Superior Arcade', cx: 115, cy: 55, tag: 'Arteriolar Trunk', color: '#1F7A5A' },
    { id: 'inf_arcade', name: 'Inferior Arcade', cx: 120, cy: 165, tag: 'Venular Caliber', color: '#1F7A5A' },
    { id: 'gnn_anchor', name: 'Graph Node G_04', cx: 170, cy: 88, tag: 'Topological Anchor', color: '#E76F51' },
  ];

  // Floating particles traversing the vascular network
  const particles = [
    { cx: 85, cy: 95, r: 2.0, color: '#E9A23B', dur: '3.2s' },
    { cx: 110, cy: 62, r: 2.4, color: '#1F7A5A', dur: '2.8s' },
    { cx: 145, cy: 60, r: 1.8, color: '#E76F51', dur: '3.5s' },
    { cx: 175, cy: 85, r: 2.2, color: '#E9A23B', dur: '4.0s' },
    { cx: 105, cy: 155, r: 2.0, color: '#1F7A5A', dur: '3.0s' },
    { cx: 140, cy: 170, r: 2.5, color: '#E76F51', dur: '3.6s' },
    { cx: 165, cy: 135, r: 1.8, color: '#E9A23B', dur: '2.5s' },
  ];

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#F8F6EF]"
    >
      {/* ========================================================================= */}
      {/* SUBTLE RURAL HEALTHCARE VISUAL STORYTELLING IN THE BACKGROUND             */}
      {/* Abstract health centre silhouette, soft hill contours, medical cross, offline signal */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 select-none">
        {/* Soft mountain / rolling rural landscape horizon contours */}
        <svg
          viewBox="0 0 1440 400"
          className="absolute bottom-0 left-0 w-full h-auto opacity-30 text-[#DDE5DC]"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 320 Q 360 220, 720 280 T 1440 240 L 1440 400 L 0 400 Z"
            fill="#E7EEE6"
          />
          <path
            d="M 0 350 Q 420 280, 840 330 T 1440 310 L 1440 400 L 0 400 Z"
            fill="#DDE5DC"
          />
        </svg>

        {/* Abstract Rural Sub-Health Centre Silhouette with Medical Cross */}
        <div className="absolute bottom-12 right-12 lg:right-28 opacity-25 hidden sm:block">
          <svg width="220" height="140" viewBox="0 0 220 140" fill="none">
            {/* Base Health Centre Clinic Structure */}
            <rect x="20" y="55" width="120" height="75" rx="4" fill="#124B3A" />
            <polygon points="10,55 80,15 150,55" fill="#1F7A5A" />
            {/* Small Solar Panel on clinic roof (rural off-grid power) */}
            <rect x="85" y="25" width="40" height="18" rx="2" fill="#E9A23B" opacity="0.8" transform="rotate(-15 85 25)" />
            {/* Health Centre Door and Windows */}
            <rect x="68" y="85" width="24" height="45" rx="2" fill="#F8F6EF" />
            <rect x="35" y="70" width="20" height="20" rx="2" fill="#FFFDF8" />
            <rect x="105" y="70" width="20" height="20" rx="2" fill="#FFFDF8" />
            
            {/* Distinct Medical Cross Emblem */}
            <g transform="translate(73, 62)">
              <rect x="5" y="0" width="4" height="14" fill="#E76F51" rx="1" />
              <rect x="0" y="5" width="14" height="4" fill="#E76F51" rx="1" />
            </g>

            {/* Offline-First Connectivity Signal Tower */}
            <line x1="165" y1="130" x2="165" y2="40" stroke="#124B3A" strokeWidth="3" />
            <polygon points="158,40 165,25 172,40" fill="#1F7A5A" />
            {/* Signal waves radiating from the rural health centre */}
            <circle cx="165" cy="25" r="14" stroke="#1F7A5A" strokeWidth="1.5" strokeDasharray="4 2" fill="none" className="animate-ping" opacity="0.4" />
            <circle cx="165" cy="25" r="28" stroke="#E9A23B" strokeWidth="1.5" strokeDasharray="5 3" fill="none" opacity="0.5" />
            <circle cx="165" cy="25" r="42" stroke="#1F7A5A" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.3" />
          </svg>
        </div>

        {/* Ambient Warm Radial Retinal Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full retina-radial-glow" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: CINEMATIC HEADLINE, PILLARS, CTAS, SUPPORTING INDICATORS     */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Small Status Badge & Module Tag */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider uppercase bg-[#FFFDF8] border border-[#C8D4C7] text-[#124B3A] shadow-warm-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A5A] animate-pulse" />
                <span>AI SCREENING ENGINE • READY</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider uppercase bg-[#E8F3EE] text-[#1F7A5A] border border-[#C8D4C7]">
                <Camera className="w-3.5 h-3.5" />
                <span>MODULE 01: IMAGE ACQUISITION — RURAL SCREENING</span>
              </div>
            </div>

            {/* Requested Bold Cinematic Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#17221C] tracking-tight font-display leading-[1.12]">
              AI That Sees Beyond{' '}
              <span className="text-[#124B3A] relative inline-block">
                the Retina.
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[#E9A23B]/30 -z-10 rounded-full" />
              </span>
            </h1>

            {/* Requested Supporting Text */}
            <p className="text-base sm:text-lg lg:text-xl font-bold font-display text-[#1F7A5A] tracking-tight">
              Structure-Aware • Graph-Powered • Evidence-Verified • Trustworthy AI for Diabetic Retinopathy Screening
            </p>

            {/* Public Health Narrative */}
            <p className="text-sm sm:text-base text-[#65736B] leading-relaxed max-w-2xl font-sans">
              Designed for non-specialist ASHA health workers in village Sub-Health Centres and mobile screening vans. A raw optical fundus photograph captured using sub-$150 smartphone lenses enters the offline edge engine, extracts anatomical vascular topology, detects hallmark lesions, cross-verifies ETDRS clinical evidence, and formulates an auditable triage decision in under 1.8 seconds.
            </p>

            {/* "Photon to Decision" Visual Sequence */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-warm-sm max-w-2xl">
              <div className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#65736B] mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#1F7A5A]" />
                <span>Clinical Data Transformation Pipeline</span>
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[#F8F6EF] border border-[#DDE5DC] text-[#17221C] font-semibold">
                  Optical Fundus Photo
                </span>
                <span className="text-[#65736B]">➔</span>
                <span className="px-2 py-0.5 rounded bg-[#E8F3EE] border border-[#C8D4C7] text-[#124B3A] font-semibold">
                  Vessel Tree & Lesions
                </span>
                <span className="text-[#65736B]">➔</span>
                <span className="px-2 py-0.5 rounded bg-[#F8F6EF] border border-[#DDE5DC] text-[#1F7A5A] font-semibold">
                  Topological GNN
                </span>
                <span className="text-[#65736B]">➔</span>
                <span className="px-2 py-0.5 rounded bg-[#FCF5E9] border border-[#F3B964] text-[#8A5612] font-semibold">
                  ETDRS Evidence
                </span>
                <span className="text-[#65736B]">➔</span>
                <span className="px-2 py-0.5 rounded bg-[#FDF0EC] border border-[#F48C71] text-[#E76F51] font-bold">
                  ABDM Triage
                </span>
              </div>
            </div>

            {/* Requested CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              {/* Primary CTA */}
              <button
                onClick={onLaunchDemo}
                className="px-7 py-3.5 rounded-2xl font-bold font-display text-sm tracking-wide uppercase bg-[#124B3A] hover:bg-[#0E3C2E] text-[#FFFDF8] shadow-warm-md hover:shadow-emerald-glow transition-all duration-200 flex items-center gap-2.5 group"
              >
                <Play className="w-4 h-4 fill-[#FFFDF8] group-hover:scale-110 transition-transform" />
                <span>Launch Screening</span>
              </button>

              {/* Secondary CTA */}
              <button
                onClick={onExplorePipeline}
                className="px-6 py-3.5 rounded-2xl font-bold font-display text-sm tracking-wide bg-[#FFFDF8] hover:bg-[#F8F6EF] text-[#17221C] border border-[#DDE5DC] shadow-warm-sm hover:border-[#1F7A5A] transition-all duration-200 flex items-center gap-2"
              >
                <span>Explore the AI Pipeline</span>
                <ArrowRight className="w-4 h-4 text-[#1F7A5A]" />
              </button>
            </div>

            {/* Requested 4 Supporting Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-warm-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E8F3EE] text-[#124B3A] flex items-center justify-center shrink-0">
                  <WifiOff className="w-3.5 h-3.5 text-[#1F7A5A]" />
                </div>
                <span className="text-xs font-bold text-[#17221C] font-display">
                  Works Offline
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-warm-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E8F3EE] text-[#124B3A] flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-[#1F7A5A]" />
                </div>
                <span className="text-xs font-bold text-[#17221C] font-display">
                  Rural-Ready
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-warm-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FCF5E9] text-[#E9A23B] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#E9A23B]" />
                </div>
                <span className="text-xs font-bold text-[#17221C] font-display">
                  Explainable AI
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-warm-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FDF0EC] text-[#E76F51] flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5 text-[#E76F51]" />
                </div>
                <span className="text-xs font-bold text-[#17221C] font-display">
                  Human Review When Uncertain
                </span>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: LARGE INTERACTIVE RETINAL/FUNDUS VISUALIZATION              */}
          {/* Scanning animation, vessel highlights, moving particles, radial pulse,     */}
          {/* AI scan line, floating anatomical markers, sub-pixel telemetry           */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div
              className="relative w-full max-w-lg p-5 sm:p-7 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DC] shadow-warm-xl transition-transform duration-200 ease-out"
              style={{
                transform: `perspective(1000px) rotateX(${-mousePos.y * 0.4}deg) rotateY(${mousePos.x * 0.4}deg)`,
              }}
            >
              {/* Header inside Hologram Card */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#DDE5DC]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1F7A5A] animate-ping" />
                  <span className="text-xs font-bold font-mono uppercase text-[#124B3A]">
                    Point-of-Care Optical Stream
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8F6EF] text-[#1F7A5A] font-bold border border-[#DDE5DC]">
                  45° Non-Mydriatic
                </span>
              </div>

              {/* Central Large Retinal Globe Viewport */}
              <div className="my-6 relative flex items-center justify-center">
                {/* Radial Breathing Pulse Glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#1F7A5A]/20 via-[#E9A23B]/15 to-[#E76F51]/15 blur-xl animate-pulse-slow" />

                {/* Concentric Rotating Outer Calibration Rings */}
                <div className="absolute -inset-3 rounded-full border border-dashed border-[#1F7A5A]/30 animate-spin-slow pointer-events-none" />
                <div className="absolute -inset-7 rounded-full border border-dotted border-[#E9A23B]/25 animate-spin-slow pointer-events-none" style={{ animationDirection: 'reverse', animationDuration: '24s' }} />

                {/* Main Retinal SVG Sphere (High Fidelity Fundus) */}
                <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-[#17221C] relative overflow-hidden shadow-2xl border-4 border-[#3A4840]">
                  <svg viewBox="0 0 220 220" className="w-full h-full">
                    <defs>
                      {/* Realistic Warm Retinal Fundus Gradient (No blue!) */}
                      <radialGradient id="heroEyeGrad" cx="46%" cy="50%" r="52%">
                        <stop offset="0%" stopColor="#A83924" />
                        <stop offset="45%" stopColor="#7B2515" />
                        <stop offset="85%" stopColor="#451209" />
                        <stop offset="100%" stopColor="#1E0704" />
                      </radialGradient>

                      {/* Optic Disc Gradient */}
                      <radialGradient id="heroEyeDisc" cx="45%" cy="45%" r="50%">
                        <stop offset="0%" stopColor="#FFFDF8" />
                        <stop offset="45%" stopColor="#E9A23B" />
                        <stop offset="90%" stopColor="#9C5D0B" />
                      </radialGradient>

                      {/* Fovea Macular Pit */}
                      <radialGradient id="heroEyeFovea" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#2A0702" />
                        <stop offset="65%" stopColor="#5E160A" />
                        <stop offset="100%" stopColor="#7B2515" stopOpacity="0" />
                      </radialGradient>

                      {/* Scan Line Gradient */}
                      <linearGradient id="heroScanBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#E76F51" stopOpacity="0" />
                        <stop offset="80%" stopColor="#E76F51" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#E9A23B" stopOpacity="0.95" />
                      </linearGradient>

                      {/* Vessel Glow Filter */}
                      <filter id="heroVesselGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#1F7A5A" floodOpacity="0.8" />
                      </filter>
                    </defs>

                    {/* Retinal Fundus Body */}
                    <circle cx="110" cy="110" r="108" fill="url(#heroEyeGrad)" />

                    {/* Optic Disc (Nasal side: ~70, 110) */}
                    <ellipse cx="70" cy="110" rx="15" ry="18" fill="url(#heroEyeDisc)" />
                    <ellipse cx="68" cy="109" rx="6" ry="8" fill="#FFFDF8" opacity="0.85" />

                    {/* Fovea Centralis (Temporal side: ~145, 112) */}
                    <circle cx="145" cy="112" r="21" fill="url(#heroEyeFovea)" />
                    <circle cx="145" cy="112" r="2.5" fill="#17221C" />
                    <circle cx="145" cy="112" r="7" fill="none" stroke="#E9A23B" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.6" />

                    {/* Vessel Network Highlights (Emerald, Jade, Terracotta) */}
                    <g filter="url(#heroVesselGlow)">
                      {/* Superior Temporal Arcade */}
                      <path
                        d="M 70 100 C 85 55, 120 40, 155 45 C 185 50, 200 75, 215 95"
                        fill="none"
                        stroke="#1F7A5A"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                      />
                      <path d="M 120 46 Q 140 28, 170 24" fill="none" stroke="#2CA077" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M 155 48 Q 170 65, 180 75" fill="none" stroke="#2CA077" strokeWidth="1.3" strokeLinecap="round" />

                      {/* Inferior Temporal Arcade */}
                      <path
                        d="M 70 120 C 85 165, 125 185, 160 180 C 190 175, 205 150, 218 130"
                        fill="none"
                        stroke="#1F7A5A"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                      />
                      <path d="M 125 178 Q 150 198, 180 200" fill="none" stroke="#2CA077" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M 160 176 Q 170 158, 185 150" fill="none" stroke="#2CA077" strokeWidth="1.3" strokeLinecap="round" />

                      {/* Nasal Vessels */}
                      <path d="M 64 106 Q 42 96, 20 90" fill="none" stroke="#1F7A5A" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M 64 114 Q 42 125, 22 135" fill="none" stroke="#1F7A5A" strokeWidth="2.2" strokeLinecap="round" />

                      {/* Micro-capillaries framing Fovea */}
                      <path d="M 135 95 Q 140 105, 137 115" fill="none" stroke="#2CA077" strokeWidth="1" opacity="0.8" />
                      <path d="M 155 95 Q 152 105, 154 115" fill="none" stroke="#2CA077" strokeWidth="1" opacity="0.8" />
                    </g>

                    {/* Moving Retinal Particles */}
                    {particles.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.cx}
                        cy={p.cy}
                        r={p.r}
                        fill={p.color}
                        className="animate-pulse"
                        style={{ animationDuration: p.dur }}
                      />
                    ))}

                    {/* Retinal Topological Graph Connecting Lines */}
                    <line x1="70" y1="110" x2="145" y2="112" stroke="#E9A23B" strokeWidth="1.2" strokeDasharray="3 2" />
                    <line x1="145" y1="112" x2="170" y2="88" stroke="#E76F51" strokeWidth="1.4" />
                    <line x1="115" y1="55" x2="170" y2="88" stroke="#1F7A5A" strokeWidth="1.2" strokeDasharray="2 2" />

                    {/* Floating Anatomical Markers */}
                    {anatomicalMarkers.map(m => (
                      <g
                        key={m.id}
                        className="cursor-pointer transition-transform hover:scale-125"
                        onMouseEnter={() => setHoveredMarker(`${m.name} — ${m.tag}`)}
                        onMouseLeave={() => setHoveredMarker(null)}
                      >
                        <circle cx={m.cx} cy={m.cy} r="6" fill={m.color} stroke="#FFFDF8" strokeWidth="1.5" />
                        <circle cx={m.cx} cy={m.cy} r="10" fill="none" stroke={m.color} strokeWidth="1" opacity="0.5" className="animate-ping" />
                      </g>
                    ))}

                    {/* AI Scan Line Sweeping Across Fundus */}
                    <g className="pointer-events-none animate-pulse-slow">
                      <line x1="0" y1="110" x2="220" y2="110" stroke="#E9A23B" strokeWidth="1.5" opacity="0.85" />
                      <rect x="0" y="90" width="220" height="20" fill="url(#heroScanBeam)" opacity="0.7" />
                    </g>

                    {/* Optical Alignment Reticle Crosshair */}
                    <g opacity="0.3" stroke="#FFFDF8" strokeWidth="0.8">
                      <line x1="110" y1="8" x2="110" y2="22" />
                      <line x1="110" y1="198" x2="110" y2="212" />
                      <line x1="8" y1="110" x2="22" y2="110" />
                      <line x1="198" y1="110" x2="212" y2="110" />
                    </g>
                  </svg>
                </div>

                {/* Floating Micro-Badge */}
                <div className="absolute -top-3 -right-2 bg-[#FFFDF8] border border-[#DDE5DC] rounded-xl px-3 py-1.5 shadow-warm-md flex items-center gap-1.5 text-xs font-mono font-bold text-[#124B3A]">
                  <Activity className="w-3.5 h-3.5 text-[#1F7A5A]" />
                  <span>QWK: 0.942</span>
                </div>
              </div>

              {/* Live Hover Telemetry Readout */}
              <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] text-[11px] font-mono text-center truncate">
                <span className="text-[#65736B]">Tele-Inspection: </span>
                <span className="font-bold text-[#124B3A]">
                  {hoveredMarker ? hoveredMarker : 'Hover markers for anatomical structural coordinates'}
                </span>
              </div>

              {/* Edge Hardware Strip */}
              <div className="grid grid-cols-3 gap-2 text-center pt-3 mt-3 border-t border-[#DDE5DC]">
                <div className="p-1.5 rounded-xl bg-[#F8F6EF]">
                  <div className="text-base font-extrabold font-display text-[#124B3A]">1.62s</div>
                  <div className="text-[10px] text-[#65736B] font-mono">Edge Latency</div>
                </div>
                <div className="p-1.5 rounded-xl bg-[#F8F6EF]">
                  <div className="text-base font-extrabold font-display text-[#1F7A5A]">28.6 MB</div>
                  <div className="text-[10px] text-[#65736B] font-mono">INT8 Weight</div>
                </div>
                <div className="p-1.5 rounded-xl bg-[#F8F6EF]">
                  <div className="text-base font-extrabold font-display text-[#E76F51]">0%</div>
                  <div className="text-[10px] text-[#65736B] font-mono">Severe Miss</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
