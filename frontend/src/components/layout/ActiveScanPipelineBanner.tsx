import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Sliders,
  Eye,
  Crosshair,
  Network,
  BrainCircuit,
  Sparkles,
  Hospital,
  Play,
  RotateCcw,
  CheckCircle2,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useRetinaData } from '../../context/RetinaContext';
import { useAuth } from '../../context/AuthContext';

interface ActiveScanPipelineBannerProps {
  currentModuleNumber?: number;
  currentModule?: string | number;
  className?: string;
}

const MODULE_ALIAS_MAP: Record<string, number> = {
  acquisition: 1,
  preprocessing: 2,
  quality: 2,
  anatomy: 3,
  lesions: 4,
  graph: 5,
  classification: 6,
  explainability: 7,
  evidence: 8,
  'self-aware': 9,
  selfaware: 9,
  trust: 10,
  care: 11,
};

export const ActiveScanPipelineBanner: React.FC<ActiveScanPipelineBannerProps> = ({
  currentModuleNumber,
  currentModule,
  className = '',
}) => {
  const activeModuleNum =
    currentModuleNumber ??
    (typeof currentModule === 'number'
      ? currentModule
      : currentModule
      ? MODULE_ALIAS_MAP[currentModule.toLowerCase()] ?? 0
      : 0);
  const navigate = useNavigate();
  const { t } = useAuth();
  const {
    activeImage,
    imageSource,
    imageMetadata,
    isProcessingPipeline,
    pipelineProgress,
    currentProcessingStage,
    currentStageName,
    runSequentialPipeline,
  } = useRetinaData();

  const localizedModulePins = [
    { num: 1, label: t.modules.names.m1, path: '/acquisition', icon: Camera },
    { num: 2, label: t.modules.names.m2, path: '/preprocessing', icon: Sliders },
    { num: 3, label: t.modules.names.m3, path: '/anatomy', icon: Eye },
    { num: 4, label: t.modules.names.m4, path: '/lesions', icon: Crosshair },
    { num: 5, label: t.modules.names.m5, path: '/retinal-graph', icon: Network },
    { num: 6, label: t.modules.names.m6, path: '/classification', icon: BrainCircuit },
    { num: 7, label: t.modules.names.m7, path: '/explainability', icon: Sparkles },
    { num: 8, label: t.modules.names.m8, path: '/evidence', icon: CheckCircle2 },
    { num: 9, label: t.modules.names.m9, path: '/self-aware', icon: Activity },
    { num: 10, label: t.modules.names.m10, path: '/trust', icon: Layers },
    { num: 11, label: t.modules.names.m11, path: '/care', icon: Hospital },
  ];

  return (
    <div
      className={`rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] p-4 shadow-sm space-y-3 transition-all ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Image Thumbnail + Metadata */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-12 h-12 rounded-xl bg-[#08170F] border-2 border-[#1F7A5A]/50 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
            {activeImage ? (
              <img
                src={activeImage}
                alt="Active Retinal Scan"
                className="w-full h-full object-cover"
              />
            ) : (
              <Eye className="w-5 h-5 text-[#1F7A5A]" />
            )}
            {isProcessingPipeline && (
              <div className="absolute inset-0 bg-[#124B3A]/60 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E9A23B] animate-ping" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#124B3A] truncate font-display">
                {t.modules.activeScanLabel}: {imageMetadata.fileName || 'Retinal Fundus'}
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FAF4ED] text-[#8A5612] border border-[#E9A23B]/40 shrink-0">
                {imageSource}
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#65736B] flex items-center gap-2 mt-0.5">
              <span>{imageMetadata.resolution}</span>
              <span>•</span>
              <span>{imageMetadata.imageSize}</span>
              <span>•</span>
              <span className="text-[#1F7A5A] font-semibold flex items-center gap-1">
                <CheckCircle2 size={11} /> {t.modules.crossModuleSync}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Pipeline Execution Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => runSequentialPipeline()}
            disabled={isProcessingPipeline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#124B3A] hover:bg-[#0E3C2E] disabled:opacity-60 text-white text-xs font-semibold shadow-xs transition-all"
            title="Re-run entire sequential analysis across all modules"
          >
            {isProcessingPipeline ? (
              <>
                <RotateCcw size={13} className="animate-spin text-[#E9A23B]" />
                <span className="font-mono text-[11px]">{t.modules.processingStage} {currentProcessingStage}/11...</span>
              </>
            ) : (
              <>
                <Play size={12} className="fill-white" />
                <span>{t.modules.reanalyzeAll}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar (during sequential processing) */}
      {isProcessingPipeline && (
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-[10px] font-mono text-[#124B3A]">
            <span className="font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E9A23B] animate-pulse" />
              {currentStageName}
            </span>
            <span>{pipelineProgress}% Analyzed</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#E8F3EE] overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#124B3A] via-[#1F7A5A] to-[#E9A23B]"
              initial={{ width: 0 }}
              animate={{ width: `${pipelineProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      )}

      {/* Step-by-Step Module Chain Ribbons */}
      <div className="pt-2 border-t border-[#DDE5DC]/70 flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
        <span className="text-[10px] font-mono text-[#65736B] uppercase shrink-0 mr-1 hidden sm:inline">
          Module Pipeline:
        </span>
        {localizedModulePins.map((mod, i) => {
          const isCurrent = activeModuleNum === mod.num;
          const isProcessed = !isProcessingPipeline || currentProcessingStage >= mod.num;

          return (
            <React.Fragment key={mod.num}>
              <button
                onClick={() => navigate(mod.path)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all shrink-0 border ${
                  isCurrent
                    ? 'bg-[#124B3A] text-white border-[#124B3A] font-bold shadow-xs'
                    : isProcessed
                    ? 'bg-[#F8F6EF] text-[#124B3A] border-[#DDE5DC] hover:bg-[#FAF4ED] hover:border-[#1F7A5A]/30'
                    : 'bg-[#F8F6EF]/50 text-[#65736B] border-transparent opacity-60'
                }`}
                title={`View ${mod.label}`}
              >
                <mod.icon size={11} className={isCurrent ? 'text-[#E9A23B]' : 'text-[#1F7A5A]'} />
                <span>{mod.label}</span>
              </button>
              {i < localizedModulePins.length - 1 && (
                <span className="text-[10px] text-[#DDE5DC] shrink-0">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
