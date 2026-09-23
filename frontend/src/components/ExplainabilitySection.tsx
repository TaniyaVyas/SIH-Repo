import React, { useState } from 'react';
import { SectionHeading } from './SectionHeading';
import { GraphVisualization } from './GraphVisualization';
import { 
  AlertOctagon, ShieldCheck, CheckCircle2, XCircle, 
  Sparkles, ArrowRight, Eye, Layers, Compass
} from 'lucide-react';

export const ExplainabilitySection: React.FC = () => {
  const [selectedComparisonTab, setSelectedComparisonTab] = useState<'side-by-side' | 'gnn-graph'>('side-by-side');

  return (
    <section id="explainability" className="py-20 md:py-28 bg-[#FFFDF8] border-b border-[#DDE5DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Explainable AI (XAI) & Evidence Verification"
          title="Solving the Medical 'Black-Box' Dilemma"
          subtitle="Why ophthalmologists reject standard deep learning models, and how RETINA-FUSION 360 replaces opaque probability scores with auditable anatomical evidence and clinical rule concordance."
        />

        {/* Tab Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] shadow-warm-sm">
            <button
              onClick={() => setSelectedComparisonTab('side-by-side')}
              className={`px-5 py-2 rounded-xl text-xs font-bold font-display transition-all ${
                selectedComparisonTab === 'side-by-side'
                  ? 'bg-[#124B3A] text-[#FFFDF8] shadow-warm-md'
                  : 'text-[#65736B] hover:text-[#17221C]'
              }`}
            >
              The Black-Box vs. Retina-Fusion Comparison
            </button>
            <button
              onClick={() => setSelectedComparisonTab('gnn-graph')}
              className={`px-5 py-2 rounded-xl text-xs font-bold font-display transition-all ${
                selectedComparisonTab === 'gnn-graph'
                  ? 'bg-[#124B3A] text-[#FFFDF8] shadow-warm-md'
                  : 'text-[#65736B] hover:text-[#17221C]'
              }`}
            >
              Interactive Retinal Topological Graph (GNN)
            </button>
          </div>
        </div>

        {selectedComparisonTab === 'side-by-side' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Card: The Flawed Standard AI (Black Box) */}
            <div className="rounded-3xl border-2 border-[#F48C71] bg-[#FFFFFF] p-6 sm:p-8 shadow-warm-md relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-[#F48C71]/30">
                <div className="flex items-center gap-2 text-[#9A3B24]">
                  <AlertOctagon className="w-5 h-5 text-[#E76F51]" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">
                    Legacy Paradigm (Standard ResNet / ViT)
                  </span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#FDF0EC] text-[#E76F51]">
                  High Clinical Risk
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-[#17221C] font-display">
                  The Opaque Pixel Black-Box
                </h3>
                <p className="text-xs text-[#65736B] mt-1 leading-relaxed">
                  Direct image-to-label mapping without anatomic awareness, spatial distance understanding, or medical rule validation.
                </p>

                {/* Simulated Black Box Output Box */}
                <div className="mt-4 p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] text-center font-mono">
                  <div className="text-[11px] text-[#65736B]">Standard Softmax Output:</div>
                  <div className="text-2xl font-bold text-[#E76F51] my-1">
                    Grade 3 (Severe NPDR) — 91.4%
                  </div>
                  <div className="text-[10px] text-[#65736B]">
                    No localization • No evidence chain • No medical rationale
                  </div>
                </div>

                {/* Failure Modes List */}
                <div className="mt-6 space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FDF0EC] border border-[#F48C71]/40">
                    <XCircle className="w-4 h-4 text-[#E76F51] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#9A3B24]">Shortcut Learning Vulnerability</div>
                      <div className="text-[11px] text-[#65736B] mt-0.5">
                        Tricked by camera dust spots, corneal glare, or eyelashes into falsely flagging diabetic hemorrhages.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FDF0EC] border border-[#F48C71]/40">
                    <XCircle className="w-4 h-4 text-[#E76F51] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#9A3B24]">Anatomical Blindness</div>
                      <div className="text-[11px] text-[#65736B] mt-0.5">
                        Cannot differentiate an exudate 200μm from the fovea (causing blindness) from one 5000μm in the periphery.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FDF0EC] border border-[#F48C71]/40">
                    <XCircle className="w-4 h-4 text-[#E76F51] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#9A3B24]">Unverifiable in Legal / Clinical Audits</div>
                      <div className="text-[11px] text-[#65736B] mt-0.5">
                        When challenged by an ophthalmologist, the system cannot explain why or where the diagnosis originated.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: The RETINA-FUSION 360 Paradigm */}
            <div className="rounded-3xl border-2 border-[#124B3A] bg-[#FFFFFF] p-6 sm:p-8 shadow-warm-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-[#DDE5DC]">
                <div className="flex items-center gap-2 text-[#124B3A]">
                  <ShieldCheck className="w-5 h-5 text-[#1F7A5A]" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">
                    RETINA-FUSION 360 Architecture
                  </span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#E8F3EE] text-[#124B3A] border border-[#C8D4C7]">
                  Clinically Auditable
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-[#17221C] font-display">
                  Structure-Aware + Evidence-Verified
                </h3>
                <p className="text-xs text-[#65736B] mt-1 leading-relaxed">
                  Transforms fundus imagery into a topological retinal graph G=(V,E) where physical anatomy and ETDRS medical rules govern predictions.
                </p>

                {/* Structured Transparent Output Box */}
                <div className="mt-4 p-4 rounded-2xl bg-[#E8F3EE] border border-[#C8D4C7] text-center font-mono">
                  <div className="text-[11px] text-[#124B3A]">Multimodal GNN & Clinical Audit:</div>
                  <div className="text-2xl font-bold text-[#124B3A] my-1">
                    Grade 3 • ETDRS 4-2-1 Verified
                  </div>
                  <div className="text-[10px] text-[#1F7A5A]">
                    Hems &gt; 20 in 4 quadrants • Exudates 420μm to fovea • U_epi = 0.022
                  </div>
                </div>

                {/* Advantages List */}
                <div className="mt-6 space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC]">
                    <CheckCircle2 className="w-4 h-4 text-[#1F7A5A] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#124B3A]">Topological Lesion-Vessel Graph</div>
                      <div className="text-[11px] text-[#65736B] mt-0.5">
                        Relational graph encodes vascular branch connectivity and true Euclidean distance to the foveal center.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC]">
                    <CheckCircle2 className="w-4 h-4 text-[#1F7A5A] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#124B3A]">Deterministic ETDRS Rule Guardrails</div>
                      <div className="text-[11px] text-[#65736B] mt-0.5">
                        Clinical evidence engine cross-references international guidelines; prevents hallucinations and suppresses impossible predictions.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC]">
                    <CheckCircle2 className="w-4 h-4 text-[#1F7A5A] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#124B3A]">Complete Clinician Corroboration</div>
                      <div className="text-[11px] text-[#65736B] mt-0.5">
                        Tele-ophthalmologist receives highlighted lesion coordinates and attention maps for immediate 10-second sign-off.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <GraphVisualization />
          </div>
        )}
      </div>
    </section>
  );
};
