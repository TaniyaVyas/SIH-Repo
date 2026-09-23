import React, { useState } from 'react';
import { PIPELINE_MODULES } from '../data/pipelineModules';
import { SectionHeading } from './SectionHeading';
import { 
  Camera, Sliders, Eye, Crosshair, Network, BrainCircuit, 
  Sparkles, ShieldCheck, AlertTriangle, CheckCircle2, Hospital,
  ArrowRight, Clock, Cpu, FileCode, CheckCircle, ChevronRight
} from 'lucide-react';
import { PipelineModule } from '../types';

export const PipelineSection: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<number>(1);

  const activeModule: PipelineModule = PIPELINE_MODULES.find(m => m.id === activeModuleId) || PIPELINE_MODULES[0];

  const getModuleIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Camera': return <Camera className={className} />;
      case 'SlidersAdjust': return <Sliders className={className} />;
      case 'Eye': return <Eye className={className} />;
      case 'Crosshair': return <Crosshair className={className} />;
      case 'Network': return <Network className={className} />;
      case 'BrainCircuit': return <BrainCircuit className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'AlertTriangle': return <AlertTriangle className={className} />;
      case 'CheckCircle2': return <CheckCircle2 className={className} />;
      case 'Hospital': return <Hospital className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  return (
    <section id="pipeline" className="py-20 md:py-28 bg-[#FFFDF8] border-y border-[#DDE5DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Image 1: The 11 Core AI Modules"
          title="Interactive End-to-End AI Screening Pipeline"
          subtitle="From raw optical photon capture to deterministic ABDM referral — explore how structure, evidence, and self-awareness are enforced at every clinical stage."
        />

        {/* 11-Module Interactive Timeline / Step Selector */}
        <div className="relative mb-12">
          {/* Horizontal scroll container on mobile, neat grid on desktop */}
          <div className="flex lg:grid lg:grid-cols-11 gap-2 overflow-x-auto pb-4 pt-2 no-scrollbar">
            {PIPELINE_MODULES.map((module) => {
              const isActive = activeModuleId === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModuleId(module.id)}
                  className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all duration-200 shrink-0 w-28 lg:w-auto ${
                    isActive
                      ? 'bg-[#124B3A] text-[#FFFDF8] border-[#124B3A] shadow-warm-md scale-105'
                      : 'bg-[#FFFFFF] text-[#17221C] border-[#DDE5DC] hover:border-[#1F7A5A] hover:bg-[#F8F6EF]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                      isActive ? 'bg-[#1F7A5A] text-[#FFFDF8]' : 'bg-[#F8F6EF] text-[#124B3A]'
                    }`}
                  >
                    {getModuleIcon(module.iconName, "w-4 h-4")}
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-[#E9A23B]' : 'text-[#65736B]'}`}>
                    M{module.id.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[11px] font-bold font-display line-clamp-2 leading-tight mt-0.5">
                    {module.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deep-Dive Module Inspector Card */}
        <div className="rounded-3xl border-2 border-[#DDE5DC] bg-[#FFFFFF] shadow-warm-xl overflow-hidden">
          {/* Module Header Bar */}
          <div className="p-6 md:p-8 bg-[#F8F6EF] border-b border-[#DDE5DC] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#124B3A] flex items-center justify-center text-[#FFFDF8] shadow-warm-md shrink-0">
                {getModuleIcon(activeModule.iconName, "w-7 h-7 text-[#FFFDF8]")}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#FFFDF8] border border-[#DDE5DC] text-[#124B3A]">
                    MODULE {activeModule.id} OF 11
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F3EE] text-[#1F7A5A]">
                    {activeModule.category}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-[#17221C] font-display">
                  {activeModule.name}
                </h3>
                <p className="text-sm font-medium text-[#E76F51]">
                  {activeModule.tagline}
                </p>
              </div>
            </div>

            {/* Edge Metrics Pill Box */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] text-left">
                <div className="flex items-center gap-1 text-[10px] text-[#65736B] font-mono">
                  <Clock className="w-3 h-3 text-[#1F7A5A]" />
                  <span>Latency</span>
                </div>
                <div className="text-xs font-bold text-[#124B3A] font-mono mt-0.5">
                  {activeModule.edgeLatency}
                </div>
              </div>

              <div className="px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] text-left">
                <div className="flex items-center gap-1 text-[10px] text-[#65736B] font-mono">
                  <Cpu className="w-3 h-3 text-[#E9A23B]" />
                  <span>Footprint</span>
                </div>
                <div className="text-xs font-bold text-[#17221C] font-mono mt-0.5">
                  {activeModule.modelFootprint}
                </div>
              </div>
            </div>
          </div>

          {/* Module Content Body */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Description */}
            <p className="text-base text-[#17221C] leading-relaxed">
              {activeModule.description}
            </p>

            {/* Inputs vs Outputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#124B3A] font-display mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#124B3A]" />
                  <span>Stage Inputs</span>
                </h4>
                <ul className="space-y-2 text-xs text-[#17221C]">
                  {activeModule.inputs.map((inp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-[#1F7A5A] shrink-0 mt-0.5" />
                      <span>{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F7A5A] font-display mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
                  <span>Stage Outputs</span>
                </h4>
                <ul className="space-y-2 text-xs text-[#17221C]">
                  {activeModule.outputs.map((out, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#1F7A5A] shrink-0 mt-0.5" />
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mathematical Grounding & Clinical Rationale */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 p-5 rounded-2xl bg-[#17221C] text-[#FFFDF8]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#E9A23B] uppercase tracking-wider mb-2">
                  <FileCode className="w-4 h-4" />
                  <span>Mathematical & Algorithmic Formulation</span>
                </div>
                <div className="font-mono text-xs sm:text-sm text-[#DDE5DC] p-3 rounded-xl bg-[#0A2D22]/60 border border-[#1F7A5A]/30 overflow-x-auto">
                  {activeModule.mathFormulation}
                </div>
                <div className="mt-3 text-[11px] text-[#C8D4C7] font-mono">
                  Verification Assert: {activeModule.verificationCheck}
                </div>
              </div>

              <div className="md:col-span-5 p-5 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E76F51] font-display mb-2">
                    Clinical Ophthalmology Rationale
                  </h4>
                  <p className="text-xs text-[#17221C] leading-relaxed">
                    {activeModule.clinicalRationale}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#DDE5DC] text-[11px] font-mono text-[#65736B]">
                  Target Deployment: <span className="font-bold text-[#124B3A]">{activeModule.hardwareTier}</span>
                </div>
              </div>
            </div>

            {/* Highlights Tag Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold text-[#65736B] mr-2">Key Highlights:</span>
              {activeModule.highlights.map((h, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#E8F3EE] text-[#124B3A] border border-[#C8D4C7]"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Module Navigation Footer */}
          <div className="p-4 bg-[#FFFDF8] border-t border-[#DDE5DC] flex items-center justify-between">
            <button
              disabled={activeModuleId === 1}
              onClick={() => setActiveModuleId(prev => Math.max(prev - 1, 1))}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F8F6EF] hover:bg-[#E7EEE6] disabled:opacity-40 disabled:cursor-not-allowed text-[#17221C] transition-colors"
            >
              ← Previous Module
            </button>

            <span className="text-xs text-[#65736B] font-mono">
              Module {activeModuleId} of 11
            </span>

            <button
              disabled={activeModuleId === 11}
              onClick={() => setActiveModuleId(prev => Math.min(prev + 1, 11))}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#124B3A] hover:bg-[#0E3C2E] disabled:opacity-40 disabled:cursor-not-allowed text-[#FFFDF8] transition-colors flex items-center gap-1.5"
            >
              <span>Next Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
