import React, { useState, useEffect, useRef } from 'react';
import { SectionHeading } from './SectionHeading';
import {
  Eye, GitBranch, Target, Layers, Activity,
  Crosshair, Zap, CircleDot, BarChart3, CheckCircle2
} from 'lucide-react';

/* ───────────────────── types ───────────────────── */
interface VesselSegment {
  id: string;
  path: string;
  type: 'artery' | 'vein' | 'capillary';
  thickness: number;
  label?: string;
}

interface AnatomicalLandmark {
  id: string;
  name: string;
  shortName: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
  description: string;
  metrics: { label: string; value: string }[];
}

interface SegmentationMetric {
  name: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  status: 'nominal' | 'warning' | 'critical';
}

/* ───────────────────── vessel data ───────────────────── */
const VESSEL_SEGMENTS: VesselSegment[] = [
  // Main arteries (brighter / warmer)
  { id: 'cra-main', path: 'M 150,200 Q 180,190 220,185 T 310,195', type: 'artery', thickness: 4.5, label: 'Central Retinal Artery' },
  { id: 'st-artery', path: 'M 220,185 Q 260,140 320,110 T 420,90', type: 'artery', thickness: 3.5, label: 'Superior Temporal Artery' },
  { id: 'it-artery', path: 'M 220,185 Q 260,250 320,290 T 430,320', type: 'artery', thickness: 3.5, label: 'Inferior Temporal Artery' },
  { id: 'sn-artery', path: 'M 220,185 Q 200,140 180,100 T 130,60', type: 'artery', thickness: 3, label: 'Superior Nasal Artery' },
  { id: 'in-artery', path: 'M 220,185 Q 200,250 170,300 T 120,340', type: 'artery', thickness: 3 },
  // Secondary arterial branches
  { id: 'st-branch-1', path: 'M 320,110 Q 360,100 400,108', type: 'artery', thickness: 2.2 },
  { id: 'st-branch-2', path: 'M 280,130 Q 310,115 340,120', type: 'artery', thickness: 1.8 },
  { id: 'it-branch-1', path: 'M 320,290 Q 370,300 410,295', type: 'artery', thickness: 2.2 },
  { id: 'it-branch-2', path: 'M 290,270 Q 320,285 350,278', type: 'artery', thickness: 1.8 },

  // Main veins (darker / cooler green)
  { id: 'crv-main', path: 'M 150,210 Q 185,215 225,210 T 318,200', type: 'vein', thickness: 5, label: 'Central Retinal Vein' },
  { id: 'st-vein', path: 'M 225,210 Q 275,155 340,125 T 440,105', type: 'vein', thickness: 4, label: 'Superior Temporal Vein' },
  { id: 'it-vein', path: 'M 225,210 Q 275,265 340,305 T 450,335', type: 'vein', thickness: 4, label: 'Inferior Temporal Vein' },
  { id: 'sn-vein', path: 'M 225,210 Q 205,155 185,115 T 145,75', type: 'vein', thickness: 3.5 },
  { id: 'in-vein', path: 'M 225,210 Q 205,270 180,315 T 135,355', type: 'vein', thickness: 3.5 },
  // Secondary venous branches
  { id: 'st-vbranch-1', path: 'M 340,125 Q 380,118 415,125', type: 'vein', thickness: 2.5 },
  { id: 'it-vbranch-1', path: 'M 340,305 Q 385,312 420,308', type: 'vein', thickness: 2.5 },

  // Capillaries (fine network)
  { id: 'cap-1', path: 'M 350,170 Q 365,160 380,165', type: 'capillary', thickness: 1 },
  { id: 'cap-2', path: 'M 360,190 Q 375,185 390,192', type: 'capillary', thickness: 0.8 },
  { id: 'cap-3', path: 'M 340,220 Q 355,215 372,222', type: 'capillary', thickness: 0.8 },
  { id: 'cap-4', path: 'M 350,245 Q 367,240 382,248', type: 'capillary', thickness: 1 },
  { id: 'cap-5', path: 'M 370,155 Q 385,148 398,155', type: 'capillary', thickness: 0.7 },
  { id: 'cap-6', path: 'M 368,265 Q 383,258 396,266', type: 'capillary', thickness: 0.7 },
];

/* ───────────────────── landmarks ───────────────────── */
const LANDMARKS: AnatomicalLandmark[] = [
  {
    id: 'optic-disc',
    name: 'Optic Disc (Nerve Head)',
    shortName: 'OD',
    cx: 150, cy: 200, r: 34,
    color: '#E9A23B',
    description: 'Where retinal ganglion cell axons converge to form the optic nerve. Cup-to-disc ratio (CDR) is critical for glaucoma screening.',
    metrics: [
      { label: 'Diameter', value: '1,800 μm' },
      { label: 'CDR', value: '0.32 (Normal)' },
      { label: 'Rim Integrity', value: '100%' },
    ],
  },
  {
    id: 'fovea',
    name: 'Fovea Centralis',
    shortName: 'FC',
    cx: 355, cy: 200, r: 18,
    color: '#E76F51',
    description: 'The central pit responsible for sharp, high-acuity vision. Lesions near the fovea directly threaten sight — distance to fovea is the #1 severity predictor.',
    metrics: [
      { label: 'FAZ Radius', value: '750 μm' },
      { label: 'Cone Density', value: '199,000/mm²' },
      { label: 'Thickness', value: '212 μm' },
    ],
  },
  {
    id: 'macula',
    name: 'Macula Lutea',
    shortName: 'ML',
    cx: 355, cy: 200, r: 50,
    color: '#1F7A5A',
    description: 'The 5.5mm central region containing the fovea. Maculopathy — any pathology here — is the main cause of vision loss in diabetic retinopathy.',
    metrics: [
      { label: 'Diameter', value: '5,500 μm' },
      { label: 'Contains', value: 'Fovea + Parafovea' },
      { label: 'Xanthophyll', value: 'Present (Yellow Pigment)' },
    ],
  },
];

/* ───────────────────── segmentation metrics ───────────────────── */
const SEGMENTATION_METRICS: SegmentationMetric[] = [
  { name: 'Vessel Dice Score', value: 96.8, unit: '%', icon: <GitBranch size={18} />, status: 'nominal' },
  { name: 'A/V Classification', value: 94.2, unit: '% Acc', icon: <Layers size={18} />, status: 'nominal' },
  { name: 'Disc Detection', value: 99.7, unit: '% IoU', icon: <CircleDot size={18} />, status: 'nominal' },
  { name: 'Fovea Localization', value: 14.2, unit: 'px error', icon: <Crosshair size={18} />, status: 'nominal' },
  { name: 'Vessel Fractal Dim.', value: 1.42, unit: 'Df', icon: <Activity size={18} />, status: 'nominal' },
  { name: 'Bifurcation Points', value: 47, unit: 'detected', icon: <Zap size={18} />, status: 'nominal' },
];

/* ───────────────────── layer toggles ───────────────────── */
type OverlayLayer = 'vessels' | 'landmarks' | 'grid' | 'measurements';

const LAYER_CONFIG: { key: OverlayLayer; label: string; icon: React.ReactNode }[] = [
  { key: 'vessels', label: 'Vascular Tree', icon: <GitBranch size={14} /> },
  { key: 'landmarks', label: 'Landmarks', icon: <Target size={14} /> },
  { key: 'grid', label: 'Polar Grid', icon: <Crosshair size={14} /> },
  { key: 'measurements', label: 'Measurements', icon: <BarChart3 size={14} /> },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export const Module3VesselExtraction: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Set<OverlayLayer>>(
    new Set(['vessels', 'landmarks'])
  );
  const [selectedLandmark, setSelectedLandmark] = useState<string>('fovea');
  const [vesselProgress, setVesselProgress] = useState(0);
  const [hoveredVessel, setHoveredVessel] = useState<string | null>(null);
  const [scanAngle, setScanAngle] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Animated vessel drawing
  useEffect(() => {
    if (!isVisible) return;
    const start = performance.now();
    const duration = 2200;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      setVesselProgress(1 - Math.pow(1 - progress, 3));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible]);

  // Continuous scan ring rotation
  useEffect(() => {
    if (!isVisible) return;
    let raf: number;
    const rotate = () => {
      setScanAngle(a => (a + 0.4) % 360);
      raf = requestAnimationFrame(rotate);
    };
    raf = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(raf);
  }, [isVisible]);

  const toggleLayer = (layer: OverlayLayer) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  const currentLandmark = LANDMARKS.find(l => l.id === selectedLandmark) || LANDMARKS[0];

  const getVesselColor = (type: VesselSegment['type'], id: string) => {
    if (hoveredVessel === id) return '#E9A23B';
    switch (type) {
      case 'artery': return '#E76F51';
      case 'vein': return '#124B3A';
      case 'capillary': return '#1F7A5A';
    }
  };

  return (
    <section
      ref={sectionRef}
      id="module-3-vessel"
      className="py-20 md:py-28 bg-[#F8F6EF] relative overflow-hidden"
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle, #124B3A 1px, transparent 1px)`,
        backgroundSize: '30px 30px',
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          badge="Module 3 — Retinal Anatomy & Vessel Extraction"
          title="Mapping the Vascular Architecture"
          subtitle="High-precision segmentation of the arteriolar-venular tree, optic disc boundary, and fovea localization — the anatomical foundation for structure-aware graph construction."
        />

        <div className="grid lg:grid-cols-12 gap-8 mt-12">

          {/* ─── LEFT: Interactive Retinal Vessel SVG ─── */}
          <div className="lg:col-span-7">
            <div className="relative bg-[#0A1F14] rounded-2xl border border-[#1F7A5A]/30 overflow-hidden shadow-2xl">
              {/* Layer Toggle Bar */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-2 flex-wrap">
                {LAYER_CONFIG.map(layer => (
                  <button
                    key={layer.key}
                    onClick={() => toggleLayer(layer.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 backdrop-blur-sm ${
                      activeLayers.has(layer.key)
                        ? 'bg-[#1F7A5A]/90 text-[#FFFDF8] shadow-lg shadow-[#1F7A5A]/30'
                        : 'bg-[#17221C]/60 text-[#65736B] hover:bg-[#17221C]/80 hover:text-[#FFFDF8]/80'
                    }`}
                  >
                    {layer.icon}
                    {layer.label}
                  </button>
                ))}
              </div>

              {/* SVG Canvas */}
              <svg
                viewBox="0 0 500 400"
                className="w-full aspect-[5/4]"
                style={{ filter: 'drop-shadow(0 0 40px rgba(31,122,90,0.15))' }}
              >
                <defs>
                  {/* Glow filters */}
                  <filter id="vessel-glow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="landmark-glow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="scan-glow">
                    <feGaussianBlur stdDeviation="3" />
                  </filter>
                  {/* Radial gradient for background */}
                  <radialGradient id="retina-bg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1a3a28" />
                    <stop offset="60%" stopColor="#0f2a1c" />
                    <stop offset="100%" stopColor="#071510" />
                  </radialGradient>
                  {/* Vessel gradient animations */}
                  <linearGradient id="artery-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#E76F51" />
                    <stop offset="100%" stopColor="#c45a3e" />
                  </linearGradient>
                  <linearGradient id="vein-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#124B3A" />
                    <stop offset="100%" stopColor="#0d3328" />
                  </linearGradient>
                </defs>

                {/* Background */}
                <circle cx="250" cy="200" r="185" fill="url(#retina-bg)" />
                <circle cx="250" cy="200" r="185" fill="none" stroke="#1F7A5A" strokeWidth="0.5" opacity="0.3" />

                {/* ─ Polar Grid Layer ─ */}
                {activeLayers.has('grid') && (
                  <g opacity={isVisible ? 0.15 : 0} style={{ transition: 'opacity 0.8s ease' }}>
                    {[40, 80, 120, 160].map(r => (
                      <circle key={r} cx="250" cy="200" r={r} fill="none" stroke="#1F7A5A" strokeWidth="0.4" strokeDasharray="4 6" />
                    ))}
                    {[0, 45, 90, 135].map(angle => {
                      const rad = (angle * Math.PI) / 180;
                      return (
                        <line
                          key={angle}
                          x1={250 - 160 * Math.cos(rad)}
                          y1={200 - 160 * Math.sin(rad)}
                          x2={250 + 160 * Math.cos(rad)}
                          y2={200 + 160 * Math.sin(rad)}
                          stroke="#1F7A5A"
                          strokeWidth="0.3"
                          strokeDasharray="3 8"
                        />
                      );
                    })}
                    {/* Quadrant labels */}
                    <text x="380" y="105" fill="#1F7A5A" fontSize="8" fontFamily="monospace" opacity="0.6">ST</text>
                    <text x="380" y="310" fill="#1F7A5A" fontSize="8" fontFamily="monospace" opacity="0.6">IT</text>
                    <text x="110" y="105" fill="#1F7A5A" fontSize="8" fontFamily="monospace" opacity="0.6">SN</text>
                    <text x="110" y="310" fill="#1F7A5A" fontSize="8" fontFamily="monospace" opacity="0.6">IN</text>
                  </g>
                )}

                {/* ─ Vessel Tree Layer ─ */}
                {activeLayers.has('vessels') && (
                  <g filter="url(#vessel-glow)">
                    {VESSEL_SEGMENTS.map((seg) => (
                      <path
                        key={seg.id}
                        d={seg.path}
                        fill="none"
                        stroke={getVesselColor(seg.type, seg.id)}
                        strokeWidth={seg.thickness}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={isVisible ? (hoveredVessel === seg.id ? 1 : 0.85) : 0}
                        strokeDasharray="1000"
                        strokeDashoffset={1000 - 1000 * vesselProgress}
                        style={{
                          transition: `stroke 0.3s ease, opacity 0.3s ease`,
                          cursor: seg.label ? 'pointer' : 'default',
                        }}
                        onMouseEnter={() => seg.label && setHoveredVessel(seg.id)}
                        onMouseLeave={() => setHoveredVessel(null)}
                      />
                    ))}
                    {/* Vessel label on hover */}
                    {hoveredVessel && (() => {
                      const seg = VESSEL_SEGMENTS.find(s => s.id === hoveredVessel);
                      if (!seg?.label) return null;
                      return (
                        <g>
                          <rect x="180" y="365" width={seg.label.length * 7 + 20} height="22" rx="4" fill="#17221C" opacity="0.9" />
                          <text x="190" y="380" fill="#FFFDF8" fontSize="10" fontFamily="monospace">{seg.label}</text>
                        </g>
                      );
                    })()}
                  </g>
                )}

                {/* ─ Measurement Lines Layer ─ */}
                {activeLayers.has('measurements') && isVisible && (
                  <g opacity="0.7">
                    {/* OD to Fovea distance */}
                    <line x1="150" y1="200" x2="355" y2="200" stroke="#E9A23B" strokeWidth="1" strokeDasharray="4 3" />
                    <circle cx="150" cy="200" r="3" fill="#E9A23B" />
                    <circle cx="355" cy="200" r="3" fill="#E9A23B" />
                    <rect x="220" y="182" width="66" height="16" rx="3" fill="#17221C" opacity="0.85" />
                    <text x="227" y="193" fill="#E9A23B" fontSize="8.5" fontFamily="monospace" fontWeight="bold">3,450 μm</text>
                    {/* Disc diameter */}
                    <line x1="116" y1="175" x2="184" y2="175" stroke="#E9A23B" strokeWidth="0.8" strokeDasharray="3 3" />
                    <text x="128" y="170" fill="#E9A23B" fontSize="7" fontFamily="monospace">1,800μm</text>
                    {/* FAZ radius */}
                    <line x1="355" y1="200" x2="373" y2="200" stroke="#E76F51" strokeWidth="0.8" strokeDasharray="3 3" />
                    <text x="360" y="212" fill="#E76F51" fontSize="7" fontFamily="monospace">FAZ 750μm</text>
                  </g>
                )}

                {/* ─ Landmark Layer ─ */}
                {activeLayers.has('landmarks') && (
                  <g filter="url(#landmark-glow)">
                    {LANDMARKS.map(lm => (
                      <g key={lm.id}>
                        {/* Pulsing ring */}
                        <circle
                          cx={lm.cx} cy={lm.cy} r={lm.r + 4}
                          fill="none"
                          stroke={lm.color}
                          strokeWidth="1"
                          opacity={selectedLandmark === lm.id ? 0.6 : 0.2}
                          style={{ animation: selectedLandmark === lm.id ? 'pulse-ring 2s ease-in-out infinite' : 'none' }}
                        />
                        {/* Main circle */}
                        <circle
                          cx={lm.cx} cy={lm.cy} r={lm.r}
                          fill={lm.id === 'macula' ? 'none' : `${lm.color}15`}
                          stroke={lm.color}
                          strokeWidth={selectedLandmark === lm.id ? 2.5 : 1.5}
                          strokeDasharray={lm.id === 'macula' ? '6 4' : 'none'}
                          opacity={isVisible ? (selectedLandmark === lm.id ? 1 : 0.6) : 0}
                          style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                          onClick={() => setSelectedLandmark(lm.id)}
                        />
                        {/* Label */}
                        <text
                          x={lm.cx}
                          y={lm.cy + lm.r + 14}
                          textAnchor="middle"
                          fill={lm.color}
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                          opacity={isVisible ? 0.9 : 0}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedLandmark(lm.id)}
                        >
                          {lm.shortName}
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* ─ Scanning Ring ─ */}
                <g transform={`rotate(${scanAngle}, 250, 200)`}>
                  <circle cx="250" cy="200" r="175" fill="none" stroke="#1F7A5A" strokeWidth="1.5"
                    strokeDasharray="30 520" opacity="0.5" />
                  <circle cx="250" cy="25" r="3" fill="#1F7A5A" opacity="0.8">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                </g>

                {/* ─ Corner Status ─ */}
                <g>
                  <rect x="12" y="360" width="120" height="28" rx="4" fill="#17221C" opacity="0.8" />
                  <circle cx="24" cy="374" r="4" fill="#1F7A5A">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x="34" y="378" fill="#FFFDF8" fontSize="8.5" fontFamily="monospace" fontWeight="bold">SEGMENTING</text>
                </g>

                {/* A/V legend */}
                <g>
                  <rect x="370" y="360" width="118" height="28" rx="4" fill="#17221C" opacity="0.8" />
                  <circle cx="384" cy="370" r="4" fill="#E76F51" />
                  <text x="392" y="374" fill="#FFFDF8" fontSize="7.5" fontFamily="monospace">Artery</text>
                  <circle cx="430" cy="370" r="4" fill="#124B3A" />
                  <text x="438" y="374" fill="#FFFDF8" fontSize="7.5" fontFamily="monospace">Vein</text>
                  <circle cx="384" cy="382" r="3" fill="#1F7A5A" />
                  <text x="392" y="386" fill="#FFFDF8" fontSize="7.5" fontFamily="monospace">Capillary</text>
                </g>
              </svg>

              {/* Bottom status bar */}
              <div className="bg-[#0f1f16] border-t border-[#1F7A5A]/20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1F7A5A] animate-pulse" />
                  <span className="text-[#FFFDF8]/70 text-xs font-mono tracking-wide">
                    U-Net + Attention Gate — Vessel Segmentation Active
                  </span>
                </div>
                <span className="text-[#1F7A5A] text-xs font-mono font-bold">
                  {Math.round(vesselProgress * 100)}% Extracted
                </span>
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Info Panel ─── */}
          <div className="lg:col-span-5 flex flex-col gap-5">

            {/* Landmark Detail Card */}
            <div className="bg-white rounded-2xl border border-[#DDE5DC] shadow-lg overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-[#124B3A] to-[#1F7A5A]">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-[#FFFDF8]" />
                  <h3 className="text-sm font-bold text-[#FFFDF8] tracking-wide">ANATOMICAL LANDMARK</h3>
                </div>
              </div>

              {/* Landmark tabs */}
              <div className="flex border-b border-[#DDE5DC]">
                {LANDMARKS.map(lm => (
                  <button
                    key={lm.id}
                    onClick={() => setSelectedLandmark(lm.id)}
                    className={`flex-1 py-3 text-xs font-bold tracking-wide text-center transition-all duration-300 ${
                      selectedLandmark === lm.id
                        ? 'text-[#124B3A] border-b-2 border-[#124B3A] bg-[#F8F6EF]'
                        : 'text-[#65736B] hover:text-[#124B3A] hover:bg-[#FFFDF8]'
                    }`}
                  >
                    {lm.shortName}
                  </button>
                ))}
              </div>

              <div className="p-5">
                <h4 className="text-base font-bold text-[#124B3A] mb-1">
                  {currentLandmark.name}
                </h4>
                <p className="text-xs text-[#65736B] leading-relaxed mb-4">
                  {currentLandmark.description}
                </p>
                <div className="space-y-2">
                  {currentLandmark.metrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#F8F6EF] rounded-lg">
                      <span className="text-xs text-[#65736B] font-medium">{m.label}</span>
                      <span className="text-xs font-bold font-mono text-[#124B3A]">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Segmentation Metrics Grid */}
            <div className="bg-white rounded-2xl border border-[#DDE5DC] shadow-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={16} className="text-[#1F7A5A]" />
                <h3 className="text-sm font-bold text-[#124B3A] tracking-wide">SEGMENTATION METRICS</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SEGMENTATION_METRICS.map((metric, i) => (
                  <MetricCard key={i} metric={metric} isVisible={isVisible} delay={i * 150} />
                ))}
              </div>
            </div>

            {/* Pipeline Position Badge */}
            <div className="bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] rounded-2xl p-5 text-[#FFFDF8]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono tracking-wider opacity-80">PIPELINE POSITION</span>
                <span className="px-2.5 py-1 rounded-full bg-[#FFFDF8]/15 text-xs font-bold">
                  3 / 11
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} className="text-[#E9A23B]" />
                <span className="text-xs opacity-80">Feeds → Module 4 (Lesion Detection) & Module 5 (Graph Construction)</span>
              </div>
              <div className="w-full bg-[#FFFDF8]/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#E9A23B] to-[#E76F51] transition-all duration-1000"
                  style={{ width: isVisible ? '27.3%' : '0%' }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[9px] font-mono opacity-50">
                <span>Acquisition</span>
                <span>Classification</span>
                <span>Referral</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom: Vessel Extraction Pipeline Steps ─── */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Green Channel Isolation',
              desc: 'Extract max-contrast channel from RGB fundus — green provides optimal vessel-background separation.',
              tech: 'I_green(x,y)',
            },
            {
              step: '02',
              title: 'CLAHE + Morphological Top-Hat',
              desc: 'Contrast-limited adaptive histogram equalization followed by morphological top-hat for thin vessel enhancement.',
              tech: 'TH(f) = f − γ_B(f)',
            },
            {
              step: '03',
              title: 'U-Net Segmentation',
              desc: 'Attention-gated U-Net with skip connections extracts binary vessel probability map at 96.8% Dice.',
              tech: 'P(vessel|x) > τ',
            },
            {
              step: '04',
              title: 'A/V Classification + Landmarks',
              desc: 'Dual-head decoder classifies arteries vs veins and localizes optic disc + fovea simultaneously.',
              tech: 'argmax(σ(W·h + b))',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#DDE5DC] p-5 hover:shadow-lg hover:border-[#1F7A5A]/30 transition-all duration-300 group"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 150}ms`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-lg bg-[#124B3A] text-[#FFFDF8] text-xs font-bold flex items-center justify-center font-mono">
                  {item.step}
                </span>
                <h4 className="text-sm font-bold text-[#124B3A] group-hover:text-[#1F7A5A] transition-colors">
                  {item.title}
                </h4>
              </div>
              <p className="text-xs text-[#65736B] leading-relaxed mb-3">{item.desc}</p>
              <div className="px-2.5 py-1.5 bg-[#F8F6EF] rounded-md inline-block">
                <code className="text-[10px] font-mono text-[#124B3A] font-bold">{item.tech}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { r: ${0}; opacity: 0.6; }
          50% { r: ${8}; opacity: 0.2; }
        }
      `}</style>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENT: MetricCard
   ═══════════════════════════════════════════════════════════════ */
const MetricCard: React.FC<{
  metric: SegmentationMetric;
  isVisible: boolean;
  delay: number;
}> = ({ metric, isVisible, delay }) => {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      const start = performance.now();
      const duration = 1200;
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayVal(metric.value * eased);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [isVisible, delay, metric.value]);

  const statusColor = metric.status === 'nominal' ? '#1F7A5A'
    : metric.status === 'warning' ? '#E9A23B'
    : '#E76F51';

  return (
    <div
      className="bg-[#F8F6EF] rounded-lg p-3 border border-[#DDE5DC]/50 hover:border-[#1F7A5A]/30 transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: `all 0.5s ease ${delay}ms`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[#1F7A5A]">{metric.icon}</div>
        <span className="text-[10px] text-[#65736B] font-semibold tracking-wide leading-tight">{metric.name}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold font-mono" style={{ color: statusColor }}>
          {Number.isInteger(metric.value) ? Math.round(displayVal) : displayVal.toFixed(1)}
        </span>
        <span className="text-[10px] text-[#65736B] font-mono">{metric.unit}</span>
      </div>
    </div>
  );
};
