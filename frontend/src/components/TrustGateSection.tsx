import React from 'react';
import { SectionHeading } from './SectionHeading';
import { 
  ShieldAlert, ShieldCheck, CheckCircle2, XCircle, 
  HelpCircle, ArrowDown, UserCheck, RefreshCw, AlertTriangle
} from 'lucide-react';

export const TrustGateSection: React.FC = () => {
  return (
    <section id="trust" className="py-20 md:py-28 bg-[#F8F6EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Modules 9 & 10: Safety & Trust Architecture"
          title="The Self-Aware Decision Gatekeeper"
          subtitle="In rural medicine, a medical AI must know when it does not know. RETINA-FUSION 360 enforces a deterministic tri-state safety gate that prevents silent algorithmic failures."
        />

        {/* 3-State Verdict Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Outcome 1: Autonomous Safe Screen */}
          <div className="rounded-3xl border-2 border-[#1F7A5A] bg-[#FFFFFF] p-6 shadow-warm-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
                <span className="text-xs font-bold font-mono uppercase text-[#1F7A5A]">
                  OUTCOME A
                </span>
                <span className="w-3 h-3 rounded-full bg-[#1F7A5A]" />
              </div>

              <h4 className="text-lg font-bold text-[#17221C] font-display mt-4">
                Autonomous Safe Screen
              </h4>
              <p className="text-xs text-[#65736B] mt-1 leading-relaxed">
                Passed automatically for routine care without loading tertiary hospitals.
              </p>

              <div className="mt-4 p-3 rounded-xl bg-[#E8F3EE] text-xs space-y-1.5 font-mono text-[#124B3A]">
                <div>• Quality Score Q &gt;= 0.72</div>
                <div>• Epistemic Uncertainty U_epi &lt;= 0.08</div>
                <div>• 100% ETDRS Rule Concordant</div>
                <div>• Zero Out-of-Distribution shift</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DDE5DC] text-xs text-[#1F7A5A] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Routine 12-Month Checkup</span>
            </div>
          </div>

          {/* Outcome 2: Human-in-the-Loop Referral */}
          <div className="rounded-3xl border-2 border-[#E9A23B] bg-[#FFFFFF] p-6 shadow-warm-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
                <span className="text-xs font-bold font-mono uppercase text-[#8A5612]">
                  OUTCOME B
                </span>
                <span className="w-3 h-3 rounded-full bg-[#E9A23B]" />
              </div>

              <h4 className="text-lg font-bold text-[#17221C] font-display mt-4">
                Human-in-the-Loop Referral
              </h4>
              <p className="text-xs text-[#65736B] mt-1 leading-relaxed">
                Escalated to district hospital ophthalmologists via e-Sanjeevani Tele-OPD.
              </p>

              <div className="mt-4 p-3 rounded-xl bg-[#FCF5E9] text-xs space-y-1.5 font-mono text-[#8A5612]">
                <div>• Grade 2, 3, or 4 detected</div>
                <div>• Macular threat exudate cluster</div>
                <div>• Borderline uncertainty (0.08 &lt; U &lt;= 0.18)</div>
                <div>• Rule discordance flagged</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DDE5DC] text-xs text-[#8A5612] font-bold flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>e-Sanjeevani Tele-Consult Dispatch</span>
            </div>
          </div>

          {/* Outcome 3: Quality Rejection (Recapture) */}
          <div className="rounded-3xl border-2 border-[#E76F51] bg-[#FFFFFF] p-6 shadow-warm-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
                <span className="text-xs font-bold font-mono uppercase text-[#9A3B24]">
                  OUTCOME C
                </span>
                <span className="w-3 h-3 rounded-full bg-[#E76F51]" />
              </div>

              <h4 className="text-lg font-bold text-[#17221C] font-display mt-4">
                Quality Rejection (Recapture)
              </h4>
              <p className="text-xs text-[#65736B] mt-1 leading-relaxed">
                Classification suppressed. Real-time guidance provided to ASHA worker.
              </p>

              <div className="mt-4 p-3 rounded-xl bg-[#FDF0EC] text-xs space-y-1.5 font-mono text-[#9A3B24]">
                <div>• Quality Score Q &lt; 0.72 (Blur/Dust)</div>
                <div>• High Epistemic Ignorance U &gt; 0.18</div>
                <div>• Out-of-Distribution (Cataract/Scar)</div>
                <div>• Extreme illumination gradient</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DDE5DC] text-xs text-[#E76F51] font-bold flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4" />
              <span>Immediate Point-of-Care Recapture</span>
            </div>
          </div>
        </div>

        {/* Deep Explainer: Epistemic vs Aleatoric Uncertainty */}
        <div className="rounded-3xl border border-[#DDE5DC] bg-[#FFFFFF] p-6 sm:p-8 shadow-warm-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5A] font-mono">
                Self-Aware Uncertainty Theory
              </span>
              <h3 className="text-2xl font-extrabold text-[#17221C] font-display">
                Epistemic (Model) vs. Aleatoric (Data) Uncertainty
              </h3>
              <p className="text-xs sm:text-sm text-[#65736B] leading-relaxed">
                Unlike consumer AI, clinical AI must decouple sensor noise from true algorithmic ambiguity. We implement Monte Carlo Dropout ensembling across edge passes to quantify both dimensions in real time.
              </p>
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC]">
                <div className="flex items-center gap-2 font-bold text-[#124B3A] font-display mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#124B3A]" />
                  <span>Epistemic Uncertainty</span>
                </div>
                <p className="text-[#65736B] leading-relaxed">
                  Represents what the model hasn't learned (rare conditions, extreme pigmentation). Solved by flagging for specialist review and active learning ingestion.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC]">
                <div className="flex items-center gap-2 font-bold text-[#E9A23B] font-display mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E9A23B]" />
                  <span>Aleatoric Uncertainty</span>
                </div>
                <p className="text-[#65736B] leading-relaxed">
                  Represents inherent physical sensor noise (motion blur, inadequate pupil dilation, lens flare). Solved by immediate physical re-capture at the village clinic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
