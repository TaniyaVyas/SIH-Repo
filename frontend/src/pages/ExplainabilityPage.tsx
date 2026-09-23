import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ModulePipelineNav } from '../components/layout/ModulePipelineNav';
import { ActiveScanPipelineBanner } from '../components/layout/ActiveScanPipelineBanner';
import { useRetinaData } from '../context/RetinaContext';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  Activity,
  Network,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Crosshair,
  Layers,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Compass,
  Zap,
  Target
} from 'lucide-react';

export type ExplanationTab = 'visual' | 'structural' | 'evidence';

interface RetinalRegion {
  id: string;
  name: string;
  locationLabel: string;
  cx: number;
  cy: number;
  r: number;
  camWeight: number; // Grad-CAM attention weight %
  visualExplanation: string;
  structuralExplanation: string;
  evidenceExplanation: string;
  plainLanguageSummary: string;
  activeNodes: string[];
}

const REGIONS: RetinalRegion[] = [
  {
    id: 'macula',
    name: 'Macular Perifovea & FAZ Border',
    locationLabel: 'Supero-Temporal Macular Arcade (420μm to FAZ)',
    cx: 350,
    cy: 230,
    r: 45,
    camWeight: 96.4,
    visualExplanation:
      'High-intensity saliency centroid (96.4% activation). Grad-CAM heat concentrates tightly around yellowish lipoprotein exudates bordering the foveal avascular perimeter.',
    structuralExplanation:
      'Critical 420 μm geodesic proximity to Fovea Centralis. Lies inside the 500μm macular threat radius where fluid extravasation causes irreversible photoreceptor disruption.',
    evidenceExplanation:
      'ETDRS Clinically Significant Macular Edema (CSME) risk confirmed. 12 Hard Exudates arranged in a classical circinate ring originating from deep capillary plexus leakage.',
    plainLanguageSummary:
      'The model is primarily concerned with lipid deposits encroaching within 420 μm of the visual center, which poses an immediate threat to sharp central vision.',
    activeNodes: ['fovea', 'lesion-hex1', 'junc-3'],
  },
  {
    id: 'arcade',
    name: 'Supero-Temporal Vascular Arcade',
    locationLabel: 'Superior Arteriolar Trunk & Bifurcation Alpha',
    cx: 270,
    cy: 160,
    r: 40,
    camWeight: 84.2,
    visualExplanation:
      'Secondary saliency peak (84.2% activation) over terminal pre-capillary arterioles exhibiting focal micro-infarctions and cotton wool spot axoplasmic debris.',
    structuralExplanation:
      'Involves Order-1 Arteriolar Bifurcation (branching angle 74.2°). Vascular caliber narrowing (118μm) with downstream capillary dropout.',
    evidenceExplanation:
      'Focal cotton wool spot (CWS-01) and microaneurysms cluster (MA-01) indicating localized tissue hypoxia and inner retinal ischemia.',
    plainLanguageSummary:
      'The AI identified an ischemic nerve fiber patch and leaking micro-vessels along the upper main blood vessel feeding the retina.',
    activeNodes: ['vessel-sta', 'junc-1', 'lesion-cws1'],
  },
  {
    id: 'inferior',
    name: 'Infero-Temporal Mid-Periphery',
    locationLabel: 'Inferior Arcade Papillomacular Margin',
    cx: 280,
    cy: 310,
    r: 42,
    camWeight: 78.6,
    visualExplanation:
      'Dense focal activation (78.6% activation) centered on deep intraretinal dot and blot hemorrhages embedded in the inner nuclear layer.',
    structuralExplanation:
      'Associated with Inferior Temporal Venule and downstream capillary bed. Venous flow dynamics show elevated hemodynamic resistance.',
    evidenceExplanation:
      'Blot hemorrhage (HEM-01) satisfies the ETDRS 4-2-1 diagnostic criteria for quadrant hemorrhage density in non-proliferative diabetic retinopathy.',
    plainLanguageSummary:
      'Micro-bleeding detected in the lower retinal quadrant contributes directly to confirming Severe Non-Proliferative Diabetic Retinopathy.',
    activeNodes: ['vessel-ita', 'junc-2', 'lesion-hem1'],
  },
  {
    id: 'disc',
    name: 'Optic Nerve Head (Optic Disc)',
    locationLabel: 'Nasal Anatomical Coordinate Anchor',
    cx: 155,
    cy: 250,
    r: 36,
    camWeight: 45.1,
    visualExplanation:
      'Moderate structural attention (45.1% activation) used strictly as an anatomical origin for geometric distance normalization and vessel tracking.',
    structuralExplanation:
      'Anatomical root origin: Cup-to-Disc Ratio (CDR 0.32) is physiological normal. Neuro-retinal rim intact; negative for glaucomatous cupping.',
    evidenceExplanation:
      'Zero neovascularization of the disc (NVD = 0.00). Confirms patient has not crossed into Proliferative DR (Grade 4).',
    plainLanguageSummary:
      'The optic disc serves as a normal anatomical landmark. The AI confirmed absence of abnormal new blood vessels on the optic nerve.',
    activeNodes: ['disc', 'vessel-sta', 'vessel-ita'],
  },
];

export const ExplainabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeImage } = useRetinaData();
  const { t } = useAuth();

  // Selected Region & Active Tab
  const [selectedRegionId, setSelectedRegionId] = useState<string>('macula');
  const [activeTab, setActiveTab] = useState<ExplanationTab>('visual');

  // Animation reveal sequence
  const [animKey, setAnimKey] = useState<number>(0);
  const [isRevealing, setIsRevealing] = useState<boolean>(true);

  const activeRegion = REGIONS.find(r => r.id === selectedRegionId) || REGIONS[0];

  const triggerReveal = () => {
    setIsRevealing(true);
    setAnimKey(prev => prev + 1);
    setTimeout(() => {
      setIsRevealing(false);
    }, 800);
  };

  useEffect(() => {
    triggerReveal();
  }, [selectedRegionId, activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-16 space-y-8 select-none">
      {/* ─── 1. PAGE TITLE & HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              {t.modules.m7Badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            {t.modules.m7Title}
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            {t.modules.m7Desc}
          </p>
        </div>

        {/* Action button to proceed */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/evidence')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-md shadow-[#124B3A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            data-cursor="button"
          >
            <span>{t.modules.m7Action}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ─── ACTIVE SCAN PIPELINE RUNNER ─── */}
      <ActiveScanPipelineBanner currentModule="explainability" />

      {/* ─── 2. REGION SELECTOR BAR ─── */}
      <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#65736B] uppercase">
            SELECT RETINAL FOCUS REGION:
          </span>
          <span className="text-[10px] text-[#65736B] hidden sm:inline">
            (Synchronizes Original Retina, Grad-CAM, and Retinal Graph simultaneously)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {REGIONS.map(region => (
            <button
              key={region.id}
              onClick={() => setSelectedRegionId(region.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                selectedRegionId === region.id
                  ? 'bg-[#124B3A] text-white border-[#124B3A] shadow-2xs'
                  : 'bg-[#F8F6EF] text-[#17221C] border-[#DDE5DC] hover:bg-[#FAF4ED]'
              }`}
              data-cursor="button"
            >
              <Target size={13} className={selectedRegionId === region.id ? 'text-[#E9A23B]' : 'text-[#65736B]'} />
              <span>{region.name.split(' ')[0]}</span>
              <span className="text-[10px] font-mono opacity-80">({region.camWeight}%)</span>
            </button>
          ))}

          <button
            onClick={triggerReveal}
            className="p-1.5 rounded-lg text-[#65736B] hover:text-[#124B3A] hover:bg-[#F8F6EF] transition-colors ml-2"
            title="Re-run XAI Synthesis Sequence"
          >
            <RotateCcw size={14} className={isRevealing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ─── 3. THREE SYNCHRONIZED VISUALIZATIONS ─── */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* VIEW 1: Original Retina */}
        <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DC]">
            <div className="flex items-center gap-2">
              <Eye size={15} className="text-[#124B3A]" />
              <h3 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide">
                1. Original Retina
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8F6EF] text-[#65736B]">
              Fundus Photograph
            </span>
          </div>

          <div className="relative aspect-square rounded-2xl bg-[#08170F] overflow-hidden border border-[#1F7A5A]/30 flex items-center justify-center">
            <svg viewBox="0 0 500 500" className="w-[90%] h-[90%] rounded-full shadow-lg">
              <defs>
                <clipPath id="orig-retina-clip">
                  <circle cx="250" cy="250" r="240" />
                </clipPath>
                <radialGradient id="orig-retina-bg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#4a180f" />
                  <stop offset="45%" stopColor="#350f08" />
                  <stop offset="85%" stopColor="#1e0703" />
                  <stop offset="100%" stopColor="#0a0201" />
                </radialGradient>
              </defs>

              <circle cx="250" cy="250" r="240" fill="url(#orig-retina-bg)" />
              {activeImage && (
                <image
                  href={activeImage}
                  x="10"
                  y="10"
                  width="480"
                  height="480"
                  clipPath="url(#orig-retina-clip)"
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
              {/* Landmark Shading */}
              <circle cx="155" cy="250" r="32" fill="#E9A23B" opacity="0.85" />
              <circle cx="350" cy="255" r="16" fill="#120402" opacity="0.9" />

              {/* Vascular Architecture */}
              <path d="M 155 250 Q 200 170 235 165 T 295 155 T 410 120" fill="none" stroke="#E76F51" strokeWidth="3.5" opacity="0.45" />
              <path d="M 155 250 Q 200 330 240 335 T 305 345 T 420 380" fill="none" stroke="#E76F51" strokeWidth="3.5" opacity="0.45" />
              <path d="M 155 250 Q 220 150 280 135 T 390 100" fill="none" stroke="#124B3A" strokeWidth="4.5" opacity="0.5" />
              <path d="M 155 250 Q 220 350 275 370 T 400 395" fill="none" stroke="#124B3A" strokeWidth="4.5" opacity="0.5" />

              {/* Lesion Clusters */}
              <circle cx="380" cy="220" r="7" fill="#E9A23B" opacity="0.9" />
              <circle cx="395" cy="235" r="5" fill="#E9A23B" opacity="0.9" />
              <circle cx="265" cy="185" r="8" fill="#D4A373" opacity="0.85" />
              <circle cx="260" cy="275" r="9" fill="#B9381E" opacity="0.9" />

              {/* SYNCHRONIZED HIGHLIGHT REGION */}
              <g className="transition-all duration-300">
                <circle
                  cx={activeRegion.cx}
                  cy={activeRegion.cy}
                  r={activeRegion.r}
                  fill="none"
                  stroke="#FFFDF8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  className="animate-spin-slow"
                />
                <circle
                  cx={activeRegion.cx}
                  cy={activeRegion.cy}
                  r={activeRegion.r + 8}
                  fill="none"
                  stroke="#E9A23B"
                  strokeWidth="1"
                  opacity="0.7"
                  className="animate-pulse"
                />
              </g>
            </svg>

            {/* Bottom Tag */}
            <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-lg bg-[#17221C]/80 backdrop-blur-md text-[10px] font-mono text-[#DDE5DC] text-center">
              Selected: <span className="text-white font-bold">{activeRegion.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* VIEW 2: Grad-CAM / Attention Map */}
        <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DC]">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-[#E76F51]" />
              <h3 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide">
                2. Grad-CAM / Attention Map
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF4ED] text-[#E76F51] border border-[#E76F51]/30">
              ConvNeXt Heatmap
            </span>
          </div>

          <div className="relative aspect-square rounded-2xl bg-[#08170F] overflow-hidden border border-[#E76F51]/30 flex items-center justify-center">
            <svg viewBox="0 0 500 500" className="w-[90%] h-[90%] rounded-full shadow-lg">
              <defs>
                <clipPath id="cam-retina-clip">
                  <circle cx="250" cy="250" r="240" />
                </clipPath>
                <radialGradient id="cam-bg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1a0805" />
                  <stop offset="60%" stopColor="#0d0403" />
                  <stop offset="100%" stopColor="#050101" />
                </radialGradient>

                {/* Saliency Heatmap Gradients (Warm Palette - No Blue) */}
                <radialGradient id="heat-macula" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E76F51" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#E9A23B" stopOpacity="0.75" />
                  <stop offset="70%" stopColor="#D4A373" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#E76F51" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heat-arcade" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E76F51" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#E9A23B" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#E76F51" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heat-inferior" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E9A23B" stopOpacity="0.85" />
                  <stop offset="60%" stopColor="#D4A373" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#E9A23B" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="250" cy="250" r="240" fill="url(#cam-bg)" />

              {activeImage && (
                <image
                  href={activeImage}
                  x="10"
                  y="10"
                  width="480"
                  height="480"
                  clipPath="url(#cam-retina-clip)"
                  opacity="0.4"
                  preserveAspectRatio="xMidYMid slice"
                />
              )}

              {/* Underlying Attention Contours */}
              <circle cx="350" cy="230" r="75" fill="url(#heat-macula)" />
              <circle cx="270" cy="160" r="60" fill="url(#heat-arcade)" />
              <circle cx="280" cy="310" r="65" fill="url(#heat-inferior)" />

              {/* Faint Structural Wireframe */}
              <circle cx="155" cy="250" r="30" fill="none" stroke="#E9A23B" strokeWidth="1" opacity="0.4" />
              <path d="M 155 250 Q 200 170 270 160 T 380 120" fill="none" stroke="#FFFDF8" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

              {/* SYNCHRONIZED HIGHLIGHT ACTIVATION */}
              <g className="transition-all duration-300">
                <circle
                  cx={activeRegion.cx}
                  cy={activeRegion.cy}
                  r={activeRegion.r + 10}
                  fill="none"
                  stroke="#E76F51"
                  strokeWidth="2.5"
                  className="animate-pulse"
                />
                <circle
                  cx={activeRegion.cx}
                  cy={activeRegion.cy}
                  r="5"
                  fill="#FFFDF8"
                  stroke="#E76F51"
                  strokeWidth="2"
                />
              </g>
            </svg>

            {/* Bottom Attention Value Tag */}
            <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-lg bg-[#17221C]/80 backdrop-blur-md text-[10px] font-mono text-[#E9A23B] text-center font-bold">
              Peak Saliency: {activeRegion.camWeight}% Attribution
            </div>
          </div>
        </div>

        {/* VIEW 3: Retinal Graph Overlay */}
        <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DC]">
            <div className="flex items-center gap-2">
              <Network size={15} className="text-[#1F7A5A]" />
              <h3 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide">
                3. Retinal Graph Overlay
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8F3EE] text-[#1F7A5A] border border-[#1F7A5A]/30">
              GNN Topology
            </span>
          </div>

          <div className="relative aspect-square rounded-2xl bg-[#08170F] overflow-hidden border border-[#1F7A5A]/30 flex items-center justify-center">
            <svg viewBox="0 0 500 500" className="w-[90%] h-[90%] rounded-full shadow-lg">
              <defs>
                <radialGradient id="graph-bg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0a1f14" />
                  <stop offset="70%" stopColor="#05120c" />
                  <stop offset="100%" stopColor="#020805" />
                </radialGradient>
              </defs>

              <circle cx="250" cy="250" r="240" fill="url(#graph-bg)" />

              {/* Graph Edges */}
              <line x1="155" y1="250" x2="235" y2="165" stroke="#1F7A5A" strokeWidth="2" opacity="0.6" />
              <line x1="155" y1="250" x2="240" y2="335" stroke="#1F7A5A" strokeWidth="2" opacity="0.6" />
              <line x1="155" y1="250" x2="350" y2="255" stroke="#E9A23B" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
              <line x1="235" y1="165" x2="295" y2="155" stroke="#1F7A5A" strokeWidth="2" opacity="0.6" />
              <line x1="295" y1="155" x2="350" y2="200" stroke="#1F7A5A" strokeWidth="2" opacity="0.7" />
              <line x1="350" y1="200" x2="350" y2="255" stroke="#1F7A5A" strokeWidth="2.5" opacity="0.8" />
              <line x1="380" y1="220" x2="350" y2="255" stroke="#E76F51" strokeWidth="2" strokeDasharray="3 3" opacity="0.9" />
              <line x1="260" y1="275" x2="240" y2="335" stroke="#E76F51" strokeWidth="2" opacity="0.8" />

              {/* Standard Nodes */}
              <circle cx="155" cy="250" r="16" fill="#E9A23B" stroke="#FFFDF8" strokeWidth="1.5" />
              <circle cx="350" cy="255" r="14" fill="#124B3A" stroke="#FFFDF8" strokeWidth="1.5" />
              <circle cx="235" cy="165" r="9" fill="#1F7A5A" stroke="#FFFDF8" strokeWidth="1" />
              <circle cx="240" cy="335" r="9" fill="#1F7A5A" stroke="#FFFDF8" strokeWidth="1" />
              <circle cx="295" cy="155" r="8" fill="#2D8A68" stroke="#FFFDF8" strokeWidth="1" />
              <circle cx="350" cy="200" r="8" fill="#2D8A68" stroke="#FFFDF8" strokeWidth="1" />
              <circle cx="380" cy="220" r="9" fill="#E76F51" stroke="#FFFDF8" strokeWidth="1.2" />
              <circle cx="260" cy="275" r="9" fill="#E76F51" stroke="#FFFDF8" strokeWidth="1.2" />

              {/* SYNCHRONIZED HIGHLIGHT NODES/EDGES */}
              <g className="transition-all duration-300">
                <circle
                  cx={activeRegion.cx}
                  cy={activeRegion.cy}
                  r={activeRegion.r}
                  fill="none"
                  stroke="#1F7A5A"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  className="animate-spin-slow"
                />
                <circle
                  cx={activeRegion.cx}
                  cy={activeRegion.cy}
                  r={activeRegion.r + 12}
                  fill="none"
                  stroke="#1F7A5A"
                  strokeWidth="1"
                  opacity="0.6"
                  className="animate-ping"
                />
              </g>
            </svg>

            {/* Bottom Graph Tag */}
            <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-lg bg-[#17221C]/80 backdrop-blur-md text-[10px] font-mono text-[#1F7A5A] text-center font-bold">
              Active Graph Nodes: {activeRegion.activeNodes.length} Subgraph Elements
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. EXPLANATION LEVELS & TABS (Visual, Structural, Evidence) ─── */}
      <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-6">
        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDE5DC] pb-4">
          <div className="flex items-center gap-2">
            {(['visual', 'structural', 'evidence'] as const).map(tabKey => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                  activeTab === tabKey
                    ? 'bg-[#124B3A] text-white border-[#124B3A] shadow-xs'
                    : 'bg-[#F8F6EF] text-[#65736B] border-[#DDE5DC] hover:bg-[#FAF4ED]'
                }`}
                data-cursor="button"
              >
                {tabKey === 'visual' && <Eye size={14} />}
                {tabKey === 'structural' && <Layers size={14} />}
                {tabKey === 'evidence' && <FileCheck size={14} />}
                <span>{tabKey.toUpperCase()}</span>
              </button>
            ))}
          </div>

          <span className="text-xs font-mono font-bold text-[#8A5612] bg-[#FAF4ED] px-3 py-1 rounded-lg border border-[#E9A23B]/30">
            {activeRegion.locationLabel}
          </span>
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${selectedRegionId}-${animKey}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Visual Tab */}
            {activeTab === 'visual' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E76F51] uppercase">
                  <Sparkles size={14} />
                  <span>"What regions influenced the prediction?"</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] text-xs text-[#17221C] leading-relaxed space-y-2">
                  <p className="font-semibold text-[#124B3A]">
                    {activeRegion.visualExplanation}
                  </p>
                  <p className="text-[#65736B]">
                    Multi-scale gradient-weighted class activation mapping (Grad-CAM) reveals that convolutional attention prioritizes high-contrast microvascular abnormalities over healthy surrounding stroma.
                  </p>
                </div>
              </div>
            )}

            {/* Structural Tab */}
            {activeTab === 'structural' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1F7A5A] uppercase">
                  <Layers size={14} />
                  <span>"What retinal structures contributed?"</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] text-xs text-[#17221C] leading-relaxed space-y-2">
                  <p className="font-semibold text-[#124B3A]">
                    {activeRegion.structuralExplanation}
                  </p>
                  <p className="text-[#65736B]">
                    Unlike black-box models, RETINA-FUSION 360 models the biological relationship between the fovea, optic nerve head, and branching vessel calibers to weigh central threats higher than peripheral changes.
                  </p>
                </div>
              </div>
            )}

            {/* Evidence Tab */}
            {activeTab === 'evidence' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#124B3A] uppercase">
                  <FileCheck size={14} />
                  <span>"What detected evidence supports the prediction?"</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] text-xs text-[#17221C] leading-relaxed space-y-2">
                  <p className="font-semibold text-[#124B3A]">
                    {activeRegion.evidenceExplanation}
                  </p>
                  <p className="text-[#65736B]">
                    Every prediction is backed by explicit lesion segmentation masks, verified distance coordinates, and standard international consensus staging guidelines (ICDR / ETDRS).
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── 5. PLAIN-LANGUAGE AI EXPLANATION PANEL ─── */}
        <div className="p-5 rounded-2xl bg-[#FAF4ED] border border-[#E9A23B]/40 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E9A23B]/30">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#124B3A]" />
              <h4 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide">
                Plain-Language Clinical Explanation
              </h4>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFFDF8] text-[#8A5612] border border-[#E9A23B]/30">
              DEMO EXPLANATION
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#17221C] leading-relaxed font-serif">
            "{activeRegion.plainLanguageSummary} The model's prediction was influenced by detected lesion regions and their relationship with retinal structures."
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#E9A23B]/30 text-[11px] text-[#65736B]">
            <span>
              <strong>Confidence in this region:</strong> {activeRegion.camWeight}% Attribution Weight
            </span>
            <span>
              <strong>Clinical Action:</strong> Proceed to clinical evidence verification
            </span>
          </div>
        </div>

        {/* Action CTA Button */}
        <div className="pt-2">
          <button
            onClick={() => navigate('/evidence')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-lg shadow-[#124B3A]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
            data-cursor="button"
          >
            <span>Verify Evidence (Evidence Engine)</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* ─── END-TO-END PIPELINE NAVIGATION ─── */}
        <ModulePipelineNav currentModule={7} />
      </div>
    </div>
  );
};
