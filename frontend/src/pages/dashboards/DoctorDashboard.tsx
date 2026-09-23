import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { usePatientWorkflow, ScreeningRecord, DoctorVerificationInput } from '../../context/PatientWorkflowContext';
import { useRetinaData, createDefaultFundusDataUrl } from '../../context/RetinaContext';
import {
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  FileCheck,
  Check,
  X,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  Layers,
  Activity,
  ThumbsUp,
  MessageSquare,
  Search,
  ExternalLink,
  Sliders,
  Maximize2,
  Download,
  RotateCcw,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    patients,
    doctorQueue,
    verifyByDoctor,
  } = usePatientWorkflow();
  const { activeImage } = useRetinaData();

  // Active reviewing report state
  const [selectedReport, setSelectedReport] = useState<ScreeningRecord | null>(
    doctorQueue.find(q => q.reportStatus === 'Awaiting Doctor Review') || doctorQueue[0] || null
  );

  const retinalImg = selectedReport?.retinalImage || activeImage || createDefaultFundusDataUrl('npdr');
  const xaiImg = selectedReport?.aiResult.xaiHeatmapUrl || activeImage || createDefaultFundusDataUrl('npdr');
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Optic Inspection Modes
  const [inspectMode, setInspectMode] = useState<'side-by-side' | 'overlay' | 'lesions'>('side-by-side');
  const [showLesionMarkers, setShowLesionMarkers] = useState(true);

  // Doctor Verification Form State (Section 22 & 23)
  const [assessment, setAssessment] = useState<'Agree with AI' | 'Disagree with AI' | 'Requires Further Review'>('Agree with AI');
  const [doctorComments, setDoctorComments] = useState(
    'Confirmed Grade 2 Moderate NPDR. Perifoveal circinate hard exudates without central foveal involvement. Recommend in-person tele-OPD evaluation within 30 days and strict HbA1c control (<7.0%).'
  );
  const [aiAccuracy, setAiAccuracy] = useState<'Correct' | 'Partially Correct' | 'Incorrect'>('Correct');
  const [verifySuccessToast, setVerifySuccessToast] = useState(false);

  // Filter queues
  const pendingReports = doctorQueue.filter(
    r => r.reportStatus === 'Awaiting Doctor Review' || r.reportStatus === 'Awaiting Doctor Verification'
  );
  const verifiedReports = doctorQueue.filter(r => r.reportStatus === 'Doctor Verified');
  const requiringReview = doctorQueue.filter(r => r.reportStatus === 'Requires Reassessment');
  const referralCases = doctorQueue.filter(r => r.aiResult.gradeIndex >= 2);

  const displayedList =
    activeTab === 'pending'
      ? pendingReports
      : activeTab === 'verified'
      ? verifiedReports
      : doctorQueue;

  const filteredReports = displayedList.filter(
    r =>
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientVillage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Clinical Quick Comment Presets
  const CLINICAL_PRESETS = [
    {
      title: 'Grade 2 NPDR (30-Day Follow-Up)',
      text: 'Confirmed Grade 2 Moderate NPDR. Perifoveal circinate hard exudates without central foveal involvement. Recommend tele-OPD evaluation within 30 days and strict glycemic monitoring (HbA1c < 7.0%).',
    },
    {
      title: 'High Risk Grade 3+ (Urgent Anti-VEGF)',
      text: 'Confirmed Grade 3 Severe NPDR with multiple intraretinal microvascular abnormalities across all quadrants. Urgent referral to tertiary vitreo-retinal surgeon for Anti-VEGF / Pan-Retinal Photocoagulation triage.',
    },
    {
      title: 'Mild / Low Risk (Annual Review)',
      text: 'Mild Non-Proliferative Diabetic Retinopathy with isolated microaneurysms. No sight-threatening maculopathy. Advised blood pressure & glucose stabilization with annual re-screening.',
    },
    {
      title: 'Retake Scans (Borderline Focus)',
      text: 'Sub-optimal focal illumination over temporal peripheral vascular arcade. Recommend repeat non-mydriatic fundus photography before definitive tertiary referral.',
    },
  ];

  const handleOpenReview = (report: ScreeningRecord) => {
    setSelectedReport(report);
    if (report.doctorReview) {
      setAssessment(report.doctorReview.assessment);
      setDoctorComments(report.doctorReview.doctorComments);
      setAiAccuracy(report.doctorReview.aiAccuracyFeedback);
    } else {
      setAssessment('Agree with AI');
      setDoctorComments(
        `Clinical verification for ${report.patientName}: Verified as ${report.aiResult.drCategory}. Recommend glycemic monitoring and follow-up within 30 days.`
      );
      setAiAccuracy('Correct');
    }
  };

  const [lastAction, setLastAction] = useState<'verify' | 'reassess'>('verify');

  const handleVerifySubmit = (action: 'verify' | 'reassess') => {
    if (!selectedReport) return;

    setLastAction(action);
    const input: DoctorVerificationInput = {
      assessment,
      doctorComments: doctorComments.trim(),
      aiAccuracyFeedback: aiAccuracy,
      action,
    };

    verifyByDoctor(selectedReport.id, input);
    setVerifySuccessToast(true);
    setTimeout(() => setVerifySuccessToast(false), 4000);

    // Refresh selected report status in view
    setSelectedReport(prev =>
      prev
        ? {
            ...prev,
            reportStatus: action === 'verify' ? 'Doctor Verified' : 'Requires Reassessment',
            doctorReview: {
              verifiedBy: user?.name || 'Dr. Arvind Natarajan',
              qualification: 'MBBS, MS (Ophthalmology), DNB, FVR',
              hospital: 'District Hospital Pune & e-Sanjeevani Tele-Consultant',
              assessment,
              doctorComments: doctorComments.trim(),
              aiAccuracyFeedback: aiAccuracy,
              verifiedAt: new Date().toISOString(),
              signatureStamp: 'REG-MCI-2012-08492-NATARAJAN',
            },
          }
        : null
    );
  };

  const isCurrentReportVerified = selectedReport?.reportStatus === 'Doctor Verified';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 select-none">
      {/* ─── SUCCESS / REASSESSMENT TOAST ─── */}
      <AnimatePresence>
        {verifySuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 p-4 rounded-2xl text-white shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold ${
              lastAction === 'reassess'
                ? 'bg-[#E76F51] border border-[#d65f42]'
                : 'bg-[#124B3A] border border-[#1F7A5A]'
            }`}
          >
            {lastAction === 'reassess' ? (
              <>
                <AlertTriangle size={18} className="text-white shrink-0" />
                <span>⚠️ Reassessment Requested! Alert sent to Hospital Dashboard & Patient Docket.</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} className="text-[#1F7A5A] shrink-0" />
                <span>✓ Report Verified & Digitally Signed! Released to Patient & Health Center.</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TELE-OPHTHALMOLOGY DESK HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#124B3A]" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              Tele-Ophthalmologist Verification Desk • NABL & AIIMS Protocol
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            PATIENT REPORT REVIEW
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            Independent human specialist verification of 11-stage AI retinal screening predictions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-4 py-2 rounded-xl bg-white border border-[#DDE5DC] text-xs font-bold text-[#124B3A] shadow-xs flex items-center gap-2">
            <Stethoscope size={15} className="text-[#1F7A5A]" />
            <span>Dr. Arvind Natarajan, MS (Ophthal), FVR</span>
          </div>
          <Link
            to="/reports"
            className="px-3 py-2 rounded-xl bg-[#F8F6EF] hover:bg-[#FAF4ED] text-[#124B3A] border border-[#DDE5DC] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            title="Browse Diagnostic Reports & FHIR R4 Docket"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">All Reports</span>
          </Link>
        </div>
      </div>

      {/* ─── INTERACTIVE SUMMARY METRICS (Clickable Filters) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-[#E9A23B]/15 border-[#E9A23B] shadow-sm ring-2 ring-[#E9A23B]/30'
              : 'bg-white border-[#DDE5DC] hover:bg-[#FAF4ED] shadow-xs'
          }`}
          title="Click to view pending reviews"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A5612]">
              Pending Reports
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E9A23B] animate-pulse" />
          </div>
          <span className="text-2xl font-black text-[#8A5612] mt-1 block">
            {pendingReports.length}
          </span>
          <span className="text-[10px] text-[#8A5612] mt-0.5 block">Requires Human Review</span>
        </div>

        <div
          onClick={() => setActiveTab('verified')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'verified'
              ? 'bg-[#1F7A5A]/15 border-[#1F7A5A] shadow-sm ring-2 ring-[#1F7A5A]/20'
              : 'bg-white border-[#DDE5DC] hover:bg-[#FAF4ED] shadow-xs'
          }`}
          title="Click to view verified reports"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#124B3A]">
              Verified Reports
            </span>
            <CheckCircle2 size={13} className="text-[#1F7A5A]" />
          </div>
          <span className="text-2xl font-black text-[#1F7A5A] mt-1 block">
            {verifiedReports.length}
          </span>
          <span className="text-[10px] text-[#1F7A5A] mt-0.5 block">Certified & Released</span>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#124B3A]/10 border-[#124B3A] shadow-sm ring-2 ring-[#124B3A]/20'
              : 'bg-white border-[#DDE5DC] hover:bg-[#FAF4ED] shadow-xs'
          }`}
          title="Click to view all screening cases"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#65736B] block">
            All Queue Cases
          </span>
          <span className="text-2xl font-black text-[#17221C] mt-1 block">
            {doctorQueue.length}
          </span>
          <span className="text-[10px] text-[#65736B] mt-0.5 block">Total Received</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DDE5DC] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E76F51] block">
            Referral Urgency
          </span>
          <span className="text-2xl font-black text-[#E76F51] mt-1 block">
            {referralCases.length}
          </span>
          <span className="text-[10px] text-[#E76F51] mt-0.5 block">Grade 2+ Priority</span>
        </div>
      </div>

      {/* ─── SPLIT VIEW: QUEUE & DETAILED REPORT REVIEW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Queue Cards */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#DDE5DC] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DC]">
            <div>
              <h2 className="text-sm font-bold text-[#17221C]">Review Queue</h2>
              <span className="text-[11px] text-[#65736B]">
                {displayedList.length} cases in this view
              </span>
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'pending'
                    ? 'bg-[#E9A23B] text-white shadow-xs'
                    : 'bg-[#F8F6EF] text-[#65736B] hover:bg-[#FAF4ED]'
                }`}
              >
                Pending ({pendingReports.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('verified')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'verified'
                    ? 'bg-[#1F7A5A] text-white shadow-xs'
                    : 'bg-[#F8F6EF] text-[#65736B] hover:bg-[#FAF4ED]'
                }`}
              >
                Verified ({verifiedReports.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'all'
                    ? 'bg-[#124B3A] text-white shadow-xs'
                    : 'bg-[#F8F6EF] text-[#65736B] hover:bg-[#FAF4ED]'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search size={13} className="text-[#65736B] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by patient name, village, or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 outline-none focus:border-[#1F7A5A]"
            />
          </div>

          {/* Queue List Cards */}
          <div className="space-y-3 max-h-[660px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredReports.map(report => {
              const isSelected = selectedReport?.id === report.id;
              const isVerified = report.reportStatus === 'Doctor Verified';

              return (
                <div
                  key={report.id}
                  onClick={() => handleOpenReview(report)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#124B3A] bg-[#1F7A5A]/10 shadow-md ring-1 ring-[#124B3A]'
                      : 'border-[#DDE5DC] bg-[#FAF4ED]/30 hover:bg-[#FAF4ED]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <strong className="text-xs text-[#17221C] block group-hover:text-[#124B3A]">
                        {report.patientName}
                      </strong>
                      <span className="text-[10px] text-[#65736B]">
                        Age {report.patientAge} • {report.patientVillage}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isVerified
                          ? 'bg-[#1F7A5A]/20 text-[#124B3A]'
                          : 'bg-[#E9A23B]/20 text-[#8A5612]'
                      }`}
                    >
                      {isVerified ? '✓ Verified' : 'Awaiting Review'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#DDE5DC]/70">
                    <div>
                      <span className="text-[#65736B]">AI Grade: </span>
                      <strong className="text-[#124B3A]">{report.aiResult.drCategory}</strong>
                    </div>
                    <div>
                      <span className="text-[#65736B]">Confidence: </span>
                      <strong className="text-[#17221C]">{report.aiResult.confidence}%</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#65736B] pt-2">
                    <span>OOD Error Risk: {(report.aiResult.errorRisk * 100).toFixed(1)}%</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReview(report);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#124B3A] hover:bg-[#1F7A5A] text-white font-bold text-[10px] flex items-center gap-1 transition-all"
                    >
                      <span>Review Case</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredReports.length === 0 && (
              <div className="p-8 text-center text-xs text-[#65736B] bg-[#F8F6EF]/50 rounded-2xl border border-dashed border-[#DDE5DC]">
                No reports matching the filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Doctor Report Review Workstation */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 shadow-sm space-y-6">
          {selectedReport ? (
            <>
              {/* Patient Information & AI Classification */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE5DC]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F8F6EF] border border-[#DDE5DC] text-[#65736B]">
                      {selectedReport.id}
                    </span>
                    <span className="text-xs text-[#65736B]">
                      Screened: {selectedReport.date}
                    </span>
                    {isCurrentReportVerified && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1F7A5A]/20 text-[#124B3A]">
                        ✓ Doctor Verified
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#17221C]">
                    {selectedReport.patientName}
                  </h2>
                  <p className="text-xs text-[#65736B]">
                    Age: {selectedReport.patientAge} • Village: {selectedReport.patientVillage} • Center: Shirur PHC
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#65736B] block">
                    AI ICDR Grade
                  </span>
                  <span className="text-xl font-black text-[#124B3A]">
                    {selectedReport.aiResult.drCategory}
                  </span>
                  <span className="text-[11px] text-[#1F7A5A] font-semibold block">
                    {selectedReport.aiResult.confidence}% Model Confidence
                  </span>
                </div>
              </div>

              {/* Fundus Image & XAI Relational Heatmap with Interactive Mode Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#124B3A] uppercase tracking-wider text-[11px]">
                    Multimodal Optical Inspection
                  </span>
                  <div className="flex items-center gap-1.5 p-1 bg-[#F8F6EF] rounded-xl border border-[#DDE5DC]">
                    <button
                      type="button"
                      onClick={() => setInspectMode('side-by-side')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        inspectMode === 'side-by-side'
                          ? 'bg-[#124B3A] text-white shadow-xs'
                          : 'text-[#65736B] hover:text-[#17221C]'
                      }`}
                    >
                      Side-by-Side
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectMode('overlay')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        inspectMode === 'overlay'
                          ? 'bg-[#124B3A] text-white shadow-xs'
                          : 'text-[#65736B] hover:text-[#17221C]'
                      }`}
                    >
                      Heatmap Overlay
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectMode('lesions')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        inspectMode === 'lesions'
                          ? 'bg-[#124B3A] text-white shadow-xs'
                          : 'text-[#65736B] hover:text-[#17221C]'
                      }`}
                    >
                      Lesion Annotations
                    </button>
                  </div>
                </div>

                {inspectMode === 'side-by-side' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-[#06150F] border border-[#124B3A]/40 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-white/80">
                        <span className="font-bold">Retinal Fundus Image</span>
                        <span className="font-mono text-[#1F7A5A]">Quality: {selectedReport.imageQuality.score}/100</span>
                      </div>
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-black border border-white/10 relative">
                        <img
                          src={retinalImg}
                          alt="Retina"
                          className="w-full h-full object-cover"
                        />
                        {showLesionMarkers && (
                          <>
                            <div className="absolute top-[38%] left-[46%] w-5 h-5 rounded-full border-2 border-[#E76F51] bg-[#E76F51]/25 animate-pulse" title="Microaneurysm cluster" />
                            <div className="absolute top-[52%] left-[62%] w-6 h-6 rounded-full border-2 border-[#E9A23B] bg-[#E9A23B]/25" title="Circinate hard exudates" />
                          </>
                        )}
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                          45° Field of View
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#06150F] border border-[#124B3A]/40 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-white/80">
                        <span className="font-bold">XAI Attention Heatmap</span>
                        <span className="font-mono text-[#E9A23B]">GNN Relational</span>
                      </div>
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-black border border-white/10 relative">
                        <img
                          src={xaiImg}
                          alt="XAI"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#1F7A5A]/30 via-transparent to-[#E9A23B]/30 pointer-events-none" />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                          Graph Attention Nodes
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#06150F] border border-[#124B3A]/40 flex flex-col items-center justify-center">
                    <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden bg-black border-2 border-[#1F7A5A]/50 relative shadow-2xl">
                      <img
                        src={retinalImg}
                        alt="Retina"
                        className="w-full h-full object-cover"
                      />
                      {inspectMode === 'overlay' && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#1F7A5A]/40 via-transparent to-[#E9A23B]/40 mix-blend-screen pointer-events-none" />
                      )}
                      {/* Lesion bounding boxes */}
                      <div className="absolute top-[38%] left-[46%] w-6 h-6 rounded-full border-2 border-[#E76F51] bg-[#E76F51]/30 animate-pulse flex items-center justify-center text-[9px] text-white font-bold">
                        MA
                      </div>
                      <div className="absolute top-[52%] left-[62%] w-7 h-7 rounded-full border-2 border-[#E9A23B] bg-[#E9A23B]/30 flex items-center justify-center text-[9px] text-white font-bold">
                        EX
                      </div>
                      <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/85 text-[10px] text-white font-mono">
                        {inspectMode === 'overlay' ? 'Heatmap Overlaid Mode' : 'Lesion Coordinate Mapping'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-Dimensional Clinical Evidence Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F8F6EF]/70 border border-[#DDE5DC]">
                  <span className="text-[#65736B] block text-[10px]">Detected Lesions</span>
                  <strong className="text-[#17221C] text-xs">
                    {selectedReport.aiResult.detectedLesions.hardExudates} Exudates, {selectedReport.aiResult.detectedLesions.microaneurysms} MA
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F6EF]/70 border border-[#DDE5DC]">
                  <span className="text-[#65736B] block text-[10px]">Evidence Strength</span>
                  <strong className="text-[#1F7A5A] text-xs">
                    {selectedReport.aiResult.evidenceStrength}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F6EF]/70 border border-[#DDE5DC]">
                  <span className="text-[#65736B] block text-[10px]">Self-Aware Error Risk</span>
                  <strong className="text-[#17221C] text-xs">
                    {(selectedReport.aiResult.errorRisk * 100).toFixed(1)}% (Low OOD)
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F6EF]/70 border border-[#DDE5DC]">
                  <span className="text-[#65736B] block text-[10px]">Trust Decision</span>
                  <strong className="text-[#E76F51] text-xs">
                    {selectedReport.aiResult.trustDecision}
                  </strong>
                </div>
              </div>

              {/* Official Verified Seal Card (If Already Verified) */}
              {isCurrentReportVerified && (
                <div className="p-5 rounded-2xl bg-[#1F7A5A]/10 border-2 border-[#1F7A5A] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={20} className="text-[#1F7A5A]" />
                      <span className="text-xs font-black uppercase tracking-wider text-[#124B3A]">
                        Official Doctor Verification Seal
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1F7A5A] text-white">
                      ✓ Certified
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#DDE5DC] text-xs space-y-1 text-[#17221C]">
                    <div>
                      Verified by: <strong>{selectedReport.doctorReview?.verifiedBy || 'Dr. Arvind Natarajan'}</strong> ({selectedReport.doctorReview?.qualification || 'MS Ophthalmology'})
                    </div>
                    <div>
                      Medical Council Registration: <strong className="font-mono text-[#124B3A]">{selectedReport.doctorReview?.signatureStamp || 'MCI-2012-08492'}</strong>
                    </div>
                    <div className="text-[#65736B] italic pt-1 border-t border-[#DDE5DC]/60">
                      "{selectedReport.doctorReview?.doctorComments}"
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#65736B]">
                      Released to patient portal and health center
                    </span>
                    <Link
                      to="/reports"
                      className="px-4 py-2 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <FileText size={14} />
                      <span>View Printable Diagnostic Docket</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* ─── DOCTOR VERIFICATION FORM ─── */}
              <div className="p-6 rounded-2xl bg-[#FAF4ED]/90 border border-[#DDE5DC] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DC]">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#124B3A]">
                      Human Medical Verification Layer
                    </h3>
                    <p className="text-[11px] text-[#65736B]">
                      The ophthalmologist is the final diagnostic authority. AI is an assistive decision-support model.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#124B3A] text-white text-[10px] font-mono font-bold">
                    MCI-2012-08492
                  </span>
                </div>

                {/* AI Prediction Display */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#DDE5DC] text-xs">
                  <span className="text-[#65736B]">AI Suggested Grade:</span>
                  <strong className="text-[#124B3A]">
                    {selectedReport.aiResult.drCategory} ({selectedReport.aiResult.confidence}% confidence)
                  </strong>
                </div>

                {/* Doctor's Assessment */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1.5">
                    Doctor's Assessment
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'Agree with AI', icon: CheckCircle2 },
                      { key: 'Disagree with AI', icon: X },
                      { key: 'Requires Further Review', icon: AlertTriangle },
                    ].map(opt => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setAssessment(opt.key as any)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            assessment === opt.key
                              ? 'bg-[#124B3A] text-white border-[#124B3A] shadow-xs'
                              : 'bg-white text-[#65736B] border-[#DDE5DC] hover:bg-[#FAF4ED]'
                          }`}
                        >
                          <Icon size={14} />
                          <span>{opt.key}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Doctor Comments & Clinical Notes */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C]">
                      Doctor Comments & Clinical Notes
                    </label>
                    <span className="text-[10px] text-[#65736B]">Click preset below to auto-fill</span>
                  </div>

                  {/* Clinical 1-Click Comment Presets */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {CLINICAL_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDoctorComments(preset.text)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white hover:bg-[#FAF4ED] text-[#124B3A] border border-[#DDE5DC] transition-all"
                        title={preset.text}
                      >
                        + {preset.title}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={doctorComments}
                    onChange={e => setDoctorComments(e.target.value)}
                    placeholder="Enter clinical findings, referral instructions, and HbA1c counseling..."
                    className="w-full p-3 text-xs rounded-xl border border-[#DDE5DC] bg-white outline-none focus:border-[#1F7A5A] text-[#17221C] shadow-2xs"
                  />
                </div>

                {/* Structured Model Feedback */}
                <div className="p-3.5 rounded-xl bg-white border border-[#DDE5DC] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#124B3A] flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#E9A23B]" />
                      <span>AI Model Accuracy (Continuous Learning Feedback Loop)</span>
                    </span>
                    <span className="text-[10px] text-[#65736B]">Tele-ophthalmologist telemetry</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(['Correct', 'Partially Correct', 'Incorrect'] as const).map(acc => (
                      <button
                        key={acc}
                        type="button"
                        onClick={() => setAiAccuracy(acc)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          aiAccuracy === acc
                            ? 'bg-[#1F7A5A] text-white border-[#1F7A5A] shadow-xs'
                            : 'bg-[#F8F6EF] text-[#65736B] border-[#DDE5DC] hover:bg-[#FAF4ED]'
                        }`}
                      >
                        {acc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons: Verify Report or Request Reassessment */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleVerifySubmit('reassess')}
                    className="px-4 py-2.5 rounded-xl border border-[#E76F51] text-[#E76F51] hover:bg-[#E76F51]/10 text-xs font-bold transition-all"
                  >
                    Request Reassessment
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerifySubmit('verify')}
                    className="px-6 py-2.5 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-xs font-bold shadow-md shadow-[#124B3A]/20 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>{isCurrentReportVerified ? 'Re-Verify & Update Report' : 'Sign & Verify Report'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-xs text-[#65736B]">
              Select a patient report from the queue on the left to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
