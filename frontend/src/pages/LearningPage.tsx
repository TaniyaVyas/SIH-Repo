import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRetinaData, createDefaultFundusDataUrl } from '../context/RetinaContext';
import { usePatientWorkflow } from '../context/PatientWorkflowContext';
import {
  Repeat,
  Eye,
  ShieldCheck,
  Activity,
  Users,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  Sliders,
  Database,
  Lock,
  ChevronRight,
  FileCheck,
  Check,
  X,
  Clock,
  Layers,
  ThumbsUp,
  ThumbsDown,
  Info,
} from 'lucide-react';

interface AuditCase {
  id: string;
  patientName: string;
  age: number;
  aiGrade: string;
  aiConfidence: number;
  doctorGrade: string;
  agreementStatus: 'Agreed' | 'Adjusted' | 'Under Review';
  retinalImage: string;
  notes: string;
  flaggedDate: string;
}

export const LearningPage: React.FC = () => {
  const { user } = useAuth();
  const { activeImage } = useRetinaData();
  const { patients } = usePatientWorkflow();

  // Audit Cases Pool
  const [auditCases, setAuditCases] = useState<AuditCase[]>([
    {
      id: 'AUD-0812',
      patientName: 'Ramesh Patel',
      age: 54,
      aiGrade: 'Moderate NPDR (Grade 2)',
      aiConfidence: 96.8,
      doctorGrade: 'Moderate NPDR (Grade 2)',
      agreementStatus: 'Agreed',
      retinalImage: activeImage || createDefaultFundusDataUrl('npdr'),
      notes: 'Perifoveal circinate hard exudates without central macular involvement.',
      flaggedDate: 'Today (Active)',
    },
    {
      id: 'AUD-0813',
      patientName: 'Geeta Bai Shinde',
      age: 58,
      aiGrade: 'Severe NPDR (Grade 3)',
      aiConfidence: 91.2,
      doctorGrade: 'Moderate NPDR (Grade 2)',
      agreementStatus: 'Adjusted',
      retinalImage: createDefaultFundusDataUrl('severe'),
      notes: 'Cotton wool spot near superior arcade was borderline; adjusted to Grade 2 moderate.',
      flaggedDate: 'Yesterday',
    },
    {
      id: 'AUD-0814',
      patientName: 'Priya Sharma',
      age: 42,
      aiGrade: 'Mild NPDR (Grade 1)',
      aiConfidence: 98.4,
      doctorGrade: 'Mild NPDR (Grade 1)',
      agreementStatus: 'Agreed',
      retinalImage: createDefaultFundusDataUrl('normal'),
      notes: 'Isolated microaneurysms temporal to macula. High confidence concordant.',
      flaggedDate: '2 days ago',
    },
  ]);

  const [selectedCaseId, setSelectedCaseId] = useState<string>(auditCases[0].id);
  const activeCase = auditCases.find(c => c.id === selectedCaseId) || auditCases[0];

  // Doctor Evaluation Form State
  const [accuracyRating, setAccuracyRating] = useState<'Exact Match' | 'Over-called (Too Severe)' | 'Under-called (Too Mild)' | 'Misclassified'>('Exact Match');
  const [vesselFeedback, setVesselFeedback] = useState<'Accurate' | 'Minor Discrepancy' | 'Unsatisfactory'>('Accurate');
  const [lesionFeedback, setLesionFeedback] = useState<'All Detected' | 'Missed Subtle Lesions' | 'False Positive Artifacts'>('All Detected');
  const [xaiSaliency, setXaiSaliency] = useState<'Clinically Plausible' | 'Decentered / Diffuse' | 'Misleading'>('Clinically Plausible');
  const [clinicalNotes, setClinicalNotes] = useState(
    'AI lesion bounding accurately localized microaneurysms and temporal exudates. ETDRS 4-2-1 rules satisfied. Approved for inclusion in validated federated consensus pool.'
  );
  const [showSubmitToast, setShowSubmitToast] = useState(false);
  const [evaluatedCount, setEvaluatedCount] = useState(148);

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSubmitToast(true);
    setEvaluatedCount(prev => prev + 1);
    setTimeout(() => setShowSubmitToast(false), 4500);

    // Update active case status
    setAuditCases(prev =>
      prev.map(c => {
        if (c.id === activeCase.id) {
          return {
            ...c,
            agreementStatus: accuracyRating === 'Exact Match' ? 'Agreed' : 'Adjusted',
            notes: clinicalNotes,
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 select-none pb-20">
      {/* ─── TOAST NOTIFICATION ─── */}
      <AnimatePresence>
        {showSubmitToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#124B3A] text-white shadow-2xl border border-[#1F7A5A] flex items-center gap-3 max-w-md"
          >
            <div className="w-8 h-8 rounded-full bg-[#E9A23B] flex items-center justify-center text-[#17221C] shrink-0 font-bold">
              ✓
            </div>
            <div>
              <div className="text-xs font-bold">Doctor Model Evaluation Logged</div>
              <div className="text-[11px] text-white/80">
                Case {activeCase.id} queued for Bi-Weekly Active Learning Edge Retraining with DP ε=0.5.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 1. EXECUTIVE HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A5A] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              Clinician-in-the-Loop Tele-Ophthalmology Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            Model Evaluation & Continuous Learning Feedback
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            Review borderline AI inferences, log clinical discordance, and calibrate edge weights with differential privacy guarantees.
          </p>
        </div>

        {/* Doctor Identity Stamp */}
        <div className="p-3 rounded-2xl bg-[#FAF4ED] border border-[#E9A23B]/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#124B3A] text-[#E9A23B] flex items-center justify-center font-bold">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-[#124B3A]">
              Dr. Arvind Natarajan, MS
            </div>
            <div className="text-[10px] text-[#65736B] font-mono">
              Lead Evaluator • MCI Reg: 2012/04812
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. CLINICAL AI TELEMETRY METRIC CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#DDE5DC] p-4 shadow-xs">
          <div className="text-[10px] font-mono font-bold text-[#65736B] uppercase">QUADRATIC KAPPA</div>
          <div className="text-2xl sm:text-3xl font-black text-[#124B3A] font-mono mt-1">0.942</div>
          <div className="text-[10px] text-[#1F7A5A] font-semibold mt-1">✓ Target Agreement Met (&gt; 0.90)</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDE5DC] p-4 shadow-xs">
          <div className="text-[10px] font-mono font-bold text-[#65736B] uppercase">DISCORDANCE RATE</div>
          <div className="text-2xl sm:text-3xl font-black text-[#E9A23B] font-mono mt-1">3.8%</div>
          <div className="text-[10px] text-[#8A5612] font-semibold mt-1">6 Borderline Cases Flagged</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDE5DC] p-4 shadow-xs">
          <div className="text-[10px] font-mono font-bold text-[#65736B] uppercase">DIFFERENTIAL PRIVACY</div>
          <div className="text-2xl sm:text-3xl font-black text-[#1F7A5A] font-mono mt-1">ε = 0.5</div>
          <div className="text-[10px] text-[#65736B] font-semibold mt-1">Zero Patient Data Leakage</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDE5DC] p-4 shadow-xs">
          <div className="text-[10px] font-mono font-bold text-[#65736B] uppercase">DOCTOR AUDITS LOGGED</div>
          <div className="text-2xl sm:text-3xl font-black text-[#17221C] font-mono mt-1">{evaluatedCount}</div>
          <div className="text-[10px] text-[#124B3A] font-semibold mt-1">Consensus Dataset Verified</div>
        </div>
      </div>

      {/* ─── 3. ACTIVE MODEL EVALUATION WORKSTATION ─── */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Case Selector & Scan Visualizer (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-[#DDE5DC] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#124B3A] flex items-center gap-1.5">
                <Database size={14} /> Audit Case Queue
              </span>
              <span className="text-[10px] font-mono text-[#65736B]">Select case to evaluate</span>
            </div>

            {/* Case List Buttons */}
            <div className="space-y-2">
              {auditCases.map(c => {
                const isSelected = selectedCaseId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCaseId(c.id);
                      setAccuracyRating(c.agreementStatus === 'Agreed' ? 'Exact Match' : 'Over-called (Too Severe)');
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#1F7A5A] bg-[#1F7A5A]/10 text-[#124B3A] ring-2 ring-[#1F7A5A]/30'
                        : 'border-[#DDE5DC] bg-[#F8F6EF]/50 text-[#17221C] hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">
                        {c.patientName} <span className="font-normal text-[#65736B]">({c.age} yrs)</span>
                      </div>
                      <div className="text-[11px] text-[#65736B] font-mono mt-0.5">
                        AI: {c.aiGrade}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.agreementStatus === 'Agreed'
                            ? 'bg-[#1F7A5A]/15 text-[#1F7A5A]'
                            : 'bg-[#E9A23B]/15 text-[#8A5612]'
                        }`}
                      >
                        {c.agreementStatus}
                      </span>
                      <div className="text-[9px] text-[#65736B] font-mono mt-0.5">{c.flaggedDate}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Fundus Visual Preview */}
            <div className="pt-2">
              <span className="text-xs font-bold text-[#17221C] block mb-2">
                Scan Preview: {activeCase.patientName} ({activeCase.id})
              </span>
              <div className="w-full aspect-square rounded-2xl bg-[#06150F] border border-[#124B3A]/40 flex items-center justify-center p-3 relative overflow-hidden">
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-2 border-[#1F7A5A]/50 relative shadow-2xl">
                  <img
                    src={activeCase.retinalImage}
                    alt="Fundus Scan"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#1F7A5A]/25 via-transparent to-[#E9A23B]/25 pointer-events-none" />
                  <div className="absolute top-[38%] left-[46%] w-5 h-5 rounded-full border-2 border-[#E76F51] bg-[#E76F51]/20 animate-pulse" />
                  <div className="absolute top-[52%] left-[62%] w-6 h-6 rounded-full border-2 border-[#E9A23B] bg-[#E9A23B]/20" />
                </div>
                <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/80 text-[10px] text-white font-mono">
                  {activeCase.aiGrade} ({activeCase.aiConfidence}% Conf)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Evaluation Form (7 Cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmitEvaluation}
            className="bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#DDE5DC]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5A]">
                  Active Feedback Module
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#17221C] tracking-tight">
                  Doctor Clinical Evaluation
                </h2>
                <p className="text-xs text-[#65736B]">
                  Auditing Case: <strong className="text-[#124B3A]">{activeCase.patientName} ({activeCase.id})</strong>
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF4ED] text-[#8A5612] border border-[#E9A23B]/30">
                Edge Model: RetinaFusion-v2.4
              </span>
            </div>

            {/* 1. AI ICDR Diagnostic Grade Agreement */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#17221C] block">
                1. Clinical Diagnosis Concordance (ICDR Staging)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Exact Match',
                  'Over-called (Too Severe)',
                  'Under-called (Too Mild)',
                  'Misclassified',
                ].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAccuracyRating(opt as any)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      accuracyRating === opt
                        ? 'border-[#1F7A5A] bg-[#1F7A5A]/10 text-[#124B3A] ring-2 ring-[#1F7A5A]/30'
                        : 'border-[#DDE5DC] bg-[#F8F6EF]/50 text-[#65736B] hover:bg-white'
                    }`}
                  >
                    {accuracyRating === opt ? '✓ ' : ''}{opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Micro-Vascular & Lesion Specificity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17221C] block">
                  2. Vessel & Anatomy Segmentation
                </label>
                <select
                  value={vesselFeedback}
                  onChange={e => setVesselFeedback(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-xs font-semibold text-[#17221C] focus:border-[#1F7A5A] focus:outline-hidden"
                >
                  <option value="Accurate">Accurate (Disc/Cup/Vessels)</option>
                  <option value="Minor Discrepancy">Minor Disc Contour Drift</option>
                  <option value="Unsatisfactory">Unsatisfactory Segmentation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17221C] block">
                  3. Lesion Bounding Precision
                </label>
                <select
                  value={lesionFeedback}
                  onChange={e => setLesionFeedback(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-xs font-semibold text-[#17221C] focus:border-[#1F7A5A] focus:outline-hidden"
                >
                  <option value="All Detected">All Lesions Accurately Detected</option>
                  <option value="Missed Subtle Lesions">Missed Subtle Microaneurysms</option>
                  <option value="False Positive Artifacts">False Positive Artifact Overcount</option>
                </select>
              </div>
            </div>

            {/* 3. XAI Heatmap Clinical Relevance */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#17221C] block">
                4. Explainability (XAI Saliency Plausibility)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'Clinically Plausible',
                  'Decentered / Diffuse',
                  'Misleading',
                ].map(sal => (
                  <button
                    key={sal}
                    type="button"
                    onClick={() => setXaiSaliency(sal as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      xaiSaliency === sal
                        ? 'border-[#124B3A] bg-[#124B3A] text-white shadow-xs'
                        : 'border-[#DDE5DC] bg-[#F8F6EF]/50 text-[#65736B] hover:bg-white'
                    }`}
                  >
                    {sal}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Clinical Comments & Retraining Directives */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#17221C]">
                  5. Ophthalmologist Audit Notes & Edge Calibration Directives
                </label>
                <span className="text-[10px] text-[#65736B]">Will seed active learning gradient</span>
              </div>
              <textarea
                value={clinicalNotes}
                onChange={e => setClinicalNotes(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-2xl border border-[#DDE5DC] bg-[#FAF4ED]/30 text-xs text-[#17221C] focus:border-[#1F7A5A] focus:outline-hidden leading-relaxed"
                placeholder="Enter specific clinical directives or feature corrections..."
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'Confirmed Grade 2; safe for tele-followup',
                  'Adjust to Grade 1; artifact overcount',
                  'High confidence concordant',
                  'Include in next active retraining batch',
                ].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setClinicalNotes(preset)}
                    className="px-2.5 py-1 rounded-lg bg-[#F8F6EF] hover:bg-[#FAF4ED] text-[10px] font-semibold text-[#124B3A] border border-[#DDE5DC] transition-all"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between gap-4 border-t border-[#DDE5DC]">
              <div className="text-xs text-[#65736B] flex items-center gap-1.5">
                <Lock size={13} className="text-[#1F7A5A]" />
                <span>Protected by Differential Privacy (ε=0.5, δ=1e-5)</span>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-xs font-bold transition-all shadow-md shadow-[#124B3A]/20 flex items-center gap-2"
              >
                <Send size={15} />
                <span>Submit Evaluation & Retraining Flag</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─── 4. CONTINUOUS LEARNING PIPELINE ARCHITECTURE (3 STEPS) ─── */}
      <div className="p-6 rounded-3xl bg-[#FAF4ED] border border-[#E9A23B]/30 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8A5612]">
            Human-in-the-Loop Architecture
          </span>
          <h3 className="text-lg font-black text-[#124B3A] tracking-tight">
            How Your Feedback Updates Rural Edge Devices
          </h3>
          <p className="text-xs text-[#65736B]">
            RetinaFusion 360 utilizes active learning with differential privacy so clinic improvements propagate without centralizing raw retinal imagery.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-white border border-[#DDE5DC] space-y-2">
            <span className="w-7 h-7 rounded-lg bg-[#124B3A] text-white text-xs font-mono font-bold flex items-center justify-center">
              01
            </span>
            <h4 className="text-xs font-bold text-[#124B3A]">Epistemic Uncertainty Filter</h4>
            <p className="text-[11px] text-[#65736B] leading-relaxed">
              When clinician rating discordance exceeds threshold, cases are automatically anonymized and prioritized for active learning review.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DDE5DC] space-y-2">
            <span className="w-7 h-7 rounded-lg bg-[#1F7A5A] text-white text-xs font-mono font-bold flex items-center justify-center">
              02
            </span>
            <h4 className="text-xs font-bold text-[#1F7A5A]">Triple-Specialist Consensus</h4>
            <p className="text-[11px] text-[#65736B] leading-relaxed">
              Discrepancies are independently cross-audited by three certified vitreoretinal ophthalmologists to establish ground truth.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DDE5DC] space-y-2">
            <span className="w-7 h-7 rounded-lg bg-[#E9A23B] text-[#17221C] text-xs font-mono font-bold flex items-center justify-center">
              03
            </span>
            <h4 className="text-xs font-bold text-[#8A5612]">Quantized Edge Delta Sync</h4>
            <p className="text-[11px] text-[#65736B] leading-relaxed">
              Trained gradient deltas are compiled to INT8 TensorRT and opportunistically pushed to Primary Health Centers over intermittent 2G/4G connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
