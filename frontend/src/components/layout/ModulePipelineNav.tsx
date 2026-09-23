import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Compass } from 'lucide-react';
import { MotionButton } from '../motion/MotionButton';
import { useAuth } from '../../context/AuthContext';

export interface ModuleStep {
  moduleNumber: number;
  title: string;
  shortTitle: string;
  path: string;
}

export const PIPELINE_MODULES: ModuleStep[] = [
  { moduleNumber: 1, title: 'Image Acquisition', shortTitle: 'M1: Acquisition', path: '/acquisition' },
  { moduleNumber: 2, title: 'Preprocessing & Quality', shortTitle: 'M2: Quality', path: '/preprocessing' },
  { moduleNumber: 3, title: 'Retinal Anatomy & Vessels', shortTitle: 'M3: Anatomy', path: '/anatomy' },
  { moduleNumber: 4, title: 'Lesion Detection', shortTitle: 'M4: Lesions', path: '/lesions' },
  { moduleNumber: 5, title: 'Retinal Graph Construction', shortTitle: 'M5: Graph', path: '/retinal-graph' },
  { moduleNumber: 6, title: 'DR Classification', shortTitle: 'M6: Predict', path: '/classification' },
  { moduleNumber: 7, title: 'Explainability (XAI)', shortTitle: 'M7: Explain', path: '/explainability' },
  { moduleNumber: 8, title: 'Evidence Verification', shortTitle: 'M8: Evidence', path: '/evidence' },
  { moduleNumber: 9, title: 'Self-Aware AI', shortTitle: 'M9: Self-Aware', path: '/self-aware' },
  { moduleNumber: 10, title: 'Trust-Aware Decision', shortTitle: 'M10: Trust', path: '/trust' },
  { moduleNumber: 11, title: 'Referral & Care Pathway', shortTitle: 'M11: Care', path: '/care' },
];

interface ModulePipelineNavProps {
  currentModule: number; // 1 to 11
  className?: string;
}

export const ModulePipelineNav: React.FC<ModulePipelineNavProps> = ({
  currentModule,
  className = '',
}) => {
  const navigate = useNavigate();
  const { t } = useAuth();

  const localizedModules: ModuleStep[] = [
    { moduleNumber: 1, title: t.modules.m1Title, shortTitle: t.modules.names.m1, path: '/acquisition' },
    { moduleNumber: 2, title: t.modules.m2Title, shortTitle: t.modules.names.m2, path: '/preprocessing' },
    { moduleNumber: 3, title: t.modules.m3Title, shortTitle: t.modules.names.m3, path: '/anatomy' },
    { moduleNumber: 4, title: t.modules.m4Title, shortTitle: t.modules.names.m4, path: '/lesions' },
    { moduleNumber: 5, title: t.modules.m5Title, shortTitle: t.modules.names.m5, path: '/retinal-graph' },
    { moduleNumber: 6, title: t.modules.m6Title, shortTitle: t.modules.names.m6, path: '/classification' },
    { moduleNumber: 7, title: t.modules.m7Title, shortTitle: t.modules.names.m7, path: '/explainability' },
    { moduleNumber: 8, title: t.modules.m8Title, shortTitle: t.modules.names.m8, path: '/evidence' },
    { moduleNumber: 9, title: t.modules.m9Title, shortTitle: t.modules.names.m9, path: '/self-aware' },
    { moduleNumber: 10, title: t.modules.m10Title, shortTitle: t.modules.names.m10, path: '/trust' },
    { moduleNumber: 11, title: t.modules.m11Title, shortTitle: t.modules.names.m11, path: '/care' },
  ];

  const prevStep = currentModule > 1 ? localizedModules[currentModule - 2] : null;
  const nextStep = currentModule < 11 ? localizedModules[currentModule] : null;

  return (
    <div
      className={`rounded-3xl border border-[#DDE5DC] bg-[#FFFDF8] p-5 shadow-sm space-y-4 select-none ${className}`}
    >
      {/* ─── 1. TOP PIPELINE TRACK RIBBON (11 MODULES) ─── */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DDE5DC]/70 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 font-bold text-[#124B3A] uppercase tracking-wider">
            <Compass size={13} className="text-[#1F7A5A]" />
            {t.modules.pipelineTrackTitle}
          </span>
          <span className="text-[#65736B]">
            {t.modules.stageOfTotal} <strong>0{currentModule}</strong> {t.modules.ofTotal}
          </span>
        </div>

        {/* Horizontal Scrollable Breadcrumb Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
          {localizedModules.map((mod) => {
            const isCurrent = mod.moduleNumber === currentModule;
            const isCompleted = mod.moduleNumber < currentModule;

            return (
              <button
                key={mod.path}
                onClick={() => navigate(mod.path)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-semibold whitespace-nowrap transition-all duration-200 border shrink-0 ${
                  isCurrent
                    ? 'bg-[#124B3A] text-white border-[#124B3A] shadow-xs scale-[1.02]'
                    : isCompleted
                    ? 'bg-[#E8F3EE] text-[#1F7A5A] border-[#1F7A5A]/30 hover:bg-[#d8ebe2]'
                    : 'bg-[#F8F6EF] text-[#65736B] border-[#DDE5DC] hover:bg-[#FAF4ED] hover:text-[#17221C]'
                }`}
                data-cursor="button"
                title={`Jump to ${mod.title}`}
              >
                {isCompleted ? (
                  <Check size={11} className="text-[#1F7A5A] stroke-[2.5]" />
                ) : (
                  <span className="opacity-70">0{mod.moduleNumber}.</span>
                )}
                <span>{mod.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 2. PREVIOUS / NEXT STEP ACTION CONTROLS ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Left Action: Previous Module or Return to Dashboard */}
        {prevStep ? (
          <button
            onClick={() => navigate(prevStep.path)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8F6EF] hover:bg-[#FAF4ED] text-[#124B3A] text-xs font-bold border border-[#DDE5DC] hover:border-[#1F7A5A]/40 transition-all group"
            data-cursor="button"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
            <span>{t.modules.previousModule}: {prevStep.title}</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8F6EF] hover:bg-[#FAF4ED] text-[#124B3A] text-xs font-bold border border-[#DDE5DC] hover:border-[#1F7A5A]/40 transition-all group"
            data-cursor="button"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
            <span>{t.modules.backToDashboard}</span>
          </button>
        )}

        {/* Right Action: Next Module or Complete Screening */}
        {nextStep ? (
          <MotionButton
            onClick={() => navigate(nextStep.path)}
            variant="primary"
            showArrow
            className="shadow-md shadow-[#124B3A]/20"
          >
            {t.modules.continueTo} {nextStep.title}
          </MotionButton>
        ) : (
          <MotionButton
            onClick={() => navigate('/dashboard')}
            variant="primary"
            showArrow
            className="shadow-md shadow-[#124B3A]/20"
          >
            {t.modules.completeScreening}
          </MotionButton>
        )}
      </div>
    </div>
  );
};
