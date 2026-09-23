import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  ShieldCheck,
  Eye,
  Crosshair,
  Network,
  BrainCircuit,
  Sparkles,
  Hospital,
  ArrowDown,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronsUpDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface PipelineStage {
  id: number;
  number: string;
  name: string;
  shortName: string;
  targetId: string;
  path: string;
  icon: React.ElementType;
  badge: string;
  description: string;
  metric: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 1,
    number: '01',
    name: 'Acquisition',
    shortName: 'Acquisition',
    targetId: 'stage-acquisition',
    path: '/acquisition',
    icon: Camera,
    badge: 'M1 • OPTICS',
    description: 'Point-of-care fundus photography via portable camera or smartphone adapter.',
    metric: '50° FOV • 24-bit RGB',
  },
  {
    id: 2,
    number: '02',
    name: 'Quality',
    shortName: 'Quality',
    targetId: 'stage-quality',
    path: '/preprocessing',
    icon: ShieldCheck,
    badge: 'M2 • QUALITY',
    description: 'ISO-10940 optical validation: blur, illumination, focus, and media opacity gating.',
    metric: '94% Gradability Pass',
  },
  {
    id: 3,
    number: '03',
    name: 'Anatomy',
    shortName: 'Anatomy',
    targetId: 'stage-anatomy',
    path: '/anatomy',
    icon: Eye,
    badge: 'M3 • ANATOMY',
    description: 'Sub-pixel segmentation of Optic Disc, Cup-to-Disc ratio (CDR), and Foveal Center.',
    metric: '96.8% Dice Score',
  },
  {
    id: 4,
    number: '04',
    name: 'Lesions',
    shortName: 'Lesions',
    targetId: 'stage-lesions',
    path: '/lesions',
    icon: Crosshair,
    badge: 'M4 • LESIONS',
    description: 'Deterministic quantification of microaneurysms, hemorrhages, and hard exudates.',
    metric: '4-Quadrant ETDRS',
  },
  {
    id: 5,
    number: '05',
    name: 'Graph Engine',
    shortName: 'Graph Engine',
    targetId: 'stage-graph',
    path: '/retinal-graph',
    icon: Network,
    badge: 'M5 • TOPOLOGY',
    description: 'Graph Neural Network mapping vascular junctions, branching angles, and geometric tortuosity.',
    metric: '28 Nodes • 54 Edges',
  },
  {
    id: 6,
    number: '06',
    name: 'Grading',
    shortName: 'Grading',
    targetId: 'stage-grading',
    path: '/classification',
    icon: BrainCircuit,
    badge: 'M6 • 5-TIER ICDR',
    description: 'Autonomous ICDR classification with epistemic uncertainty quantification.',
    metric: '98.2% Sensitivity',
  },
  {
    id: 7,
    number: '07',
    name: 'Explainability',
    shortName: 'Explainability',
    targetId: 'stage-explainability',
    path: '/explainability',
    icon: Sparkles,
    badge: 'M7 • XAI ATTENTION',
    description: 'Multi-scale spatial attention heatmaps with pixel-level counterfactual evidence.',
    metric: 'High Faithfulness',
  },
  {
    id: 8,
    number: '08',
    name: 'Care & Triage',
    shortName: 'Care & Triage',
    targetId: 'stage-care',
    path: '/care',
    icon: Hospital,
    badge: 'M8 • ABDM REFERRAL',
    description: 'Rule-based clinical triage, Ayushman Bharat referral, and tele-ophthalmology escalation.',
    metric: 'ABDM FHIR R4 Ready',
  },
];

export const FloatingAIJourney: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAuth();
  const [activeStage, setActiveStage] = useState<number>(1);
  const [hoveredStage, setHoveredStage] = useState<PipelineStage | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Target element finder with fallback
  const getStageElement = useCallback((targetId: string) => {
    return (
      document.getElementById(targetId) ||
      document.getElementById(targetId.replace('stage-', '')) ||
      document.querySelector(`[data-stage="${targetId}"]`)
    );
  }, []);

  const handleStageClick = (stage: PipelineStage) => {
    const el = getStageElement(stage.targetId);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
      setActiveStage(stage.id);
    } else {
      navigate(stage.path);
    }
  };

  // Scroll listener to track currently visible stage
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 260;
      for (let i = PIPELINE_STAGES.length - 1; i >= 0; i--) {
        const stage = PIPELINE_STAGES[i];
        const el = getStageElement(stage.targetId);
        if (el && el.offsetTop <= scrollPos) {
          setActiveStage(stage.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [getStageElement]);

  const activeStageObj = PIPELINE_STAGES.find((s) => s.id === activeStage) || PIPELINE_STAGES[0];

  return (
    <aside
      aria-label="Permanent Vertical Floating AI Diagnostic Journey"
      className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 select-none"
    >
      <div
        className={`bg-[#FFFDF8]/95 backdrop-blur-xl border border-[#DDE5DC] rounded-2xl shadow-xl shadow-[#124B3A]/10 p-2 sm:p-2.5 flex flex-col transition-all duration-200 ${
          isExpanded ? 'w-48 sm:w-52' : 'w-12 sm:w-14'
        }`}
      >
        {/* Top Header: Title, Pulse Beacon & Expand/Collapse Toggle */}
        <div className="flex items-center justify-between gap-1 pb-2 mb-1.5 border-b border-[#DDE5DC]">
          <button
            type="button"
            onClick={() => {
              const start = document.getElementById('journey-start');
              if (start) {
                const y = start.getBoundingClientRect().top + window.pageYOffset - 110;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-1.5 text-left group cursor-pointer overflow-hidden"
            title="Jump to interactive overview"
          >
            <span className="w-2 h-2 rounded-full bg-[#E9A23B] animate-pulse shrink-0" />
            {isExpanded && (
              <div className="flex flex-col truncate">
                <span className="text-[10px] font-mono font-black tracking-wider text-[#124B3A] uppercase leading-none">
                  AI JOURNEY
                </span>
                <span className="text-[9px] font-mono text-[#8A5612] font-bold mt-0.5 leading-none truncate">
                  {activeStageObj.number}/08 • {activeStageObj.shortName}
                </span>
              </div>
            )}
          </button>

          {/* Expand / Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-[#65736B] hover:text-[#124B3A] hover:bg-[#F8F6EF] transition-colors cursor-pointer shrink-0"
            title={isExpanded ? 'Collapse rail' : 'Expand labels'}
          >
            {isExpanded ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Vertical Pipeline Stages: 01 to 08 */}
        <div className="flex flex-col gap-1 relative">
          {PIPELINE_STAGES.map((stage) => {
            const isActive = activeStage === stage.id;
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setHoveredStage(stage)}
                  onMouseLeave={() => setHoveredStage(null)}
                  onClick={() => handleStageClick(stage)}
                  className={`w-full flex items-center gap-2 p-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] text-white shadow-xs font-bold scale-[1.02]'
                      : 'bg-white/80 hover:bg-[#FAF4ED] border border-[#DDE5DC]/80 hover:border-[#1F7A5A]/50 text-[#526058] hover:text-[#124B3A]'
                  }`}
                  title={`Stage ${stage.number}: ${stage.name}`}
                >
                  {/* Number Badge */}
                  <span
                    className={`font-mono text-[9px] font-bold px-1 py-0.5 rounded shrink-0 ${
                      isActive ? 'bg-[#E9A23B] text-[#124B3A]' : 'bg-[#F8F6EF] text-[#65736B]'
                    }`}
                  >
                    {stage.number}
                  </span>

                  {/* Icon */}
                  <Icon
                    size={13}
                    className={`shrink-0 ${isActive ? 'text-[#E9A23B]' : 'text-[#65736B]'}`}
                  />

                  {/* Label (Visible when expanded) */}
                  {isExpanded && (
                    <span className="truncate text-[11px] text-left leading-none flex-1">
                      {stage.shortName}
                    </span>
                  )}
                </button>

                {/* Left Hover Flyout Details Card */}
                <AnimatePresence>
                  {hoveredStage?.id === stage.id && (
                    <motion.div
                      initial={{ opacity: 0, x: 10, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 6, scale: 0.96 }}
                      transition={{ duration: 0.14 }}
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 w-64 p-3 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-2xl text-[#17221C] z-50 pointer-events-auto"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-[#DDE5DC]">
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#E8F3EE] text-[#1F7A5A]">
                          {stage.badge}
                        </span>
                        <span className="text-[10px] font-mono text-[#8A5612] font-bold">
                          {stage.metric}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-[#124B3A] mb-1 flex items-center gap-1.5">
                        <Icon size={12} className="text-[#1F7A5A]" />
                        <span>{stage.name}</span>
                      </div>
                      <p className="text-[11px] text-[#526058] leading-tight mb-2">
                        {stage.description}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#DDE5DC]">
                        <button
                          type="button"
                          onClick={() => handleStageClick(stage)}
                          className="flex-1 py-1 px-2 rounded-lg bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Scroll to Stage</span>
                          <ArrowDown size={10} />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(stage.path)}
                          className="py-1 px-2 rounded-lg border border-[#DDE5DC] hover:border-[#1F7A5A] text-[#124B3A] text-[10px] font-semibold flex items-center gap-1 hover:bg-[#F8F6EF] transition-all cursor-pointer"
                          title="Open dedicated workstation module"
                        >
                          <span>Module</span>
                          <ExternalLink size={10} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom Quick Open Active Module Button */}
        {isExpanded && (
          <div className="pt-2 mt-1.5 border-t border-[#DDE5DC]">
            <button
              type="button"
              onClick={() => navigate(activeStageObj.path)}
              className="w-full flex items-center justify-between px-2 py-1 rounded-lg bg-[#F8F6EF] hover:bg-[#FAF4ED] text-[#124B3A] border border-[#DDE5DC] text-[10px] font-bold transition-all cursor-pointer"
              title={`Open dedicated ${activeStageObj.name} module`}
            >
              <span className="truncate">Open {activeStageObj.shortName}</span>
              <ExternalLink size={11} className="text-[#1F7A5A] shrink-0" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
