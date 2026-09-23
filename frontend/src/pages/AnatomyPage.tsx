import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ModulePipelineNav } from '../components/layout/ModulePipelineNav';
import { ActiveScanPipelineBanner } from '../components/layout/ActiveScanPipelineBanner';
import { useRetinaData } from '../context/RetinaContext';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  GitBranch,
  Target,
  Layers,
  Activity,
  Crosshair,
  Zap,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CircleDot,
  Play
} from 'lucide-react';

interface VesselBranch {
  id: string;
  name: string;
  type: 'artery' | 'vein';
  path: string;
  thickness: number;
  caliber: string;
}

const VESSEL_DATA: VesselBranch[] = [
  // Arteries (Terracotta / Coral)
  { id: 'cra-trunk', name: 'Central Retinal Artery Trunk', type: 'artery', path: 'M 155,250 Q 185,240 225,235 T 310,245', thickness: 5.5, caliber: '142 μm' },
  { id: 'st-artery', name: 'Superior Temporal Artery', type: 'artery', path: 'M 225,235 Q 265,180 325,145 T 435,115', thickness: 4.2, caliber: '118 μm' },
  { id: 'it-artery', name: 'Inferior Temporal Artery', type: 'artery', path: 'M 225,235 Q 265,310 325,360 T 440,390', thickness: 4.2, caliber: '116 μm' },
  { id: 'sn-artery', name: 'Superior Nasal Artery', type: 'artery', path: 'M 225,235 Q 200,180 170,130 T 115,85', thickness: 3.8, caliber: '98 μm' },
  { id: 'in-artery', name: 'Inferior Nasal Artery', type: 'artery', path: 'M 225,235 Q 200,310 165,370 T 110,415', thickness: 3.8, caliber: '96 μm' },
  { id: 'st-branch-1', name: 'Supero-Temporal Terminal Branch', type: 'artery', path: 'M 325,145 Q 375,130 425,140', thickness: 2.5, caliber: '64 μm' },
  { id: 'it-branch-1', name: 'Infero-Temporal Terminal Branch', type: 'artery', path: 'M 325,360 Q 380,375 430,365', thickness: 2.5, caliber: '62 μm' },

  // Veins (Deep Forest Green)
  { id: 'crv-trunk', name: 'Central Retinal Vein Trunk', type: 'vein', path: 'M 155,260 Q 190,265 230,260 T 320,250', thickness: 6.5, caliber: '168 μm' },
  { id: 'st-vein', name: 'Superior Temporal Vein', type: 'vein', path: 'M 230,260 Q 280,195 345,160 T 450,135', thickness: 5.2, caliber: '144 μm' },
  { id: 'it-vein', name: 'Inferior Temporal Vein', type: 'vein', path: 'M 230,260 Q 280,325 345,375 T 455,405', thickness: 5.2, caliber: '142 μm' },
  { id: 'sn-vein', name: 'Superior Nasal Vein', type: 'vein', path: 'M 230,260 Q 205,195 180,145 T 135,100', thickness: 4.4, caliber: '118 μm' },
  { id: 'in-vein', name: 'Inferior Nasal Vein', type: 'vein', path: 'M 230,260 Q 205,325 175,380 T 125,430', thickness: 4.4, caliber: '115 μm' },
  { id: 'st-vbranch', name: 'Supero-Temporal Venular Arcade', type: 'vein', path: 'M 345,160 Q 395,150 435,160', thickness: 3.2, caliber: '78 μm' },
  { id: 'it-vbranch', name: 'Infero-Temporal Venular Arcade', type: 'vein', path: 'M 345,375 Q 400,385 440,380', thickness: 3.2, caliber: '76 μm' },

  // Perifoveal Capillary Arcade
  { id: 'cap-upper', name: 'Perifoveal Capillary Loop (Upper)', type: 'artery', path: 'M 345,215 Q 360,205 375,215', thickness: 1.5, caliber: '32 μm' },
  { id: 'cap-lower', name: 'Perifoveal Capillary Loop (Lower)', type: 'artery', path: 'M 345,295 Q 360,305 375,295', thickness: 1.5, caliber: '32 μm' },
];

export const AnatomyPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAuth();
  const { activeImage, pipelineResults } = useRetinaData();

  // Layer toggles
  const [layers, setLayers] = useState({
    originalRetina: true,
    bloodVessels: true,
    opticDisc: true,
    fovea: true,
    macularRegion: true,
  });

  // Animated draw-in sequence state
  const [animationStep, setAnimationStep] = useState<number>(0); // 0=start, 1=vessels, 2=disc, 3=fovea, 4=complete
  const [vesselDrawProgress, setVesselDrawProgress] = useState<number>(1);
  const [hoveredVessel, setHoveredVessel] = useState<VesselBranch | null>(null);

  // Focus / Zoom into structures (Disc / Fovea)
  const [focusTarget, setFocusTarget] = useState<'overview' | 'optic-disc' | 'fovea'>('overview');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Structural panel active tab
  const [activePanelTab, setActivePanelTab] = useState<'vessel' | 'disc' | 'fovea' | 'macula'>('vessel');

  // Trigger sequential animation on load
  const runEntranceAnimation = () => {
    setAnimationStep(0);
    setVesselDrawProgress(0);

    // Step 1: Vessel segmentation draws itself
    setTimeout(() => {
      setAnimationStep(1);
      const start = performance.now();
      const duration = 1600;
      const animateVessels = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        setVesselDrawProgress(1 - Math.pow(1 - progress, 3));
        if (progress < 1) requestAnimationFrame(animateVessels);
      };
      requestAnimationFrame(animateVessels);
    }, 400);

    // Step 2: Optic disc appears
    setTimeout(() => setAnimationStep(2), 2100);

    // Step 3: Fovea appears
    setTimeout(() => setAnimationStep(3), 2700);

    // Step 4: Full markers active
    setTimeout(() => setAnimationStep(4), 3300);
  };

  useEffect(() => {
    runEntranceAnimation();
  }, []);

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Zoom into Optic Disc
  const zoomToOpticDisc = () => {
    setFocusTarget('optic-disc');
    setActivePanelTab('disc');
    setZoomLevel(2.0);
    setPanOffset({ x: 140, y: 0 });
  };

  // Zoom into Fovea
  const zoomToFovea = () => {
    setFocusTarget('fovea');
    setActivePanelTab('fovea');
    setZoomLevel(2.2);
    setPanOffset({ x: -140, y: -10 });
  };

  // Reset to full view
  const resetToOverview = () => {
    setFocusTarget('overview');
    setActivePanelTab('vessel');
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-16 space-y-8 select-none">
      {/* ─── 1. PAGE HEADER & KEY MESSAGE ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A5A] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              {t.modules.m3Badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            {t.modules.m3Title}
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            {t.modules.m3Desc}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Key Message Pill */}
          <div className="px-3.5 py-1.5 rounded-full bg-[#FAF4ED] border border-[#E9A23B]/40 text-xs font-mono font-bold text-[#8A5612] shadow-2xs flex items-center gap-2">
            <Sparkles size={14} className="text-[#E9A23B]" />
            <span>"Structure before prediction."</span>
          </div>

          <button
            onClick={() => navigate('/lesions')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-md shadow-[#124B3A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            data-cursor="button"
          >
            <span>{t.modules.m3Action}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Active Scan Pipeline Banner */}
      <ActiveScanPipelineBanner currentModuleNumber={3} />

      {/* ─── 2. WORKSPACE GRID ─── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Large Interactive Retinal Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Layer Toggles Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-xs">
            <span className="text-[11px] font-mono font-bold text-[#65736B] uppercase px-2">
              Toggle Layers:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'originalRetina' as const, label: 'Original Retina' },
                { key: 'bloodVessels' as const, label: 'Blood Vessels' },
                { key: 'opticDisc' as const, label: 'Optic Disc' },
                { key: 'fovea' as const, label: 'Fovea' },
                { key: 'macularRegion' as const, label: 'Macular Region' },
              ].map(layer => (
                <button
                  key={layer.key}
                  onClick={() => toggleLayer(layer.key)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    layers[layer.key]
                      ? 'bg-[#124B3A] text-white shadow-2xs'
                      : 'bg-[#F8F6EF] text-[#65736B] hover:bg-[#FAF4ED]'
                  }`}
                  data-cursor="button"
                >
                  {layer.label}
                </button>
              ))}
            </div>

            {/* Replay Entrance Animation Button */}
            <button
              onClick={runEntranceAnimation}
              className="p-1.5 rounded-lg text-[#65736B] hover:text-[#124B3A] hover:bg-[#F8F6EF] transition-colors"
              title="Replay Vessel Draw-in Sequence"
            >
              <Play size={14} />
            </button>
          </div>

          {/* Interactive Retinal Viewport */}
          <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl bg-[#08170F] overflow-hidden border-2 border-[#1F7A5A]/30 shadow-inner flex items-center justify-center">
            {/* Camera Zoom & Target Indicators HUD */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#17221C]/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white">
                VIEW: <strong className="text-[#E9A23B] uppercase">{focusTarget}</strong> ({Math.round(zoomLevel * 100)}%)
              </span>
              {focusTarget !== 'overview' && (
                <button
                  onClick={resetToOverview}
                  className="px-2.5 py-1 rounded-lg bg-[#124B3A] text-white text-[10px] font-mono font-bold hover:bg-[#175643] transition-all flex items-center gap-1 shadow-xs"
                >
                  <RotateCcw size={11} /> Reset to Overview
                </button>
              )}
            </div>

            {/* Quick Structure Focus Jump Buttons */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 p-1 rounded-xl bg-[#17221C]/80 backdrop-blur-md border border-white/10 shadow-md">
              <button
                onClick={zoomToOpticDisc}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                  focusTarget === 'optic-disc'
                    ? 'bg-[#E9A23B] text-[#17221C]'
                    : 'text-white hover:bg-white/10'
                }`}
                title="Zoom into Optic Disc"
              >
                Inspect Disc
              </button>
              <button
                onClick={zoomToFovea}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                  focusTarget === 'fovea'
                    ? 'bg-[#E76F51] text-white'
                    : 'text-white hover:bg-white/10'
                }`}
                title="Zoom into Fovea"
              >
                Inspect Fovea
              </button>
            </div>

            {/* ─── RETINAL SVG CANVAS (ZOOM & PAN TRANSFORMS) ─── */}
            <div
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transition: 'transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1)',
              }}
              className="relative w-[85%] h-[85%] max-w-[480px] aspect-square flex items-center justify-center"
            >
              <svg viewBox="0 0 500 500" className="w-full h-full rounded-full shadow-2xl overflow-visible">
                <defs>
                  <clipPath id="anatomyRetinaClip">
                    <circle cx="250" cy="250" r="240" />
                  </clipPath>
                  <radialGradient id="retina-base" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4a180f" />
                    <stop offset="50%" stopColor="#350f08" />
                    <stop offset="85%" stopColor="#1e0703" />
                    <stop offset="100%" stopColor="#0a0201" />
                  </radialGradient>
                  <radialGradient id="disc-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FAF4ED" />
                    <stop offset="45%" stopColor="#E9A23B" />
                    <stop offset="100%" stopColor="#a35f0f" />
                  </radialGradient>
                </defs>

                {/* 1. LAYER: ORIGINAL RETINA (Displays Active Scan) */}
                {layers.originalRetina && (
                  activeImage ? (
                    <image
                      href={activeImage}
                      x="10"
                      y="10"
                      width="480"
                      height="480"
                      clipPath="url(#anatomyRetinaClip)"
                      preserveAspectRatio="xMidYMid slice"
                    />
                  ) : (
                    <circle cx="250" cy="250" r="240" fill="url(#retina-base)" />
                  )
                )}

                {/* 2. LAYER: MACULAR REGION (5.5mm parafoveal boundary) */}
                {layers.macularRegion && animationStep >= 3 && (
                  <g>
                    <circle
                      cx="355"
                      cy="255"
                      r="65"
                      fill="#1F7A5A"
                      fillOpacity="0.06"
                      stroke="#1F7A5A"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />
                    <text x="355" y="335" fill="#1F7A5A" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      MACULA LUTEA (5,500 μm)
                    </text>
                  </g>
                )}

                {/* 3. LAYER: BLOOD VESSELS (ANIMATED STROKE DASH) */}
                {layers.bloodVessels && animationStep >= 1 && (
                  <g>
                    {VESSEL_DATA.map((vessel) => {
                      const isHovered = hoveredVessel?.id === vessel.id;
                      const isArtery = vessel.type === 'artery';

                      return (
                        <path
                          key={vessel.id}
                          d={vessel.path}
                          fill="none"
                          stroke={
                            isHovered
                              ? '#FFFDF8'
                              : isArtery
                              ? '#E76F51'
                              : '#124B3A'
                          }
                          strokeWidth={isHovered ? vessel.thickness + 2.5 : vessel.thickness}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="1000"
                          strokeDashoffset={1000 - 1000 * vesselDrawProgress}
                          style={{
                            cursor: 'pointer',
                            transition: 'stroke 0.2s, stroke-width 0.2s',
                          }}
                          onMouseEnter={() => {
                            setHoveredVessel(vessel);
                            setActivePanelTab('vessel');
                          }}
                          onMouseLeave={() => setHoveredVessel(null)}
                        />
                      );
                    })}
                  </g>
                )}

                {/* 4. LAYER: OPTIC DISC (INTERACTIVE ON CLICK) */}
                {layers.opticDisc && animationStep >= 2 && (
                  <g
                    onClick={zoomToOpticDisc}
                    style={{ cursor: 'pointer' }}
                    className="group"
                  >
                    {/* Neuro-retinal rim */}
                    <circle
                      cx="155"
                      cy="250"
                      r="36"
                      fill="url(#disc-glow)"
                      stroke="#E9A23B"
                      strokeWidth={focusTarget === 'optic-disc' ? '3' : '1'}
                      className="transition-all"
                    />
                    {/* Physiological cup */}
                    <circle cx="155" cy="250" r="16" fill="#FAF4ED" opacity="0.95" />

                    <text x="155" y="298" fill="#E9A23B" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      OPTIC DISC (OD)
                    </text>
                  </g>
                )}

                {/* 5. LAYER: FOVEA (INTERACTIVE ON CLICK) */}
                {layers.fovea && animationStep >= 3 && (
                  <g
                    onClick={zoomToFovea}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Foveal Avascular Zone (FAZ) */}
                    <circle
                      cx="355"
                      cy="255"
                      r="18"
                      fill="#120402"
                      stroke="#E76F51"
                      strokeWidth={focusTarget === 'fovea' ? '2.5' : '1'}
                      strokeDasharray="2 2"
                    />
                    {/* Foveal reflex point */}
                    <circle cx="355" cy="255" r="3" fill="#E76F51" />

                    <text x="355" y="240" fill="#E76F51" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      FOVEA (FAZ)
                    </text>
                  </g>
                )}

                {/* Measurement Distance Line between Disc and Fovea */}
                {animationStep >= 4 && layers.opticDisc && layers.fovea && focusTarget === 'overview' && (
                  <g opacity="0.8">
                    <line x1="155" y1="250" x2="355" y2="255" stroke="#E9A23B" strokeWidth="1" strokeDasharray="3 3" />
                    <rect x="225" y="238" width="60" height="14" rx="3" fill="#17221C" opacity="0.9" />
                    <text x="255" y="248" fill="#E9A23B" fontSize="7.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      3,450 μm
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Hovered Vessel Tooltip HUD */}
            {hoveredVessel && (
              <div className="absolute bottom-4 left-4 right-4 z-30 p-2.5 rounded-xl bg-[#17221C]/90 backdrop-blur-md border border-[#DDE5DC]/20 text-xs font-mono text-white flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: hoveredVessel.type === 'artery' ? '#E76F51' : '#1F7A5A' }}
                  />
                  <span className="font-bold text-[#FFFDF8]">{hoveredVessel.name}</span>
                </div>
                <div className="text-[#E9A23B]">Caliber: {hoveredVessel.caliber}</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Structural Panel & Animated Statistics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-[#124B3A]" />
                <h3 className="text-sm font-bold text-[#124B3A] uppercase tracking-wide">
                  Structural Anatomy Panel
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1F7A5A]/10 text-[#1F7A5A]">
                EXTRACTED
              </span>
            </div>

            {/* Structure Category Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#F8F6EF] rounded-xl text-xs font-semibold">
              {[
                { key: 'vessel' as const, label: 'Vessels' },
                { key: 'disc' as const, label: 'Optic Disc' },
                { key: 'fovea' as const, label: 'Fovea' },
                { key: 'macula' as const, label: 'Macula' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActivePanelTab(tab.key);
                    if (tab.key === 'disc') zoomToOpticDisc();
                    else if (tab.key === 'fovea') zoomToFovea();
                    else resetToOverview();
                  }}
                  className={`py-2 rounded-lg text-center transition-all ${
                    activePanelTab === tab.key
                      ? 'bg-[#124B3A] text-white shadow-xs'
                      : 'text-[#65736B] hover:text-[#124B3A]'
                  }`}
                  data-cursor="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Content Based on Selected Structural Category */}
            <div className="space-y-3 text-xs">
              {activePanelTab === 'vessel' && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                    <span className="text-[#65736B]">A/V Caliber Ratio:</span>
                    <span className="font-mono font-bold text-[#1F7A5A]">0.67 (Physiological Normal)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                    <span className="text-[#65736B]">Vessel Fractal Dimension:</span>
                    <span className="font-mono font-bold text-[#124B3A]">1.42 Df</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                    <span className="text-[#65736B]">Bifurcation Branch Points:</span>
                    <span className="font-mono font-bold text-[#124B3A]">47 Detected</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                    <span className="text-[#65736B]">U-Net Segmentation Dice:</span>
                    <span className="font-mono font-bold text-[#1F7A5A]">96.8% Accuracy</span>
                  </div>
                </div>
              )}

              {activePanelTab === 'disc' && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#FAF4ED] border border-[#E9A23B]/30 flex items-center justify-between">
                    <span className="text-[#8A5612]">Disc Diameter:</span>
                    <span className="font-mono font-bold text-[#124B3A]">1,800 μm</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                    <span className="text-[#65736B]">Cup-to-Disc Ratio (CDR):</span>
                    <span className="font-mono font-bold text-[#1F7A5A]">0.32 (No Glaucoma)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                    <span className="text-[#65736B]">Neuro-Retinal Rim:</span>
                    <span className="font-mono font-bold text-[#1F7A5A]">100% Intact</span>
                  </div>
                </div>
              )}

              {activePanelTab === 'fovea' && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#FDF0EC] border border-[#F48C71]/40 flex items-center justify-between">
                    <span className="text-[#9A3B24]">FAZ Capillary Radius:</span>
                    <span className="font-mono font-bold text-[#E76F51]">750 μm</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                    <span className="text-[#65736B]">Central Retinal Thickness:</span>
                    <span className="font-mono font-bold text-[#124B3A]">212 μm</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                    <span className="text-[#65736B]">Foveolar Cone Density:</span>
                    <span className="font-mono font-bold text-[#124B3A]">199,000 / mm²</span>
                  </div>
                </div>
              )}

              {activePanelTab === 'macula' && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                    <span className="text-[#65736B]">Macular Zone Diameter:</span>
                    <span className="font-mono font-bold text-[#124B3A]">5,500 μm (5.5mm)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                    <span className="text-[#65736B]">Xanthophyll Lutein Pigment:</span>
                    <span className="font-mono font-bold text-[#1F7A5A]">Present & Dense</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                    <span className="text-[#65736B]">Threat Sensitivity:</span>
                    <span className="font-mono font-bold text-[#E76F51]">Maximum Priority</span>
                  </div>
                </div>
              )}
            </div>

            {/* Next Pipeline Step Callout */}
            <div className="pt-2">
              <button
                onClick={() => navigate('/lesions')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-lg shadow-[#124B3A]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                data-cursor="button"
              >
                <span>Continue to Lesion Detection</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Biological Principle Card */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-5 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide flex items-center gap-1.5">
              <Info size={14} className="text-[#1F7A5A]" />
              Why Anatomical Segmentation Precedes Diagnosis
            </h4>
            <p className="text-xs text-[#65736B] leading-relaxed">
              Standard deep neural networks treat every pixel equally. RETINA-FUSION 360 uses the anatomical landmark positions to construct a coordinate-relative graph, ensuring lesions near the fovea (maculopathy threat) trigger urgent care while peripheral microaneurysms follow routine monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* ─── END-TO-END PIPELINE NAVIGATION ─── */}
      <ModulePipelineNav currentModule={3} />
    </div>
  );
};
