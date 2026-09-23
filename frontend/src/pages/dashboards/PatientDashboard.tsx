import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePatientWorkflow, ScreeningRecord } from '../../context/PatientWorkflowContext';
import { useRetinaData, createDefaultFundusDataUrl } from '../../context/RetinaContext';
import { LanguageCode } from '../../types/auth';
import {
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Volume2,
  VolumeX,
  Play,
  Square,
  Eye,
  FileText,
  User,
  Clock,
  ShieldCheck,
  Stethoscope,
  Building2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  PhoneCall,
  Download,
  Bell,
  Activity,
  ZoomIn,
  ZoomOut,
  Info,
  Check,
  X,
  Share2,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginAsDemo } = useAuth();
  const {
    patients,
    activePatient,
    playVoiceExplanation,
    stopVoiceExplanation,
    isSpeakingVoice,
    voiceLangActive,
    spokenTranscript,
  } = usePatientWorkflow();

  // Find the current patient: if logged in as patient, match by ID or name or default to Ramesh Patel
  const currentPatient =
    patients.find(
      p => p.id === user?.id || (user?.email && user.email.toLowerCase().includes('patient'))
    ) ||
    activePatient ||
    patients[0];

  const latestReport: ScreeningRecord | undefined = currentPatient?.latestScreening;
  const isVerified = latestReport?.reportStatus === 'Doctor Verified';
  const isReassessment = latestReport?.reportStatus === 'Requires Reassessment';
  const isAwaitingVerification = !isVerified && !isReassessment && !!latestReport;
  const { activeImage } = useRetinaData();
  const patientRetinalImg = latestReport?.retinalImage || activeImage || createDefaultFundusDataUrl('npdr');

  // Visual Explanation comparison toggle
  const [activeVisualMode, setActiveVisualMode] = useState<'original' | 'highlighted' | 'split'>('highlighted');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedLesion, setSelectedLesion] = useState<'exudate' | 'microaneurysm' | 'macula' | null>(null);

  // Interactive SMS Reminder state
  const [smsReminderScheduled, setSmsReminderScheduled] = useState(false);
  const [showSmsToast, setShowSmsToast] = useState(false);

  // SOS Emergency Helpline modal
  const [showSosModal, setShowSosModal] = useState(false);

  // Active Voice Language Selection
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<LanguageCode>(
    currentPatient?.languagePreference || 'en'
  );

  const handleToggleVoice = (lang: LanguageCode) => {
    if (!latestReport) return;
    if (isSpeakingVoice && voiceLangActive === lang) {
      stopVoiceExplanation();
    } else {
      setSelectedVoiceLang(lang);
      playVoiceExplanation(latestReport, lang);
    }
  };

  const handleScheduleSms = () => {
    setSmsReminderScheduled(true);
    setShowSmsToast(true);
    setTimeout(() => setShowSmsToast(false), 4500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 select-none relative">
      {/* ─── TOAST NOTIFICATION ─── */}
      <AnimatePresence>
        {showSmsToast && (
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
              <div className="text-xs font-bold">SMS Appointment Reminder Scheduled</div>
              <div className="text-[11px] text-white/80">
                Notification queued for {currentPatient?.mobile || '+91 98765-43210'} before{' '}
                {latestReport?.carePlan.followUpDate || '30-Day Follow-Up'}.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── ACCESSIBLE PATIENT HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A5A] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              Ayushman Bharat Digital Health Record • ABHA ID: 91-4432-8819-0129
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            Patient Health Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            Welcome back, <strong className="text-[#17221C]">{currentPatient?.name || 'Ramesh Patel'}</strong> ({currentPatient?.age || 54} yrs, {currentPatient?.gender || 'Male'}) • Village: {currentPatient?.village || 'Shirur Taluka'}
          </p>
        </div>

        {/* Action Header Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Emergency SOS Button */}
          <button
            type="button"
            onClick={() => setShowSosModal(true)}
            className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-[#E76F51]/15 text-[#E76F51] border border-[#E76F51]/30 hover:bg-[#E76F51]/25 transition-all shadow-xs"
          >
            <PhoneCall size={13} />
            <span>Emergency Eye SOS</span>
          </button>

          {/* Status Pill */}
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isVerified
                ? 'bg-[#1F7A5A]/15 text-[#1F7A5A] border border-[#1F7A5A]/30'
                : isReassessment
                ? 'bg-[#E76F51]/15 text-[#E76F51] border border-[#E76F51]/30'
                : 'bg-[#E9A23B]/15 text-[#8A5612] border border-[#E9A23B]/30'
            }`}
          >
            {isVerified ? (
              <>
                <CheckCircle2 size={14} />
                <span>Doctor Verified Report Ready</span>
              </>
            ) : isReassessment ? (
              <>
                <AlertTriangle size={14} />
                <span>Case on Reassessment</span>
              </>
            ) : (
              <>
                <Clock size={14} />
                <span>Screening in Verification</span>
              </>
            )}
          </span>

          {/* Printable Report Direct Link (Only visible when doctor verified) */}
          {isVerified && (
            <Link
              to="/reports"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-[#124B3A] text-white hover:bg-[#1F7A5A] transition-all shadow-xs"
            >
              <Download size={13} />
              <span>Download Docket</span>
            </Link>
          )}
        </div>
      </div>

      {/* ─── HEALTH VITALS CARDS (Clinical Context) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#DDE5DC] shadow-xs">
          <div className="flex items-center justify-between text-[#65736B] mb-1">
            <span className="text-[10px] font-mono uppercase font-bold">HbA1c Glucose</span>
            <Activity size={14} className="text-[#E76F51]" />
          </div>
          <div className="text-lg font-black text-[#17221C]">7.8%</div>
          <div className="text-[10px] text-[#E76F51] font-semibold">Elevated (Target &lt; 7.0%)</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#DDE5DC] shadow-xs">
          <div className="flex items-center justify-between text-[#65736B] mb-1">
            <span className="text-[10px] font-mono uppercase font-bold">Blood Pressure</span>
            <HeartPulse size={14} className="text-[#E9A23B]" />
          </div>
          <div className="text-lg font-black text-[#17221C]">138/86 <span className="text-xs font-normal text-[#65736B]">mmHg</span></div>
          <div className="text-[10px] text-[#8A5612] font-semibold">Stage 1 Pre-hypertension</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#DDE5DC] shadow-xs">
          <div className="flex items-center justify-between text-[#65736B] mb-1">
            <span className="text-[10px] font-mono uppercase font-bold">Intraocular Pressure</span>
            <Eye size={14} className="text-[#1F7A5A]" />
          </div>
          <div className="text-lg font-black text-[#17221C]">16.2 <span className="text-xs font-normal text-[#65736B]">mmHg</span></div>
          <div className="text-[10px] text-[#1F7A5A] font-semibold">Normal (12 - 21 mmHg)</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#DDE5DC] shadow-xs">
          <div className="flex items-center justify-between text-[#65736B] mb-1">
            <span className="text-[10px] font-mono uppercase font-bold">Diabetes Duration</span>
            <Clock size={14} className="text-[#124B3A]" />
          </div>
          <div className="text-lg font-black text-[#17221C]">8 <span className="text-xs font-normal text-[#65736B]">Years</span></div>
          <div className="text-[10px] text-[#65736B] font-semibold">Type 2 Managed</div>
        </div>
      </div>

      {/* ─── PATIENT TIMELINE (Section 34) ─── */}
      <div className="p-5 rounded-3xl bg-white border border-[#DDE5DC] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#65736B] block">
            Screening & Care Timeline
          </span>
          <span
            className={`text-xs font-bold flex items-center gap-1 ${
              isVerified
                ? 'text-[#1F7A5A]'
                : isReassessment
                ? 'text-[#E76F51]'
                : 'text-[#8A5612]'
            }`}
          >
            {isVerified ? (
              <>
                <Check size={13} /> Current Status: Doctor Verified
              </>
            ) : isReassessment ? (
              <>
                <AlertTriangle size={13} /> Current Status: Case on Reassessment
              </>
            ) : (
              <>
                <Clock size={13} /> Current Status: Awaiting Doctor Verification
              </>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {[
            { label: 'Registration', status: 'done', step: '01', detail: 'Shirur CHC' },
            { label: 'Retinal Screening', status: 'done', step: '02', detail: 'Fundus Camera' },
            { label: 'AI Analysis', status: 'done', step: '03', detail: '94% Confidence' },
            {
              label: 'Doctor Review',
              status: isVerified ? 'done' : isReassessment ? 'active' : 'current',
              step: '04',
              detail: isReassessment ? 'Reassessment Active' : 'Dr. Arvind Natarajan',
            },
            { label: 'Final Report', status: isVerified ? 'done' : 'pending', step: '05', detail: 'Digital ABHA' },
            { label: 'Care Plan', status: isVerified ? 'active' : 'pending', step: '06', detail: '30-Day Follow-Up' },
          ].map(t => (
            <div
              key={t.label}
              className={`p-3 rounded-2xl border text-center transition-all ${
                t.status === 'done'
                  ? 'border-[#1F7A5A]/40 bg-[#1F7A5A]/10 text-[#124B3A]'
                  : t.status === 'active' || t.status === 'current'
                  ? 'border-[#E9A23B] bg-[#E9A23B]/10 text-[#8A5612] font-bold ring-2 ring-[#E9A23B]/30'
                  : 'border-[#DDE5DC] bg-[#F8F6EF]/40 text-[#65736B]/60'
              }`}
            >
              <div className="text-[10px] font-mono opacity-70 mb-0.5">{t.step}</div>
              <div className="text-xs font-bold leading-tight">{t.label}</div>
              <div className="text-[9px] opacity-75 mt-0.5">{t.detail}</div>
              <div className="mt-1 flex justify-center">
                {t.status === 'done' ? (
                  <CheckCircle2 size={13} className="text-[#1F7A5A]" />
                ) : t.status === 'active' ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E9A23B] animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#DDE5DC]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CONDITIONAL REPORT VIEWS: REASSESSMENT / AWAITING VERIFICATION / VERIFIED RESULT ─── */}
      {!latestReport ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#DDE5DC] space-y-3">
          <Eye size={36} className="mx-auto text-[#65736B]" />
          <h3 className="text-base font-bold text-[#17221C]">No Screening Recorded Yet</h3>
          <p className="text-xs text-[#65736B] max-w-md mx-auto">
            Please visit your local Health Center (Shirur Community Health Center) to have your retinal scan taken with the portable fundus camera.
          </p>
        </div>
      ) : isReassessment ? (
        /* ─── CASE ON REASSESSMENT NOTICE BANNER ─── */
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FAF4ED] via-white to-[#FDE8E4] border-2 border-[#E76F51]/40 shadow-md space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E76F51]/15 border border-[#E76F51]/30 flex items-center justify-center text-[#E76F51] shrink-0 font-bold">
              <AlertTriangle size={26} />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#E76F51]/15 text-[#E76F51] border border-[#E76F51]/30 text-xs font-bold uppercase tracking-wider">
                Clinical Reassessment Notice
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#E76F51] tracking-tight">
                Sorry, your case is on reassessment, so wait for few minutes
              </h2>
              <p className="text-xs sm:text-sm text-[#526058] leading-relaxed max-w-3xl">
                Dr. Arvind Natarajan has reviewed your retinal examination and requested an additional clinical reassessment. Your case has gone for reassessment, so please wait for a few minutes while our doctors review your case. The full report and clinical findings will be shown once verified.
              </p>
            </div>
          </div>

          {/* Specialist Comments Block */}
          <div className="p-4 rounded-2xl bg-white border border-[#E76F51]/30 space-y-1.5 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-[#E76F51] uppercase tracking-wider block">
              Specialist Reviewer Comments:
            </span>
            <p className="text-xs sm:text-sm text-[#17221C] font-semibold italic">
              "{latestReport.doctorReview?.doctorComments || 'Specialist requested repeat fundus examination with pharmacological pupil dilation.'}"
            </p>
            <div className="text-[11px] text-[#65736B] pt-1">
              Verified By: <strong>{latestReport.doctorReview?.verifiedBy || 'Dr. Arvind Natarajan, MS (Ophthalmology)'}</strong> • District Eye Hospital Pune
            </div>
          </div>

          {/* Next Steps for Patient */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white/80 border border-[#DDE5DC] space-y-1">
              <div className="text-xs font-bold text-[#124B3A]">1. Health Center Alerted</div>
              <div className="text-[11px] text-[#65736B]">
                Shirur Community Health Center has been notified to schedule a repeat imaging session.
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 border border-[#DDE5DC] space-y-1">
              <div className="text-xs font-bold text-[#124B3A]">2. Repeat Non-Mydriatic Scan</div>
              <div className="text-[11px] text-[#65736B]">
                A second scan will be captured to resolve optical border artifacts.
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 border border-[#DDE5DC] space-y-1">
              <div className="text-xs font-bold text-[#124B3A]">3. Zero Fee under ABDM</div>
              <div className="text-[11px] text-[#65736B]">
                All repeat screenings and tele-consultations are 100% free under Ayushman Bharat.
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DDE5DC]">
            <span className="text-xs text-[#65736B]">
              Questions? Call CHC Eye Desk: <strong>+91 20 2722 1234</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowSosModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E76F51] text-white hover:bg-[#d65f42] transition-all flex items-center gap-1.5"
            >
              <PhoneCall size={13} />
              <span>Emergency Eye Helpline</span>
            </button>
          </div>
        </div>
      ) : !isVerified ? (
        /* ─── AWAITING DOCTOR VERIFICATION CARD ─── */
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#DDE5DC] shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E9A23B]/15 border border-[#E9A23B]/30 flex items-center justify-center text-[#8A5612] shrink-0 font-bold">
              <Clock size={24} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#E9A23B]/15 text-[#8A5612] border border-[#E9A23B]/30 text-xs font-bold uppercase tracking-wider">
                Verification Pending • Step 3 of 4
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
                Screening Completed — Awaiting Doctor Verification
              </h2>
              <p className="text-xs sm:text-sm text-[#526058] leading-relaxed max-w-3xl">
                Your point-of-care retinal scan has been successfully captured and processed through our clinical AI pipeline. It has been forwarded to our verifying ophthalmologist, <strong>Dr. Arvind Natarajan</strong>. Once certified, your complete diagnostic findings, interactive visual explanation, trilingual voice assistant, and treatment plan will appear here.
              </p>
            </div>
          </div>

          {/* 4-Step Verification Status Tracker */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#1F7A5A]/10 border border-[#1F7A5A]/30">
              <div className="flex items-center justify-between text-[#1F7A5A] font-bold text-xs mb-1">
                <span>01. Optics Capture</span>
                <CheckCircle2 size={14} />
              </div>
              <div className="text-[11px] text-[#526058]">50° Non-Mydriatic Fundus Image Captured</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1F7A5A]/10 border border-[#1F7A5A]/30">
              <div className="flex items-center justify-between text-[#1F7A5A] font-bold text-xs mb-1">
                <span>02. AI Pipeline</span>
                <CheckCircle2 size={14} />
              </div>
              <div className="text-[11px] text-[#526058]">11 Core Modules & ETDRS Rules Computed</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF4ED] border border-[#E9A23B] ring-2 ring-[#E9A23B]/30">
              <div className="flex items-center justify-between text-[#8A5612] font-bold text-xs mb-1">
                <span>03. Doctor Review</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E9A23B] animate-pulse" />
              </div>
              <div className="text-[11px] text-[#8A5612] font-medium">In Queue: Dr. Arvind Natarajan (Tele-OPD)</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] opacity-70">
              <div className="flex items-center justify-between text-[#65736B] font-bold text-xs mb-1">
                <span>04. Report Released</span>
                <Clock size={14} />
              </div>
              <div className="text-[11px] text-[#65736B]">Trilingual Voice & ABHA Care Plan</div>
            </div>
          </div>

          {/* Quick Doctor Demo Switcher Shortcut for Demo Evaluator */}
          <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Stethoscope size={18} className="text-[#1F7A5A] shrink-0" />
              <div className="text-xs text-[#526058]">
                <strong className="text-[#124B3A]">Demonstration Mode:</strong> Switch to the <strong>Doctor Demo Login</strong> to review and verify this report:
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await loginAsDemo('doctor');
                navigate('/dashboard/doctor');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#124B3A] hover:bg-[#1F7A5A] text-white transition-all flex items-center gap-1.5 shrink-0 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 size={14} />
              <span>Switch to Doctor Demo to Verify</span>
            </button>
          </div>
        </div>
      ) : (
        /* ─── DOCTOR VERIFIED RESULT: VOICE ASSISTANT + VERIFIED REPORT CARD ─── */
        <>
          {/* ─── VOICE-OVER AGENT HERO BANNER (Section 28) ─── */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#124B3A] via-[#17221C] to-[#124B3A] text-white shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-[#E9A23B]/15 blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#E9A23B] backdrop-blur-md mb-2">
                  <Sparkles size={13} />
                  <span>AI Trilingual Voice-Over Assistant</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  🎙 Listen to Your Screening Report
                </h2>
                <p className="text-xs text-white/80 max-w-xl mt-1">
                  Hear an audio explanation of your eye screening result, doctor recommendations, and next steps in your native language.
                </p>
              </div>

              {/* Trilingual Voice Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { code: 'en' as LanguageCode, label: 'English' },
                  { code: 'gu' as LanguageCode, label: 'ગુજરાતી' },
                  { code: 'hi' as LanguageCode, label: 'हिन्दी' },
                ].map(lang => {
                  const isPlayingThis = isSpeakingVoice && voiceLangActive === lang.code;

                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleToggleVoice(lang.code)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                        isPlayingThis
                          ? 'bg-[#E9A23B] text-[#17221C] shadow-lg scale-105'
                          : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                      }`}
                    >
                      {isPlayingThis ? (
                        <>
                          <Square size={13} className="fill-current" />
                          <span>Stop {lang.label}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={14} />
                          <span>Play {lang.label}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice Wave Animation & Transcript Display */}
            {isSpeakingVoice && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 border-t border-white/15 space-y-2 relative z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[4, 12, 8, 16, 10, 14, 6, 12, 16, 8].map((h, i) => (
                      <motion.span
                        key={i}
                        animate={{ height: [4, h * 1.5, 4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.08 }}
                        className="w-1 rounded-full bg-[#E9A23B]"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#E9A23B]">
                    Speaking ({voiceLangActive.toUpperCase()})...
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white/90 italic leading-relaxed">
                  "{spokenTranscript}"
                </div>
              </motion.div>
            )}
          </div>

          {/* ─── VERIFIED REPORT CARD (Section 26) ─── */}
          <div className="bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1F7A5A]/15 text-[#1F7A5A] border border-[#1F7A5A]/30 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Doctor Verified Report
                  </span>
                  <span className="text-xs text-[#65736B]">Date: {latestReport.date}</span>
                  <span className="text-xs text-[#65736B] font-mono">• Exam ID: {latestReport.id}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#17221C]">
                  Your Retinal Screening Result
                </h2>
                <p className="text-xs text-[#65736B]">
                  Reviewed & officially certified by{' '}
                <strong className="text-[#124B3A]">
                  {latestReport.doctorReview?.verifiedBy || 'Dr. Arvind Natarajan, MS (Ophthalmology)'}
                </strong>
                .
              </p>
            </div>

            {/* Result Badge */}
            <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-[#DDE5DC] text-left sm:text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#65736B] block">
                Condition Stage
              </span>
              <span className="text-xl font-black text-[#124B3A]">
                {latestReport.aiResult.drCategory}
              </span>
              <span className="text-xs text-[#E76F51] font-bold block mt-0.5">
                {latestReport.aiResult.riskLevel} Clinical Priority
              </span>
            </div>
          </div>

          {/* ─── VISUAL EXPLANATION & INTERACTIVE LESION EXPLORER (Section 27) ─── */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#124B3A] flex items-center gap-2">
                  <Eye size={16} /> Visual Explanation of Your Retina
                </h3>
                <p className="text-xs text-[#65736B]">
                  Click on any highlighted marker on your retina to see what it means in plain language.
                </p>
              </div>

              {/* Toggle Buttons: Original vs Highlighted vs Split */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center p-1 bg-[#F8F6EF] rounded-xl border border-[#DDE5DC]">
                  <button
                    type="button"
                    onClick={() => setActiveVisualMode('original')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeVisualMode === 'original'
                        ? 'bg-[#124B3A] text-white shadow-xs'
                        : 'text-[#65736B] hover:text-[#17221C]'
                    }`}
                  >
                    Natural Fundus
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveVisualMode('highlighted')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeVisualMode === 'highlighted'
                        ? 'bg-[#124B3A] text-white shadow-xs'
                        : 'text-[#65736B] hover:text-[#17221C]'
                    }`}
                  >
                    AI Attention Overlaid
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveVisualMode('split')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeVisualMode === 'split'
                        ? 'bg-[#124B3A] text-white shadow-xs'
                        : 'text-[#65736B] hover:text-[#17221C]'
                    }`}
                  >
                    Side-by-Side
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 p-1 bg-[#F8F6EF] rounded-xl border border-[#DDE5DC]">
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                      zoomLevel === 1 ? 'bg-[#124B3A] text-white' : 'text-[#65736B] hover:text-[#17221C]'
                    }`}
                    title="Normal 1x"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1.4)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                      zoomLevel === 1.4 ? 'bg-[#124B3A] text-white' : 'text-[#65736B] hover:text-[#17221C]'
                    }`}
                    title="Enlarge 1.4x"
                  >
                    <ZoomIn size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Canvas Display */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#06150F] border border-[#124B3A]/40 flex flex-col items-center justify-center relative overflow-hidden">
              {activeVisualMode === 'split' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                  {/* Left: Original */}
                  <div className="flex flex-col items-center">
                    <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-full overflow-hidden border-2 border-white/20 relative shadow-lg">
                      <img
                        src={patientRetinalImg}
                        alt="Patient Retina Natural"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="mt-2 text-[11px] font-mono text-white/70">1. Natural Fundus Scan</span>
                  </div>

                  {/* Right: AI Heatmap */}
                  <div className="flex flex-col items-center">
                    <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-full overflow-hidden border-2 border-[#1F7A5A] relative shadow-lg">
                      <img
                        src={patientRetinalImg}
                        alt="Patient Retina AI Overlay"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#1F7A5A]/30 via-transparent to-[#E9A23B]/35 pointer-events-none" />
                      <div className="absolute top-[38%] left-[46%] w-5 h-5 rounded-full border-2 border-[#E76F51] bg-[#E76F51]/30 animate-pulse" />
                      <div className="absolute top-[52%] left-[62%] w-6 h-6 rounded-full border-2 border-[#E9A23B] bg-[#E9A23B]/30" />
                    </div>
                    <span className="mt-2 text-[11px] font-mono text-[#E9A23B]">2. AI Diagnostic Heatmap</span>
                  </div>
                </div>
              ) : (
                <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-2 border-[#1F7A5A]/50 shadow-2xl relative">
                  <motion.img
                    animate={{ scale: zoomLevel }}
                    transition={{ type: 'spring', damping: 20 }}
                    src={patientRetinalImg}
                    alt="Patient Retina"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlaid markers when highlighted mode is on */}
                  {activeVisualMode === 'highlighted' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#1F7A5A]/25 via-transparent to-[#E9A23B]/30 pointer-events-none" />

                      {/* Interactive Lesion Hotspots */}
                      {/* 1. Microaneurysm Hotspot */}
                      <button
                        type="button"
                        onClick={() => setSelectedLesion('microaneurysm')}
                        className={`absolute top-[38%] left-[46%] w-6 h-6 rounded-full border-2 border-[#E76F51] bg-[#E76F51]/30 flex items-center justify-center transition-all ${
                          selectedLesion === 'microaneurysm' ? 'ring-4 ring-[#E76F51] scale-125' : 'hover:scale-110 animate-pulse'
                        }`}
                        title="Click to learn about Microaneurysms"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#E76F51]" />
                      </button>

                      {/* 2. Hard Exudate Hotspot */}
                      <button
                        type="button"
                        onClick={() => setSelectedLesion('exudate')}
                        className={`absolute top-[52%] left-[62%] w-7 h-7 rounded-full border-2 border-[#E9A23B] bg-[#E9A23B]/30 flex items-center justify-center transition-all ${
                          selectedLesion === 'exudate' ? 'ring-4 ring-[#E9A23B] scale-125' : 'hover:scale-110'
                        }`}
                        title="Click to learn about Hard Exudates"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#E9A23B]" />
                      </button>

                      {/* 3. Central Macula Hotspot */}
                      <button
                        type="button"
                        onClick={() => setSelectedLesion('macula')}
                        className={`absolute top-[48%] left-[34%] w-6 h-6 rounded-full border border-[#1F7A5A] bg-[#1F7A5A]/30 flex items-center justify-center transition-all ${
                          selectedLesion === 'macula' ? 'ring-4 ring-[#1F7A5A] scale-125' : 'hover:scale-110'
                        }`}
                        title="Click to check Central Macular Zone"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-black/85 text-[10px] text-white font-mono">
                    {activeVisualMode === 'original' ? 'Natural Fundus View' : 'AI Attention Overlaid (Tap Markers)'}
                  </div>
                </div>
              )}

              {/* Explanatory Interactive Hotspot Legend / Box */}
              <div className="mt-4 w-full max-w-xl">
                {selectedLesion === 'microaneurysm' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-[#E76F51]/15 border border-[#E76F51]/40 text-white flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#E76F51] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#E76F51]" />
                        Microaneurysm Detected (Red Ring)
                      </div>
                      <div className="text-[11px] text-white/90 mt-1 leading-relaxed">
                        Tiny outpouchings in the fine retinal blood vessels caused by high blood sugar. These are harmless early signs and can stabilize with good glycemic control.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedLesion(null)}
                      className="text-white/60 hover:text-white text-xs p-1"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}

                {selectedLesion === 'exudate' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-[#E9A23B]/15 border border-[#E9A23B]/40 text-white flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#E9A23B] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#E9A23B]" />
                        Hard Exudates (Yellow Ring)
                      </div>
                      <div className="text-[11px] text-white/90 mt-1 leading-relaxed">
                        Small protein and lipid deposits left behind where leaky blood vessels occurred. They do not affect your vision unless they reach the center of your eye.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedLesion(null)}
                      className="text-white/60 hover:text-white text-xs p-1"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}

                {selectedLesion === 'macula' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-[#1F7A5A]/20 border border-[#1F7A5A]/50 text-white flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#1F7A5A] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
                        Fovea & Central Vision (Green Ring)
                      </div>
                      <div className="text-[11px] text-white/90 mt-1 leading-relaxed">
                        Your foveal center is clear of swelling or fluid. This means your sharp reading vision is completely safe right now.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedLesion(null)}
                      className="text-white/60 hover:text-white text-xs p-1"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}

                {!selectedLesion && (
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/80">
                    <button
                      type="button"
                      onClick={() => setSelectedLesion('microaneurysm')}
                      className="flex items-center gap-1.5 hover:underline"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E76F51]" />
                      <span>🔴 Microaneurysms</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLesion('exudate')}
                      className="flex items-center gap-1.5 hover:underline"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E9A23B]" />
                      <span>🟡 Hard Exudates</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLesion('macula')}
                      className="flex items-center gap-1.5 hover:underline"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A5A]" />
                      <span>🟢 Safe Macular Zone</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Important Findings & Doctor's Notes (Section 26) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#F8F6EF]/80 border border-[#DDE5DC] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#124B3A] flex items-center gap-1.5">
                <FileText size={14} /> Important Clinical Findings
              </h4>
              <div className="text-xs space-y-2 text-[#17221C]">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#DDE5DC]/60">
                  <span className="text-[#65736B]">Diabetic Retinopathy Stage:</span>
                  <span className="font-bold text-[#124B3A]">{latestReport.aiResult.drCategory}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-[#DDE5DC]/60">
                  <span className="text-[#65736B]">Macular Edema Status:</span>
                  <span className="font-bold text-[#1F7A5A]">DME Absent (Center Clear)</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-[#DDE5DC]/60">
                  <span className="text-[#65736B]">Notable Vascular Signs:</span>
                  <span className="font-bold text-[#17221C]">Circinate hard exudates near temporal arcade</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#65736B]">Scan Diagnostic Quality:</span>
                  <span className="font-bold text-[#1F7A5A]">Grade A ({latestReport.imageQuality.score}/100)</span>
                </div>
              </div>
            </div>

            {/* Doctor's Verified Stamp Card */}
            <div className="p-5 rounded-2xl bg-[#FAF4ED] border-2 border-[#124B3A]/20 space-y-3 relative overflow-hidden">
              {/* Official Watermark */}
              <div className="absolute -bottom-4 -right-4 text-[#124B3A]/10 pointer-events-none">
                <ShieldCheck size={110} />
              </div>

              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#124B3A] flex items-center gap-1.5">
                  <Stethoscope size={14} /> Doctor's Verified Clinical Notes
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#1F7A5A] bg-[#1F7A5A]/15 font-bold flex items-center gap-1">
                  <CheckCircle2 size={11} /> Digitally Signed
                </span>
              </div>

              <p className="text-xs text-[#17221C] italic leading-relaxed bg-white/70 p-3 rounded-xl border border-[#DDE5DC]">
                "{latestReport.doctorReview?.doctorComments ||
                  'Confirmed Grade 2 Moderate NPDR. Regular glycemic check and 30-day tele-followup advised.'}"
              </p>

              <div className="pt-1 flex items-center justify-between text-[11px] text-[#65736B]">
                <div>
                  <strong className="text-[#124B3A]">
                    {latestReport.doctorReview?.verifiedBy || 'Dr. Arvind Natarajan'}
                  </strong>{' '}
                  ({latestReport.doctorReview?.qualification || 'MS Ophthalmology'})
                  <div className="text-[10px] font-mono">Reg No: MCI/2012/04812 • Tele-Ophthalmology Network</div>
                </div>
                <span className="text-[10px] font-mono text-[#1F7A5A] font-bold">20-SEP-2026</span>
              </div>
            </div>
          </div>

          {/* ─── YOUR CARE PLAN & INTERACTIVE ACTIONS (Section 29) ─── */}
          <div className="p-6 rounded-3xl border-2 border-[#124B3A]/20 bg-[#FAF4ED]/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HeartPulse size={20} className="text-[#124B3A]" />
                <div>
                  <h3 className="text-sm font-black text-[#124B3A] uppercase tracking-wider">
                    YOUR PERSONALIZED CARE PLAN
                  </h3>
                  <span className="text-xs text-[#65736B]">Actions recommended by your ophthalmologist</span>
                </div>
              </div>

              {/* SMS Reminder Trigger */}
              <button
                type="button"
                onClick={handleScheduleSms}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  smsReminderScheduled
                    ? 'bg-[#1F7A5A] text-white'
                    : 'bg-[#124B3A] text-white hover:bg-[#1F7A5A]'
                }`}
              >
                <Bell size={13} />
                <span>{smsReminderScheduled ? '✓ SMS Reminder Active' : 'Schedule SMS Reminder'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-white border border-[#DDE5DC] shadow-xs">
                <span className="text-[10px] font-mono font-bold uppercase text-[#65736B] block">
                  Recommended Next Step
                </span>
                <p className="text-xs font-bold text-[#17221C] mt-1.5 leading-snug">
                  {latestReport.carePlan.recommendedNextStep}
                </p>
                <div className="mt-2 text-[10px] text-[#1F7A5A] font-semibold">
                  ✓ Tele-consultation approved
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#DDE5DC] shadow-xs">
                <span className="text-[10px] font-mono font-bold uppercase text-[#65736B] block">
                  Referral Center
                </span>
                <p className="text-xs font-bold text-[#124B3A] mt-1.5 leading-snug">
                  {latestReport.carePlan.referralInformation}
                </p>
                <div className="mt-2 text-[10px] text-[#65736B]">
                  Distance: 14 km • Free under PMJAY
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#DDE5DC] shadow-xs">
                <span className="text-[10px] font-mono font-bold uppercase text-[#65736B] block">
                  Follow-up Schedule
                </span>
                <p className="text-xs font-black text-[#E76F51] mt-1.5 leading-snug">
                  {latestReport.carePlan.followUpDate}
                </p>
                <div className="mt-2 text-[10px] text-[#8A5612] font-semibold">
                  30-Day Checkup Recommended
                </div>
              </div>
            </div>

            {/* Important Reminders */}
            <div className="p-4 rounded-2xl bg-white border border-[#DDE5DC] space-y-2">
              <span className="text-xs font-bold text-[#17221C] flex items-center gap-1.5">
                <Info size={14} className="text-[#E9A23B]" /> Important Patient Guidelines:
              </span>
              <ul className="text-xs text-[#65736B] space-y-1.5 list-disc pl-5">
                {latestReport.carePlan.importantReminders.map((rem, i) => (
                  <li key={i}>{rem}</li>
                ))}
                <li>Maintain strict glycemic control: Fasting blood sugar &lt; 110 mg/dL, HbA1c &lt; 7.0%.</li>
                <li>Report any sudden blurred vision, floating spots, or dark shadows immediately.</li>
              </ul>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#DDE5DC]">
              <div className="text-xs text-[#65736B]">
                Have questions about your report? Speak with CHC Community Health Officer or ASHA representative.
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/reports"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#124B3A] text-white hover:bg-[#1F7A5A] transition-all flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>View Printable Diagnostic Docket</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* ─── EMERGENCY OPHTHALMIC SOS MODAL ─── */}
      <AnimatePresence>
        {showSosModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border-2 border-[#E76F51] shadow-2xl max-w-md w-full p-6 space-y-4 relative"
            >
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F8F6EF] text-[#65736B]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 text-[#E76F51]">
                <div className="w-10 h-10 rounded-2xl bg-[#E76F51]/15 flex items-center justify-center font-bold">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#17221C]">Emergency Ophthalmic Assistance</h3>
                  <p className="text-xs text-[#65736B]">Instant emergency contacts for sudden vision issues</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF4ED] border border-[#E76F51]/20 text-xs text-[#17221C] space-y-1">
                <strong>Warning Signs Requiring Urgent Care:</strong>
                <ul className="list-disc pl-4 text-[#65736B] space-y-0.5 text-[11px]">
                  <li>Sudden painless loss of vision in one eye</li>
                  <li>Sudden shower of dark floaters or flashes of light</li>
                  <li>Dark curtain or shadow spreading over your field of vision</li>
                </ul>
              </div>

              <div className="space-y-2">
                <a
                  href="tel:108"
                  className="w-full p-3 rounded-2xl bg-[#E76F51] text-white font-bold text-xs flex items-center justify-between hover:bg-[#d65f42] transition-all"
                >
                  <span className="flex items-center gap-2">
                    <PhoneCall size={15} /> 108 Free National Ambulance Service
                  </span>
                  <span className="font-mono">CALL 108</span>
                </a>

                <a
                  href="tel:1800114477"
                  className="w-full p-3 rounded-2xl bg-[#124B3A] text-white font-bold text-xs flex items-center justify-between hover:bg-[#1F7A5A] transition-all"
                >
                  <span className="flex items-center gap-2">
                    <PhoneCall size={15} /> National Eye Care Helpline (NPCBVI)
                  </span>
                  <span className="font-mono">1800-11-4477</span>
                </a>

                <a
                  href="tel:+912027221234"
                  className="w-full p-3 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] text-[#17221C] font-bold text-xs flex items-center justify-between hover:bg-white transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Building2 size={15} className="text-[#1F7A5A]" /> Shirur CHC Eye Clinic Desk
                  </span>
                  <span className="font-mono text-xs text-[#124B3A]">+91 20 2722 1234</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="w-full py-2.5 rounded-xl border border-[#DDE5DC] text-xs font-bold text-[#65736B] hover:bg-[#F8F6EF]"
              >
                Close Emergency Information
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
