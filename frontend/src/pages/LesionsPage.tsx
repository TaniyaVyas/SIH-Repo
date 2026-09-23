import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ModulePipelineNav } from '../components/layout/ModulePipelineNav';
import { ActiveScanPipelineBanner } from '../components/layout/ActiveScanPipelineBanner';
import { useRetinaData } from '../context/RetinaContext';
import { useAuth } from '../context/AuthContext';
import {
  Crosshair,
  Filter,
  Eye,
  AlertTriangle,
  Info,
  Activity,
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  CircleDot
} from 'lucide-react';

interface DetectedLesion {
  id: string;
  type: 'Microaneurysms' | 'Hemorrhages' | 'Hard Exudates' | 'Soft Exudates';
  name: string;
  cx: number;
  cy: number;
  r: number;
  confidence: number;
  location: string;
  region: string;
  clinicalMeaning: string;
  color: string;
}

const LESION_MARKERS: DetectedLesion[] = [
  // 7 Microaneurysms (Coral Pinpoints)
  { id: 'ma-1', type: 'Microaneurysms', name: 'Microaneurysm #01', cx: 290, cy: 195, r: 3, confidence: 95.8, location: 'X: 290, Y: 195', region: 'Superior Parafoveal Arcade', clinicalMeaning: 'Focal saccular capillary out-pouching; earliest microvascular leakage indicator.', color: '#E76F51' },
  { id: 'ma-2', type: 'Microaneurysms', name: 'Microaneurysm #02', cx: 310, cy: 220, r: 2.8, confidence: 94.2, location: 'X: 310, Y: 220', region: 'Supero-Temporal Perifovea', clinicalMeaning: 'Capillary dilatation bordering avascular zone.', color: '#E76F51' },
  { id: 'ma-3', type: 'Microaneurysms', name: 'Microaneurysm #03', cx: 340, cy: 165, r: 3.2, confidence: 96.1, location: 'X: 340, Y: 165', region: 'Supero-Temporal Trunk', clinicalMeaning: 'Pericyte loss along terminal arteriolar branch.', color: '#E76F51' },
  { id: 'ma-4', type: 'Microaneurysms', name: 'Microaneurysm #04', cx: 325, cy: 245, r: 3, confidence: 93.4, location: 'X: 325, Y: 245', region: 'Infero-Temporal Perifovea', clinicalMeaning: 'Localized capillary wall decompensation.', color: '#E76F51' },
  { id: 'ma-5', type: 'Microaneurysms', name: 'Microaneurysm #05', cx: 245, cy: 235, r: 2.6, confidence: 92.8, location: 'X: 245, Y: 235', region: 'Nasal Mid-Periphery', clinicalMeaning: 'Mild isolated microaneurysm; routine monitoring.', color: '#E76F51' },
  { id: 'ma-6', type: 'Microaneurysms', name: 'Microaneurysm #06', cx: 265, cy: 160, r: 3, confidence: 94.7, location: 'X: 265, Y: 160', region: 'Supero-Nasal Branch', clinicalMeaning: 'Isolated deep microvascular capillary dilatation.', color: '#E76F51' },
  { id: 'ma-7', type: 'Microaneurysms', name: 'Microaneurysm #07', cx: 385, cy: 215, r: 3.2, confidence: 95.0, location: 'X: 385, Y: 215', region: 'Temporal Periphery', clinicalMeaning: 'Capillary outpouching distant from central fovea.', color: '#E76F51' },

  // 3 Hemorrhages (Deep Terracotta / Flame Bleeds)
  { id: 'hem-1', type: 'Hemorrhages', name: 'Dot & Blot Hemorrhage #01', cx: 285, cy: 265, r: 7.5, confidence: 97.4, location: 'X: 285, Y: 265', region: 'Infero-Temporal Arcade', clinicalMeaning: 'Ruptured capillary microaneurysm in inner nuclear retinal layers.', color: '#B9381E' },
  { id: 'hem-2', type: 'Hemorrhages', name: 'Blot Hemorrhage #02', cx: 330, cy: 290, r: 8.5, confidence: 98.2, location: 'X: 330, Y: 290', region: 'Inferior Temporal Quad', clinicalMeaning: 'Intraretinal hemorrhage density triggers ETDRS 4-2-1 criteria.', color: '#B9381E' },
  { id: 'hem-3', type: 'Hemorrhages', name: 'Flame Hemorrhage #03', cx: 230, cy: 145, r: 6.5, confidence: 96.0, location: 'X: 230, Y: 145', region: 'Supero-Nasal Arcade', clinicalMeaning: 'Superficial nerve fiber layer micro-bleed.', color: '#B9381E' },

  // 12 Hard Exudates (Saffron Lipids)
  { id: 'ex-1', type: 'Hard Exudates', name: 'Hard Exudate (Lipid Fleck #01)', cx: 315, cy: 175, r: 3.5, confidence: 96.8, location: 'X: 315, Y: 175', region: 'Circinate Ring • 480μm to FAZ', clinicalMeaning: 'Lipoprotein precipitate from hyperpermeable capillaries; macular threat present.', color: '#E9A23B' },
  { id: 'ex-2', type: 'Hard Exudates', name: 'Hard Exudate (Lipid Fleck #02)', cx: 324, cy: 168, r: 3.2, confidence: 97.1, location: 'X: 324, Y: 168', region: 'Circinate Ring (Supero-Temporal)', clinicalMeaning: 'Serum lipid deposition bordering macular avascular center.', color: '#E9A23B' },
  { id: 'ex-3', type: 'Hard Exudates', name: 'Hard Exudate (Lipid Fleck #03)', cx: 310, cy: 165, r: 2.8, confidence: 95.9, location: 'X: 310, Y: 165', region: 'Superior Perifovea', clinicalMeaning: 'Chronic lipid leakage cluster.', color: '#E9A23B' },
  { id: 'ex-4', type: 'Hard Exudates', name: 'Hard Exudate (Lipid Fleck #04)', cx: 330, cy: 178, r: 4.0, confidence: 98.0, location: 'X: 330, Y: 178', region: 'Macular Border Zone', clinicalMeaning: 'Dense crystalline lipoprotein plaque.', color: '#E9A23B' },
  { id: 'ex-5', type: 'Hard Exudates', name: 'Hard Exudate (Lipid Fleck #05)', cx: 355, cy: 220, r: 3.4, confidence: 96.5, location: 'X: 355, Y: 220', region: 'Perifoveal Capillary Border', clinicalMeaning: 'Extravasated lipid precipitate.', color: '#E9A23B' },
  { id: 'ex-6', type: 'Hard Exudates', name: 'Hard Exudate (Lipid Fleck #06)', cx: 362, cy: 226, r: 3.0, confidence: 95.4, location: 'X: 362, Y: 226', region: 'Temporal Parafovea', clinicalMeaning: 'Microvascular barrier breakdown.', color: '#E9A23B' },
  { id: 'ex-7', type: 'Hard Exudates', name: 'Hard Exudate (Lipid Fleck #07)', cx: 370, cy: 220, r: 3.6, confidence: 96.9, location: 'X: 370, Y: 220', region: 'Temporal Macular Margin', clinicalMeaning: 'Outer plexiform layer lipid accumulation.', color: '#E9A23B' },
  { id: 'ex-8', type: 'Hard Exudates', name: 'Hard Exudate (Lipid Fleck #08)', cx: 352, cy: 232, r: 2.8, confidence: 94.8, location: 'X: 352, Y: 232', region: 'Infero-Temporal Macula', clinicalMeaning: 'Capillary incompetence marker.', color: '#E9A23B' },
  { id: 'ex-9', type: 'Hard Exudates', name: 'Hard Exudate (Lipid Fleck #09)', cx: 368, cy: 195, r: 3.2, confidence: 95.6, location: 'X: 368, Y: 195', region: 'Horizontal Raphe Zone', clinicalMeaning: 'Serum transudate residue.', color: '#E9A23B' },
  { id: 'ex-10', type: 'Hard Exudates', name: 'Hard Exudate (Lipid Fleck #10)', cx: 375, cy: 202, r: 3.0, confidence: 96.0, location: 'X: 375, Y: 202', region: 'Temporal Papillomacular Bundle', clinicalMeaning: 'Circinate macular border deposition.', color: '#E9A23B' },
  { id: 'ex-11', type: 'Hard Exudates', name: 'Hard Exudate (Lipid Fleck #11)', cx: 345, cy: 240, r: 3.5, confidence: 97.5, location: 'X: 345, Y: 240', region: 'Inferior FAZ Margin', clinicalMeaning: 'Macular threat within 1 disc diameter.', color: '#E9A23B' },
  { id: 'ex-12', type: 'Hard Exudates', name: 'Hard Exudate (Lipid Fleck #12)', cx: 358, cy: 245, r: 3.2, confidence: 96.2, location: 'X: 358, Y: 245', region: 'Infero-Temporal Perifovea', clinicalMeaning: 'High-risk diabetic maculopathy indicator.', color: '#E9A23B' },

  // 4 Soft Exudates / Cotton Wool Spots (Ischemic Swelling)
  { id: 'cws-1', type: 'Soft Exudates', name: 'Cotton Wool Spot #01', cx: 280, cy: 140, r: 7.5, confidence: 93.5, location: 'X: 280, Y: 140', region: 'Supero-Temporal Arcade', clinicalMeaning: 'Axoplasmic stasis in retinal nerve fiber layer due to focal arteriolar occlusion.', color: '#D4A373' },
  { id: 'cws-2', type: 'Soft Exudates', name: 'Cotton Wool Spot #02', cx: 360, cy: 150, r: 8.5, confidence: 94.1, location: 'X: 360, Y: 150', region: 'Superior Temporal Arcade', clinicalMeaning: 'Local micro-infarction of terminal pre-capillary arterioles.', color: '#D4A373' },
  { id: 'cws-3', type: 'Soft Exudates', name: 'Cotton Wool Spot #03', cx: 395, cy: 240, r: 7.0, confidence: 91.8, location: 'X: 395, Y: 240', region: 'Temporal Periphery', clinicalMeaning: 'Axoplasmic debris buildup in ischemic nerve fiber bundles.', color: '#D4A373' },
  { id: 'cws-4', type: 'Soft Exudates', name: 'Cotton Wool Spot #04', cx: 270, cy: 300, r: 6.8, confidence: 92.4, location: 'X: 270, Y: 300', region: 'Infero-Temporal Branch', clinicalMeaning: 'Ischemic zone bordering venous beading segment.', color: '#D4A373' },
];

export const LesionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAuth();
  const { activeImage, pipelineResults } = useRetinaData();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLesion, setSelectedLesion] = useState<DetectedLesion>(LESION_MARKERS[7]); // default to first exudate
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [visibleMarkerCount, setVisibleMarkerCount] = useState<number>(0);

  // Staggered sequential appearance of lesion markers
  const triggerScanAndReveal = () => {
    setIsScanning(true);
    setVisibleMarkerCount(0);

    // Laser scan sweep for 1.2s
    setTimeout(() => {
      setIsScanning(false);
      // Reveal markers one by one
      LESION_MARKERS.forEach((_, idx) => {
        setTimeout(() => {
          setVisibleMarkerCount(idx + 1);
        }, idx * 60);
      });
    }, 1100);
  };

  useEffect(() => {
    triggerScanAndReveal();
  }, []);

  const filteredMarkers = selectedCategory === 'all'
    ? LESION_MARKERS
    : LESION_MARKERS.filter(m => m.type === selectedCategory);

  const categoryCounts = {
    'Microaneurysms': LESION_MARKERS.filter(m => m.type === 'Microaneurysms').length,
    'Hemorrhages': LESION_MARKERS.filter(m => m.type === 'Hemorrhages').length,
    'Hard Exudates': LESION_MARKERS.filter(m => m.type === 'Hard Exudates').length,
    'Soft Exudates': LESION_MARKERS.filter(m => m.type === 'Soft Exudates').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-16 space-y-8 select-none">
      {/* ─── 1. PAGE TITLE & HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A5A] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              {t.modules.m4Badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            {t.modules.m4Title}
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            {t.modules.m4Desc}
          </p>
        </div>

        {/* Action button to proceed */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/retinal-graph')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-md shadow-[#124B3A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            data-cursor="button"
          >
            <span>{t.modules.m4Action}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Active Scan Pipeline Banner */}
      <ActiveScanPipelineBanner currentModuleNumber={4} />

      {/* ─── 2. VISUAL STORY BANNER ─── */}
      <div className="flex items-center justify-center gap-3 text-xs font-mono font-bold text-[#65736B] py-2 px-4 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-2xs">
        <span className="text-[#124B3A] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#124B3A]" /> RETINA
        </span>
        <span className="text-[#E76F51]">➔</span>
        <span className="text-[#E76F51] flex items-center gap-1.5">
          <Crosshair size={13} className="text-[#E76F51]" /> LESION EVIDENCE
        </span>
        <span className="text-[#E9A23B]">➔</span>
        <span className="text-[#8A5612] flex items-center gap-1.5">
          <Activity size={13} className="text-[#E9A23B]" /> TOPOLOGICAL GRAPH READY
        </span>
      </div>

      {/* ─── 3. WORKSPACE GRID ─── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Large Interactive Retina with Overlaid Regions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Category Filter Pills & Re-scan */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#124B3A] text-white shadow-2xs'
                    : 'bg-[#F8F6EF] text-[#65736B] hover:bg-[#FAF4ED]'
                }`}
                data-cursor="button"
              >
                All Categories ({LESION_MARKERS.length})
              </button>

              {(['Microaneurysms', 'Hemorrhages', 'Hard Exudates', 'Soft Exudates'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-[#124B3A] text-white shadow-2xs'
                      : 'bg-[#F8F6EF] text-[#65736B] hover:bg-[#FAF4ED]'
                  }`}
                  data-cursor="button"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        cat === 'Microaneurysms' ? '#E76F51' :
                        cat === 'Hemorrhages' ? '#B9381E' :
                        cat === 'Hard Exudates' ? '#E9A23B' : '#D4A373'
                    }}
                  />
                  <span>{cat}</span>
                  <span className="font-mono text-[10px] opacity-70">({categoryCounts[cat]})</span>
                </button>
              ))}
            </div>

            <button
              onClick={triggerScanAndReveal}
              className="p-1.5 rounded-lg text-[#65736B] hover:text-[#124B3A] hover:bg-[#F8F6EF] transition-colors"
              title="Re-run Laser Scanning Analysis"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Interactive Retinal Canvas */}
          <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl bg-[#08170F] overflow-hidden border-2 border-[#1F7A5A]/30 shadow-inner flex items-center justify-center">
            {/* Viewport Top HUD */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#17221C]/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1F7A5A] animate-pulse" />
                <span>OVERLAY: {filteredMarkers.length} ACTIVE REGIONS</span>
              </span>
            </div>

            {/* SVG Retina Canvas */}
            <div className="relative w-[85%] h-[85%] max-w-[480px] aspect-square flex items-center justify-center">
              <svg viewBox="0 0 500 500" className="w-full h-full rounded-full shadow-2xl overflow-visible">
                <defs>
                  <clipPath id="lesionRetinaClip">
                    <circle cx="250" cy="250" r="240" />
                  </clipPath>
                  <radialGradient id="lesion-retina-bg" cx="50%" cy="50%" r="50%">
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

                {/* Retinal Fundus Base (Active Scan) */}
                {activeImage ? (
                  <image
                    href={activeImage}
                    x="10"
                    y="10"
                    width="480"
                    height="480"
                    clipPath="url(#lesionRetinaClip)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <circle cx="250" cy="250" r="240" fill="url(#lesion-retina-bg)" />
                )}

                {/* Faint Vascular Architecture Scaffolding */}
                <path d="M 160 250 Q 210 170 280 145 T 410 120" fill="none" stroke="#E76F51" strokeWidth="4" opacity="0.35" />
                <path d="M 160 250 Q 210 330 280 355 T 420 380" fill="none" stroke="#E76F51" strokeWidth="4" opacity="0.35" />
                <path d="M 160 250 Q 200 180 270 160 T 390 140" fill="none" stroke="#124B3A" strokeWidth="5" opacity="0.4" />
                <path d="M 160 250 Q 200 320 270 340 T 400 360" fill="none" stroke="#124B3A" strokeWidth="5" opacity="0.4" />

                {/* Optic Disc Landmark */}
                <circle cx="160" cy="250" r="36" fill="url(#disc-glow)" opacity="0.8" />
                <circle cx="160" cy="250" r="16" fill="#FAF4ED" opacity="0.9" />

                {/* Fovea Centralis (FAZ) Landmark */}
                <circle cx="340" cy="255" r="18" fill="#120402" stroke="#E76F51" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                <circle cx="340" cy="255" r="3" fill="#E76F51" />

                {/* ─── DETECTED LESION MARKERS (OVERLAYS) ─── */}
                {filteredMarkers.map((marker, idx) => {
                  const isVisible = isScanning ? false : idx < visibleMarkerCount;
                  if (!isVisible) return null;

                  const isSelected = selectedLesion?.id === marker.id;

                  return (
                    <g
                      key={marker.id}
                      onClick={() => setSelectedLesion(marker)}
                      style={{ cursor: 'pointer' }}
                      className="transition-transform duration-150"
                    >
                      {/* Subtle Outer Pulsing Ring */}
                      <circle
                        cx={marker.cx}
                        cy={marker.cy}
                        r={marker.r + 5}
                        fill="none"
                        stroke={marker.color}
                        strokeWidth="1"
                        opacity={isSelected ? 0.9 : 0.4}
                        className="animate-pulse"
                      />

                      {/* Selected Highlight Reticle */}
                      {isSelected && (
                        <g>
                          <circle
                            cx={marker.cx}
                            cy={marker.cy}
                            r={marker.r + 10}
                            fill="none"
                            stroke="#FFFDF8"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                            className="animate-spin-slow"
                          />
                          {/* Distance Vector to Fovea */}
                          <line
                            x1={marker.cx}
                            y1={marker.cy}
                            x2={340}
                            y2={255}
                            stroke="#E9A23B"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                            opacity="0.8"
                          />
                        </g>
                      )}

                      {/* Main Pathology Core Marker */}
                      <circle
                        cx={marker.cx}
                        cy={marker.cy}
                        r={isSelected ? marker.r + 1.5 : marker.r}
                        fill={marker.color}
                        stroke="#FFFDF8"
                        strokeWidth={isSelected ? 1.5 : 0.6}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Laser Scanning Line Animation */}
              {isScanning && (
                <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none flex items-center justify-center overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#E76F51] to-transparent shadow-[0_0_15px_#E76F51] animate-laser-sweep" />
                </div>
              )}
            </div>

            {/* Bottom HUD: Scanning feedback or selected quick info */}
            <div className="absolute bottom-4 left-4 right-4 z-30 p-2.5 rounded-xl bg-[#17221C]/90 backdrop-blur-md border border-white/10 text-xs font-mono text-white flex items-center justify-between shadow-lg">
              {isScanning ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E9A23B] animate-ping" />
                  <span>Sweeping multi-scale pathology receptive field...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-[#E76F51]" />
                    <span className="font-bold text-[#FFFDF8]">{selectedLesion.name}</span>
                    <span className="text-[10px] text-[#DDE5DC]">({selectedLesion.location})</span>
                  </div>
                  <div className="text-[#E9A23B] font-bold">
                    Confidence: {selectedLesion.confidence}%
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Marker Dossier & Side Panel Counts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Marker Detail Card */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <div className="flex items-center gap-2">
                <Crosshair size={16} className="text-[#E76F51]" />
                <h3 className="text-sm font-bold text-[#124B3A] uppercase tracking-wide">
                  Selected Lesion Dossier
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1F7A5A]/10 text-[#1F7A5A]">
                ACTIVE INSPECTION
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                <span className="text-[#65736B]">Lesion Type:</span>
                <span className="font-bold text-[#124B3A] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedLesion.color }} />
                  {selectedLesion.type}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                <span className="text-[#65736B]">Location Coordinates:</span>
                <span className="font-mono font-bold text-[#124B3A]">{selectedLesion.location}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                <span className="text-[#65736B]">Confidence:</span>
                <span className="font-mono font-bold text-[#1F7A5A]">{selectedLesion.confidence}% Model Confidence</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                <span className="text-[#65736B]">Retinal Region:</span>
                <span className="font-semibold text-[#8A5612] bg-[#FAF4ED] px-2 py-0.5 rounded border border-[#E9A23B]/30">
                  {selectedLesion.region}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF4ED] border border-[#E9A23B]/30 space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#8A5612] uppercase block">
                  CLINICAL PATHOLOGY SIGNIFICANCE
                </span>
                <p className="text-xs text-[#17221C] leading-relaxed">
                  {selectedLesion.clinicalMeaning}
                </p>
              </div>
            </div>
          </div>

          {/* Side Panel: Detected Counts & Confidence (DEMO DATA Label) */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <h4 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide">
                Pathology Census & Confidence
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FAF4ED] text-[#8A5612] border border-[#E9A23B]/30">
                DEMO DATA
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { name: 'Microaneurysms', count: '7 detected', avgConf: '94.2% Conf', color: '#E76F51' },
                { name: 'Hemorrhages', count: '3 detected', avgConf: '97.1% Conf', color: '#B9381E' },
                { name: 'Hard Exudates', count: '12 detected', avgConf: '96.8% Conf', color: '#E9A23B' },
                { name: 'Soft Exudates', count: '4 detected', avgConf: '92.5% Conf', color: '#D4A373' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-[#124B3A]">{item.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-[#17221C]">{item.count}</div>
                    <div className="text-[10px] text-[#1F7A5A]">{item.avgConf}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Pipeline Button */}
            <div className="pt-2">
              <button
                onClick={() => navigate('/retinal-graph')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-lg shadow-[#124B3A]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                data-cursor="button"
              >
                <span>Build Retinal Graph</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── END-TO-END PIPELINE NAVIGATION ─── */}
      <ModulePipelineNav currentModule={4} />
    </div>
  );
};
