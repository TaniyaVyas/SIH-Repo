import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Layers, ArrowRight, ShieldCheck } from 'lucide-react';

interface DemoModeBannerProps {
  stageLinks?: boolean;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({ stageLinks = true }) => {
  return (
    <div className="rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] p-4 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#E9A23B]/20 text-[#A6680C] border border-[#E9A23B]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4 text-[#E9A23B]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E9A23B] text-[#17221C]">
                DEMO MODE
              </span>
              <span className="text-xs font-bold text-[#17221C]">
                Deterministic Simulated AI Screening Engine (Reproducible Clinical Demonstration)
              </span>
            </div>
            <p className="text-[11px] text-[#65736B] mt-0.5">
              Configured for SIH Jury Evaluation: All 11 sequential AI modules execute with guaranteed reproducibility across clinical cases.
            </p>
          </div>
        </div>

        {stageLinks && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/acquisition"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DDE5DC] text-xs font-bold text-[#124B3A] hover:bg-[#DDE5DC]/40 transition-all shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-[#1F7A5A]" />
              <span>Inspect 11 AI Workstations</span>
              <ArrowRight className="w-3 h-3 text-[#124B3A]" />
            </Link>
          </div>
        )}
      </div>

      {stageLinks && (
        <div className="mt-3 pt-3 border-t border-[#DDE5DC] flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[#65736B]">
          <span className="font-semibold text-[#17221C] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1F7A5A]" />
            Direct Module Jump:
          </span>
          <Link to="/acquisition" className="hover:text-[#1F7A5A] transition-colors">01 Acquisition</Link>
          <span>•</span>
          <Link to="/preprocessing" className="hover:text-[#1F7A5A] transition-colors">02 Quality Gate</Link>
          <span>•</span>
          <Link to="/anatomy" className="hover:text-[#1F7A5A] transition-colors">04 Anatomy</Link>
          <span>•</span>
          <Link to="/lesions" className="hover:text-[#1F7A5A] transition-colors">05 Lesions</Link>
          <span>•</span>
          <Link to="/retinal-graph" className="hover:text-[#1F7A5A] transition-colors">06 GNN Graph</Link>
          <span>•</span>
          <Link to="/classification" className="hover:text-[#1F7A5A] transition-colors">07 ICDR Classify</Link>
          <span>•</span>
          <Link to="/explainability" className="hover:text-[#1F7A5A] transition-colors">08 Grad-CAM</Link>
          <span>•</span>
          <Link to="/self-aware" className="hover:text-[#1F7A5A] transition-colors">09 Meta-AI</Link>
          <span>•</span>
          <Link to="/trust" className="hover:text-[#1F7A5A] transition-colors">10 Trust Triage</Link>
          <span>•</span>
          <Link to="/care" className="hover:text-[#1F7A5A] transition-colors">11 Care Pathway</Link>
        </div>
      )}
    </div>
  );
};
