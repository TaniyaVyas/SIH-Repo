import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRetina } from '../../context/RetinaContext';
import {
  CheckCircle2,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Activity,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const STAGES = [
  { id: 1, path: '/modules/image-acquisition', code: '01', name: 'Capture', label: 'Image Acquisition' },
  { id: 2, path: '/modules/quality-assessment', code: '02', name: 'Quality', label: 'Quality Assessment' },
  { id: 3, path: '/modules/dual-enhancement', code: '03', name: 'Enhance', label: 'Dual Enhancement' },
  { id: 4, path: '/modules/anatomical-segmentation', code: '04', name: 'Anatomy', label: 'Anatomy Segmentation' },
  { id: 5, path: '/modules/lesion-detection', code: '05', name: 'Lesions', label: 'Lesion Detection' },
  { id: 6, path: '/modules/relational-reasoning', code: '06', name: 'Relational', label: 'Graph Reasoning' },
  { id: 7, path: '/modules/classification', code: '07', name: 'ICDR', label: 'DR Classification' },
  { id: 8, path: '/modules/explainable-ai', code: '08', name: 'XAI', label: 'Explainable AI' },
  { id: 9, path: '/modules/self-aware-ai', code: '09', name: 'Meta-AI', label: 'Uncertainty Calibration' },
  { id: 10, path: '/modules/smart-triage', code: '10', name: 'Triage', label: 'Smart Triage' },
  { id: 11, path: '/modules/care-coordination', code: '11', name: 'Care', label: 'Care Coordination' },
];

export const PersistentScreeningStatus: React.FC<{
  className?: string;
  condensed?: boolean;
}> = ({ className = '', condensed = false }) => {
  const {
    pipelineProgress,
    currentProcessingStage,
    currentStageName,
    isProcessingPipeline,
    runSequentialPipeline,
    resetPipeline,
    pipelineResults,
  } = useRetina();

  const [isExpanded, setIsExpanded] = useState(!condensed);

  const isCompleted = pipelineProgress === 100;
  const hasStarted = pipelineProgress > 0;

  return (
    <div
      className={`bg-white/95 backdrop-blur-md border border-[#DDE5DC] rounded-2xl shadow-lg transition-all ${className}`}
    >
      {/* Header / Summary Bar */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#DDE5DC]/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1F7A5A]/10 border border-[#1F7A5A]/25 flex items-center justify-center text-[#1F7A5A]">
            <Activity className={`w-5 h-5 ${isProcessingPipeline ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#124B3A]">
                11-Stage Screening Pipeline
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  isCompleted
                    ? 'bg-[#1F7A5A]/15 text-[#1F7A5A] border border-[#1F7A5A]/30'
                    : isProcessingPipeline
                    ? 'bg-[#E9A23B]/20 text-[#A6680C] border border-[#E9A23B]/40 animate-pulse'
                    : 'bg-[#F8F6EF] text-[#65736B] border border-[#DDE5DC]'
                }`}
              >
                {isCompleted
                  ? 'Complete & Verified'
                  : isProcessingPipeline
                  ? `Stage ${currentProcessingStage}/11 Running`
                  : hasStarted
                  ? 'Stage Halted'
                  : 'Ready'}
              </span>
            </div>
            <p className="text-xs text-[#65736B] mt-0.5 truncate max-w-[280px] sm:max-w-md">
              {isProcessingPipeline
                ? `Active: ${currentStageName}`
                : isCompleted
                ? `ICDR: Grade ${pipelineResults.classification.icdrGrade} (${pipelineResults.classification.severityStage}) • Referral: ${
                    pipelineResults.care.referralRequired ? 'Required' : 'Routine'
                  }`
                : 'Upload or select a retinal fundus image to initiate screening'}
            </p>
          </div>
        </div>

        {/* Action Buttons & Progress Gauge */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Progress Bar & Number */}
          <div className="hidden sm:flex flex-col items-end gap-1 mr-2">
            <span className="text-xs font-bold text-[#17221C]">
              {pipelineProgress}% Done
            </span>
            <div className="w-24 h-2 bg-[#F8F6EF] rounded-full overflow-hidden border border-[#DDE5DC]">
              <div
                className="h-full bg-gradient-to-r from-[#1F7A5A] to-[#E9A23B] transition-all duration-300 rounded-full"
                style={{ width: `${pipelineProgress}%` }}
              />
            </div>
          </div>

          {!isProcessingPipeline && !isCompleted && (
            <button
              onClick={() => runSequentialPipeline()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F7A5A] text-white text-xs font-semibold hover:bg-[#124B3A] transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Pipeline</span>
            </button>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2">
              <Link
                to="/modules/care-coordination"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F7A5A] text-white text-xs font-semibold hover:bg-[#124B3A] transition-all shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>View Care Plan</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <button
                onClick={() => resetPipeline()}
                title="Reset Pipeline"
                className="p-1.5 rounded-xl border border-[#DDE5DC] text-[#65736B] hover:text-[#17221C] hover:bg-[#F8F6EF] transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Toggle Accordion */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl border border-[#DDE5DC] text-[#65736B] hover:text-[#17221C] hover:bg-[#F8F6EF] transition-all"
            aria-label="Toggle pipeline details"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 11 Horizontal Steps Grid */}
      {isExpanded && (
        <div className="p-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[760px] gap-2">
            {STAGES.map((stg, idx) => {
              const isPast =
                currentProcessingStage > stg.id || (isCompleted && pipelineProgress === 100);
              const isCurrent =
                isProcessingPipeline && currentProcessingStage === stg.id;
              const isPending = !isPast && !isCurrent;

              return (
                <div key={stg.id} className="flex-1 flex items-center">
                  <Link
                    to={stg.path}
                    className={`group w-full flex flex-col items-center p-2 rounded-xl border transition-all text-center ${
                      isCurrent
                        ? 'bg-[#E9A23B]/10 border-[#E9A23B] ring-2 ring-[#E9A23B]/30'
                        : isPast
                        ? 'bg-[#1F7A5A]/5 border-[#1F7A5A]/30 hover:border-[#1F7A5A]'
                        : 'bg-[#F8F6EF]/60 border-[#DDE5DC] hover:border-[#65736B]/40'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {isPast ? (
                        <CheckCircle2 className="w-4 h-4 text-[#1F7A5A]" />
                      ) : isCurrent ? (
                        <span className="w-4 h-4 rounded-full border-2 border-[#E9A23B] border-t-transparent animate-spin inline-block" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-[#DDE5DC] bg-white flex items-center justify-center text-[9px] font-bold text-[#65736B]">
                          {stg.id}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[11px] font-bold truncate max-w-[70px] ${
                        isCurrent
                          ? 'text-[#A6680C]'
                          : isPast
                          ? 'text-[#124B3A]'
                          : 'text-[#65736B]'
                      }`}
                    >
                      {stg.name}
                    </span>
                    <span className="text-[9px] text-[#65736B]/80 uppercase">
                      {stg.code}
                    </span>
                  </Link>

                  {/* Inter-node connector line */}
                  {idx < STAGES.length - 1 && (
                    <div
                      className={`h-0.5 w-2 flex-shrink-0 transition-colors ${
                        isPast ? 'bg-[#1F7A5A]' : 'bg-[#DDE5DC]'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
