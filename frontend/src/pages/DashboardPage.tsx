import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CLINICAL_CASES } from '../data/screeningCases';
import { RetinalVisualization } from '../components/RetinalVisualization';
import { RiskMeter } from '../components/RiskMeter';
import { EvidenceCard } from '../components/EvidenceCard';
import { ReferralCard } from '../components/ReferralCard';
import { AIStatusBadge } from '../components/AIStatusBadge';
import { AnimatedCounter, AIProcessingBanner, MotionButton } from '../components/motion';
import {
  Users,
  Activity,
  Layers,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(CLINICAL_CASES[0].id);
  const activeCase = CLINICAL_CASES.find(c => c.id === selectedCaseId) || CLINICAL_CASES[0];

  const getSeverityBadgeColor = (grade: number) => {
    switch (grade) {
      case 0: return 'bg-[#1F7A5A]/10 text-[#1F7A5A] border-[#1F7A5A]/20';
      case 1: return 'bg-[#E9A23B]/10 text-[#8A5612] border-[#E9A23B]/30';
      case 2:
      case 3:
      case 4: return 'bg-[#E76F51]/10 text-[#E76F51] border-[#E76F51]/30';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBadgeType = (verdict: string): 'autonomous' | 'referral' | 'rejected' => {
    if (verdict === 'Autonomous Safe Screen') return 'autonomous';
    if (verdict === 'Human-in-the-Loop Referral') return 'referral';
    return 'rejected';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8 pb-16">
      {/* 1. Header Banner & Patient Selector Bar */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#DDE5DC] p-5 shadow-sm motion-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#1F7A5A] animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
                CLINICAL SCREENING WORKSTATION
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#124B3A] tracking-tight">
              Rural Primary Health Centre Triage Cockpit
            </h1>
            <p className="text-xs text-[#65736B]">
              Real-time multi-modal inference combining optical fundus imagery with anatomical vascular graphs.
            </p>
          </div>

          {/* Patient Profile Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-mono text-[#65736B] whitespace-nowrap flex items-center gap-1">
              <Users size={14} /> Case:
            </span>
            {CLINICAL_CASES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  selectedCaseId === c.id
                    ? 'bg-[#124B3A] text-[#FFFDF8] border-[#124B3A] shadow-sm scale-[1.02]'
                    : 'bg-[#F8F6EF] text-[#17221C] border-[#DDE5DC] hover:bg-[#FAF4ED]'
                }`}
                data-cursor="button"
              >
                <div className="font-bold">{c.patientCode.split('-')[2] || c.patientCode}</div>
                <div className="text-[10px] opacity-80">{c.gradeLabel}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Reusable AI Processing Pipeline Banner */}
      <AIProcessingBanner />

      {/* 3. Top KPI Telemetry Row with Animated Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'QUADRATIC KAPPA',
            counter: <AnimatedCounter to={0.942} decimals={3} />,
            sub: 'Target Validation Metric',
            color: '#124B3A',
          },
          {
            label: 'EDGE LATENCY',
            counter: <AnimatedCounter to={1.64} decimals={2} suffix="s" />,
            sub: 'Jetson Nano INT8 TensorRT',
            color: '#1F7A5A',
          },
          {
            label: 'EPISTEMIC UNCERTAINTY',
            counter: <AnimatedCounter to={Math.round(activeCase.uncertaintyScore * 100)} suffix="%" />,
            sub: activeCase.oodFlag ? 'OOD Triggered' : 'In-Distribution',
            color: '#E9A23B',
          },
          {
            label: 'SIGHT-THREAT INDEX',
            counter: <AnimatedCounter to={activeCase.riskScore} suffix="%" />,
            sub: activeCase.severityStage,
            color: '#E76F51',
          },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-[#FFFDF8] rounded-2xl border border-[#DDE5DC] p-4 shadow-xs motion-card">
            <div className="text-[10px] font-mono font-bold text-[#65736B] tracking-wider mb-1">
              {kpi.label}
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono" style={{ color: kpi.color }}>
              {kpi.counter}
            </div>
            <div className="text-[11px] text-[#65736B] mt-1 font-medium truncate">
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Core Multi-Layer Retinal Viewer & Diagnostic Dossier */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Interactive Multi-Layer Fundus Viewer */}
        <div className="lg:col-span-7 bg-[#FFFDF8] rounded-2xl border border-[#DDE5DC] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#124B3A]" />
              <h2 className="text-sm font-bold text-[#124B3A] uppercase tracking-wide">
                Interactive Multi-Layer Fundus Examination
              </h2>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getSeverityBadgeColor(activeCase.icdrGrade)}`}>
              {activeCase.gradeLabel}
            </span>
          </div>

          <RetinalVisualization clinicalCase={activeCase} />
        </div>

        {/* Right: Diagnostic Verdict & Evidence Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Diagnostic Dossier Card */}
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#DDE5DC] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDE5DC]">
              <div>
                <span className="text-[10px] font-mono text-[#65736B] uppercase">PATIENT DOSSIER</span>
                <h3 className="text-base font-bold text-[#124B3A]">{activeCase.patientCode}</h3>
              </div>
              <AIStatusBadge type={getBadgeType(activeCase.trustVerdict)} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-2.5 rounded-xl bg-[#F8F6EF]">
                <span className="text-[#65736B] block text-[10px]">AGE / GENDER</span>
                <span className="font-bold text-[#124B3A]">{activeCase.age} yrs • {activeCase.gender}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F6EF]">
                <span className="text-[#65736B] block text-[10px]">CAPTURE PROTOCOL</span>
                <span className="font-bold text-[#124B3A]">{activeCase.fundusType}</span>
              </div>
            </div>

            {/* Risk Gauge */}
            <div className="flex justify-center my-4">
              <RiskMeter score={activeCase.riskScore} />
            </div>

            {/* Clinical Explanation */}
            <div className="p-3 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] text-xs text-[#17221C] leading-relaxed">
              <span className="font-bold text-[#124B3A] block mb-1">AI-Assisted Structural Rationale:</span>
              {activeCase.notes}
            </div>
          </div>

          {/* Quick Module Jump Links */}
          <div className="bg-[#FAF4ED] rounded-2xl border border-[#E9A23B]/30 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-[#8A5612] uppercase tracking-wide">
                Deep Dive into Pipeline Stages
              </h4>
              <Sparkles size={14} className="text-[#E9A23B]" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { name: 'M3: Anatomy & Vessels', route: '/anatomy' },
                { name: 'M4: Lesion Detector', route: '/lesions' },
                { name: 'M5: Retinal Graph', route: '/retinal-graph' },
                { name: 'M7: Explainability XAI', route: '/explainability' },
                { name: 'M8: ETDRS Evidence', route: '/evidence' },
                { name: 'M11: ABDM Referral', route: '/care' },
              ].map((link, i) => (
                <button
                  key={i}
                  onClick={() => navigate(link.route)}
                  className="px-3 py-2 rounded-xl bg-[#FFFDF8] hover:bg-white text-left font-medium text-[#124B3A] border border-[#DDE5DC] hover:border-[#1F7A5A] transition-all flex items-center justify-between"
                >
                  <span className="truncate">{link.name}</span>
                  <ChevronRight size={12} className="text-[#65736B]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Structured Clinical Evidence Concordance (ETDRS) */}
      <EvidenceCard
        concordance={activeCase.etdrsConcordance}
        icdrGrade={activeCase.icdrGrade}
        gradeLabel={activeCase.gradeLabel}
        macularInvolvement={activeCase.macularInvolvement}
      />

      {/* 5. Triage Referral Ticket (ABDM e-Sanjeevani) */}
      <ReferralCard clinicalCase={activeCase} />
    </div>
  );
};
