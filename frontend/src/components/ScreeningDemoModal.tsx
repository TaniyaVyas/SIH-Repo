import React, { useState } from 'react';
import { CLINICAL_CASES } from '../data/screeningCases';
import { RetinalVisualization } from './RetinalVisualization';
import { RiskMeter } from './RiskMeter';
import { EvidenceCard } from './EvidenceCard';
import { ReferralCard } from './ReferralCard';
import { AIStatusBadge } from './AIStatusBadge';
import { 
  X, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, 
  Activity, Layers, FileText, UserCheck, AlertCircle, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TeleOpdDocketModal } from './TeleOpdDocketModal';

interface ScreeningDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScreeningDemoModal: React.FC<ScreeningDemoModalProps> = ({ isOpen, onClose }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-severe');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<string>('Ready');

  if (!isOpen) return null;

  const currentCase = CLINICAL_CASES.find(c => c.id === selectedCaseId) || CLINICAL_CASES[0];

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setIsSimulating(true);
    setSimStep("M01: Normalizing Optical Tensor...");

    setTimeout(() => setSimStep("M03: Segmenting Arteriolar-Venular Tree..."), 200);
    setTimeout(() => setSimStep("M04: Localizing Micro-Vascular Lesions..."), 400);
    setTimeout(() => setSimStep("M05: Constructing Retinal Spatial Graph G=(V,E)..."), 600);
    setTimeout(() => setSimStep("M08: Cross-Verifying ETDRS Clinical Evidence..."), 800);
    setTimeout(() => {
      setSimStep("Complete: Trust Decision Formulated");
      setIsSimulating(false);
      if (caseId === 'case-normal') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#1F7A5A', '#E9A23B', '#124B3A']
        });
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#17221C]/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-6xl my-auto rounded-3xl bg-[#FFFDF8] border-2 border-[#DDE5DC] shadow-warm-xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#F8F6EF] border-b border-[#DDE5DC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#124B3A] flex items-center justify-center text-[#FFFDF8] shadow-warm-sm">
              <Activity className="w-5 h-5 text-[#FFFDF8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#17221C] font-display">
                  RETINA-FUSION 360 Screening Cockpit
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E8F3EE] text-[#124B3A] border border-[#C8D4C7]">
                  CLINICAL DEMO
                </span>
              </div>
              <p className="text-xs text-[#65736B]">
                Interactive multi-modal screening simulation with structure, evidence, and self-aware gating
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#FFFDF8] hover:bg-[#E7EEE6] text-[#17221C] transition-colors border border-[#DDE5DC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Case Preset Selector Bar */}
        <div className="p-4 bg-[#FFFDF8] border-b border-[#DDE5DC] shrink-0">
          <div className="text-xs font-bold font-mono uppercase tracking-wider text-[#65736B] mb-2">
            Select Clinical Preset to Evaluate:
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {CLINICAL_CASES.map(c => {
              const isSelected = selectedCaseId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectCase(c.id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#124B3A] text-[#FFFDF8] border-[#124B3A] shadow-warm-md'
                      : 'bg-[#F8F6EF] text-[#17221C] border-[#DDE5DC] hover:border-[#1F7A5A] hover:bg-[#FFFDF8]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className={isSelected ? 'text-[#E9A23B]' : 'text-[#65736B]'}>
                      {c.patientCode}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                      c.severityStage === 'No DR' ? 'bg-[#1F7A5A] text-[#FFFDF8]' :
                      c.severityStage === 'Mild NPDR' ? 'bg-[#E9A23B] text-[#17221C]' :
                      c.severityStage === 'Severe NPDR' ? 'bg-[#E76F51] text-[#FFFDF8]' :
                      'bg-[#17221C] text-[#FFFDF8]'
                    }`}>
                      {c.severityStage}
                    </span>
                  </div>
                  <div className="font-bold text-xs font-display mt-1 truncate">
                    {c.gradeLabel.split('—')[1] || c.gradeLabel}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Simulation status bar */}
          {isSimulating && (
            <div className="mt-3 p-2 rounded-xl bg-[#E8F3EE] border border-[#C8D4C7] flex items-center justify-between text-xs text-[#124B3A] font-mono">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1F7A5A]" />
                <span>{simStep}</span>
              </div>
              <span className="text-[10px] text-[#1F7A5A] font-bold">11-MODULE PIPELINE EXECUTING</span>
            </div>
          )}
        </div>

        {/* Main Screening Body (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Patient Overview Strip */}
          <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1F7A5A] text-[#FFFDF8] flex items-center justify-center font-bold">
                {currentCase.patientCode.split('-')[1]}
              </div>
              <div>
                <div className="font-bold text-[#17221C] text-sm font-display">
                  {currentCase.patientCode} • {currentCase.age}Y / {currentCase.gender}
                </div>
                <div className="text-[#65736B]">{currentCase.location}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AIStatusBadge
                type={
                  currentCase.trustVerdict === 'Autonomous Safe Screen' ? 'autonomous' :
                  currentCase.trustVerdict === 'Human-in-the-Loop Referral' ? 'referral' : 'rejected'
                }
                label={currentCase.trustVerdict}
                size="md"
              />
            </div>
          </div>

          {/* Main Visualizer & Diagnostic Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Fundus Viewport */}
            <div className="lg:col-span-7">
              <RetinalVisualization clinicalCase={currentCase} />
            </div>

            {/* Right Column: AI Triage Dossier & Risk Gauge */}
            <div className="lg:col-span-5 space-y-6">
              {/* Risk Meter Card */}
              <div className="rounded-2xl border border-[#DDE5DC] bg-[#FFFFFF] p-6 shadow-warm-sm flex flex-col items-center">
                <RiskMeter
                  score={currentCase.riskScore}
                  size={160}
                  label="Sight-Threat Index"
                  sublabel="Clinical Risk Calibration"
                />

                {/* Statistical Telemetry Grid */}
                <div className="grid grid-cols-2 gap-3 w-full mt-4 pt-4 border-t border-[#DDE5DC] text-center text-xs">
                  <div className="p-2 rounded-xl bg-[#F8F6EF]">
                    <div className="text-[#65736B] text-[11px] font-mono">Model Confidence</div>
                    <div className="text-base font-bold text-[#124B3A] font-mono mt-0.5">
                      {currentCase.confidence}%
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F8F6EF]">
                    <div className="text-[#65736B] text-[11px] font-mono">Epistemic Uncertainty</div>
                    <div className={`text-base font-bold font-mono mt-0.5 ${
                      currentCase.uncertaintyScore > 0.08 ? 'text-[#E76F51]' : 'text-[#1F7A5A]'
                    }`}>
                      {currentCase.uncertaintyScore.toFixed(3)}
                    </div>
                  </div>
                </div>

                {/* Safety Reassurance Notice */}
                <div className="mt-3 text-[11px] text-[#65736B] text-center font-mono">
                  {currentCase.uncertaintyScore <= 0.08 ? (
                    <span className="text-[#1F7A5A] flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Uncertainty below 0.08 threshold: Safe for screening
                    </span>
                  ) : (
                    <span className="text-[#E76F51] flex items-center justify-center gap-1 font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      High Uncertainty: Autonomous decision suppressed
                    </span>
                  )}
                </div>
              </div>

              {/* Lesion Breakdown Count */}
              <div className="rounded-2xl border border-[#DDE5DC] bg-[#FFFFFF] p-5 shadow-warm-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#17221C] font-display mb-3">
                  Detected Pathological Hallmarks
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] flex justify-between">
                    <span className="text-[#65736B]">Microaneurysms:</span>
                    <span className="font-bold text-[#17221C] font-mono">
                      {currentCase.lesionsSummary.microaneurysms}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] flex justify-between">
                    <span className="text-[#65736B]">Hemorrhages:</span>
                    <span className="font-bold text-[#17221C] font-mono">
                      {currentCase.lesionsSummary.hemorrhages}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] flex justify-between">
                    <span className="text-[#65736B]">Hard Exudates:</span>
                    <span className="font-bold text-[#17221C] font-mono">
                      {currentCase.lesionsSummary.hardExudates}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] flex justify-between">
                    <span className="text-[#65736B]">Cotton Wool Spots:</span>
                    <span className="font-bold text-[#17221C] font-mono">
                      {currentCase.lesionsSummary.cottonWoolSpots}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Verification Details */}
          <EvidenceCard
            concordance={currentCase.etdrsConcordance}
            icdrGrade={currentCase.icdrGrade}
            gradeLabel={currentCase.gradeLabel}
            macularInvolvement={currentCase.macularInvolvement}
          />

          {/* Referral & Care Pathway Slip */}
          <ReferralCard clinicalCase={currentCase} />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#F8F6EF] border-t border-[#DDE5DC] flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-[#65736B] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
            <span>AI Decision Support System (Clinical CDSS • HealthTech)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#124B3A] hover:bg-[#0E3C2E] text-[#FFFDF8] transition-colors shadow-warm-sm"
            >
              Close Cockpit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
