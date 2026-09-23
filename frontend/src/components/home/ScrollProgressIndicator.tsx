import React from 'react';
import { motion } from 'framer-motion';

export interface JourneyStage {
  id: string;
  step: string;
  name: string;
  sublabel: string;
  route: string;
}

export const JOURNEY_STAGES: JourneyStage[] = [
  { id: 'stage-image', step: '01', name: 'IMAGE', sublabel: 'Photon Capture', route: '/acquisition' },
  { id: 'stage-anatomy', step: '02', name: 'ANATOMY', sublabel: 'Vessel Arcades', route: '/anatomy' },
  { id: 'stage-lesions', step: '03', name: 'LESIONS', sublabel: 'Microaneurysms', route: '/lesions' },
  { id: 'stage-graph', step: '04', name: 'GRAPH', sublabel: 'Topological GNN', route: '/retinal-graph' },
  { id: 'stage-ai', step: '05', name: 'AI', sublabel: '5-Tier Staging', route: '/classification' },
  { id: 'stage-evidence', step: '06', name: 'EVIDENCE', sublabel: 'ETDRS 4-2-1 Rule', route: '/evidence' },
  { id: 'stage-trust', step: '07', name: 'TRUST', sublabel: 'Safety Gate', route: '/trust' },
  { id: 'stage-care', step: '08', name: 'CARE', sublabel: 'ABDM Referral', route: '/care' },
];

interface ScrollProgressIndicatorProps {
  currentStageIndex: number;
  onSelectStage: (index: number) => void;
}

export const ScrollProgressIndicator: React.FC<ScrollProgressIndicatorProps> = ({
  currentStageIndex,
  onSelectStage,
}) => {
  return (
    <div className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end pointer-events-auto">
      <div className="bg-[#FFFDF8]/90 backdrop-blur-md rounded-2xl border border-[#DDE5DC] p-3 shadow-lg shadow-[#124B3A]/5 space-y-2.5">
        <div className="px-2 text-[9px] font-mono font-bold text-[#65736B] tracking-widest uppercase pb-1 border-b border-[#DDE5DC]">
          AI JOURNEY
        </div>

        <div className="space-y-1.5">
          {JOURNEY_STAGES.map((stage, idx) => {
            const isActive = currentStageIndex === idx;
            const isPast = currentStageIndex > idx;

            return (
              <button
                key={stage.id}
                onClick={() => onSelectStage(idx)}
                className={`group flex items-center justify-end gap-3 px-2 py-1 rounded-xl text-left transition-all duration-200 w-full ${
                  isActive
                    ? 'bg-[#FAF4ED] text-[#124B3A]'
                    : 'text-[#65736B] hover:text-[#17221C] hover:bg-[#F8F6EF]'
                }`}
                data-cursor="button"
              >
                {/* Stage Name & Step */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold">{stage.step}</span>
                    <span className={`text-[11px] font-sans font-bold tracking-tight ${isActive ? 'text-[#124B3A]' : ''}`}>
                      {stage.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-[#65736B]/70 group-hover:text-[#65736B]">
                    {stage.sublabel}
                  </span>
                </div>

                {/* Vertical Active Pill Indicator */}
                <div className="relative w-2 h-7 rounded-full bg-[#DDE5DC]/60 flex items-center justify-center flex-shrink-0">
                  {isActive && (
                    <motion.div
                      layoutId="journeyActiveIndicator"
                      className="absolute inset-0 rounded-full bg-gradient-to-b from-[#E76F51] to-[#E9A23B] shadow-xs"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                  {isPast && !isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1F7A5A]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
