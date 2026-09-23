import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { usePatientWorkflow, Patient, NewPatientInput } from '../../context/PatientWorkflowContext';
import { useRetinaData, createDefaultFundusDataUrl } from '../../context/RetinaContext';
import {
  Building2,
  UserPlus,
  Users,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Upload,
  Camera,
  RotateCcw,
  Sparkles,
  Send,
  FileText,
  Clock,
  ChevronRight,
  ShieldCheck,
  Activity,
  Check,
  X,
  Search,
  ExternalLink,
} from 'lucide-react';

export const HospitalDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    patients,
    activePatient,
    setActivePatientId,
    registerPatient,
    qualityCheck,
    isCheckingQuality,
    runQualityCheck,
    resetQualityCheck,
    isPipelineRunning,
    pipelineProgress,
    pipelineStage,
    pipelineStageName,
    currentScreening,
    run11ModulePipeline,
    sendToDoctor,
    notifications,
    dismissNotification,
  } = usePatientWorkflow();

  const { setUploadedImage, runSequentialPipeline } = useRetinaData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active view inside Hospital Workstation:
  // 'list' | 'register' | 'profile' | 'acquisition' | 'quality' | 'processing' | 'result'
  const [currentView, setCurrentView] = useState<'list' | 'profile' | 'acquisition' | 'quality' | 'processing' | 'result'>('list');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast / feedback states
  const [registeredToast, setRegisteredToast] = useState(false);
  const [sentToDoctorToast, setSentToDoctorToast] = useState(false);

  // Retinal Image acquisition state
  const [selectedImagePreset, setSelectedImagePreset] = useState<'normal' | 'npdr' | 'severe'>('npdr');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(createDefaultFundusDataUrl('npdr'));
  const [selectedDevice, setSelectedDevice] = useState<'Fundus Camera' | 'Smartphone Fundus Adapter' | 'Retinal Imaging Device'>('Fundus Camera');
  const [forceQualityOutcome, setForceQualityOutcome] = useState<'GOOD' | 'POOR'>('GOOD');

  // Register New Patient Form State (Section 7)
  const [newPatient, setNewPatient] = useState<NewPatientInput>({
    name: '',
    age: 52,
    gender: 'Male',
    mobile: '+91 98231 45678',
    village: 'Example Village',
    talukaBlock: 'Shirur Block',
    district: 'Pune District',
    state: 'Maharashtra',
    pinCode: '412210',
    bloodGroup: 'B+',
    diabetesStatus: 'Yes',
    diabetesDuration: '5 Years',
    emergencyContactName: 'Suman Patel',
    emergencyContactNumber: '+91 98231 99887',
    languagePreference: 'en',
    password: '',
    confirmPassword: '',
    termsAccepted: true,
    privacyAccepted: true,
  });

  // Calculate statistics (Section 6)
  const totalRegistered = patients.length;
  const screeningsCompleted = patients.filter(p => p.latestScreening !== undefined).length;
  const reportsAwaitingReview = patients.filter(
    p => p.latestScreening && (p.latestScreening.reportStatus === 'Awaiting Doctor Review' || p.latestScreening.reportStatus === 'Awaiting Doctor Verification')
  ).length;
  const verifiedReports = patients.filter(
    p => p.latestScreening && p.latestScreening.reportStatus === 'Doctor Verified'
  ).length;
  const referralsCount = patients.filter(
    p => p.latestScreening && p.latestScreening.aiResult.gradeIndex >= 2
  ).length;
  const reassessmentsCount = patients.filter(
    p => p.status === 'Requires Reassessment' || p.latestScreening?.reportStatus === 'Requires Reassessment'
  ).length;

  const hospitalNotifications = notifications.filter(
    n => n.targetRole === 'hospital' || n.targetRole === 'healthcare-worker'
  );

  // Interactive filter state for patients
  const [statusFilter, setStatusFilter] = useState<'all' | 'unscreened' | 'awaiting_review' | 'verified' | 'referrals' | 'reassessment'>('all');

  // Filtered patients for list
  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'unscreened') return !p.latestScreening;
    if (statusFilter === 'awaiting_review')
      return (
        p.latestScreening &&
        (p.latestScreening.reportStatus === 'Awaiting Doctor Review' ||
          p.latestScreening.reportStatus === 'Awaiting Doctor Verification')
      );
    if (statusFilter === 'verified')
      return p.latestScreening?.reportStatus === 'Doctor Verified';
    if (statusFilter === 'referrals')
      return p.latestScreening && p.latestScreening.aiResult.gradeIndex >= 2;
    if (statusFilter === 'reassessment')
      return (
        p.status === 'Requires Reassessment' ||
        p.latestScreening?.reportStatus === 'Requires Reassessment'
      );

    return true;
  });

  // Quick 1-Click Demo Pre-Fill
  const quickFillSamplePatient = () => {
    setNewPatient({
      name: 'Geeta Bai Shinde',
      age: 58,
      gender: 'Female',
      mobile: '+91 98224 81920',
      village: 'Koregaon Bhima',
      talukaBlock: 'Shirur Block',
      district: 'Pune District',
      state: 'Maharashtra',
      pinCode: '412216',
      bloodGroup: 'O+',
      diabetesStatus: 'Yes',
      diabetesDuration: '6 Years',
      emergencyContactName: 'Kashinath Shinde (Son)',
      emergencyContactNumber: '+91 98224 81921',
      languagePreference: 'gu',
      password: 'password123',
      confirmPassword: 'password123',
      termsAccepted: true,
      privacyAccepted: true,
    });
  };

  // Handle Register Patient Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name.trim() || !newPatient.mobile.trim()) return;

    const created = registerPatient(newPatient);
    setActivePatientId(created.id);
    setShowRegisterModal(false);
    setRegisteredToast(true);
    setTimeout(() => setRegisteredToast(false), 4000);

    // Reset form
    setNewPatient({
      name: '',
      age: 45,
      gender: 'Female',
      mobile: '',
      village: '',
      talukaBlock: '',
      district: 'Pune District',
      state: 'Maharashtra',
      pinCode: '',
      bloodGroup: 'B+',
      diabetesStatus: 'Yes',
      diabetesDuration: '2 Years',
      emergencyContactName: '',
      emergencyContactNumber: '',
      languagePreference: 'en',
      password: '',
      confirmPassword: '',
      termsAccepted: true,
      privacyAccepted: true,
    });
  };

  // Open Patient Profile (Section 9)
  const handleOpenPatient = (patient: Patient) => {
    setActivePatientId(patient.id);
    setCurrentView('profile');
  };

  // Handle file upload from computer (feeds into all 11 modules, doctor & patient dashboards)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setImagePreviewUrl(dataUrl);
        // Propagate directly to all 11 modules and screening cockpit via RetinaContext
        setUploadedImage(dataUrl, {
          fileName: file.name,
          resolution: '2048 x 1536 (HD)',
          imageSize: `${Math.round(file.size / 1024)} KB`,
          source: 'Uploaded Image',
          format: file.type || 'image/jpeg',
          timestamp: new Date().toLocaleTimeString(),
          deviceTier: selectedDevice,
          pupilDilation: 'Non-Mydriatic (Natural)',
        });
        resetQualityCheck();
        setCurrentView('acquisition');
      }
    };
    reader.readAsDataURL(file);
  };

  // Start Retinal Image Acquisition (Section 10)
  const handleStartAcquisition = () => {
    resetQualityCheck();
    setCurrentView('acquisition');
  };

  // Select preset scan and sync to RetinaContext
  const handleSelectPreset = (preset: 'normal' | 'npdr' | 'severe') => {
    setSelectedImagePreset(preset);
    const dataUrl = createDefaultFundusDataUrl(preset);
    setImagePreviewUrl(dataUrl);
    setUploadedImage(dataUrl, {
      fileName: `${preset}-fundus.jpg`,
      resolution: '2048 x 1536 (HD)',
      imageSize: '1.4 MB',
      source: 'Demo Preset',
      format: 'image/jpeg',
      timestamp: new Date().toLocaleTimeString(),
      deviceTier: selectedDevice,
      pupilDilation: 'Non-Mydriatic (Natural)',
    });
  };

  // Trigger Image Quality Assessment (Section 11) & Run Multi-Module Pipeline
  const handleRunQualityAssessment = async () => {
    setCurrentView('quality');
    const result = await runQualityCheck(imagePreviewUrl, forceQualityOutcome);

    // If GOOD quality, automatically start 11-module pipeline (Section 13)
    if (result.overall === 'GOOD') {
      setTimeout(async () => {
        setCurrentView('processing');
        if (activePatient) {
          // Updates patient record, doctor dashboard queue, and patient portal
          await run11ModulePipeline(activePatient.id, imagePreviewUrl);
          // Updates all 11 AI architecture modules and screening cockpit
          await runSequentialPipeline();
          setCurrentView('result');
        }
      }, 1400);
    }
  };

  // Retake Image (Section 12)
  const handleRetakeImage = () => {
    resetQualityCheck();
    setForceQualityOutcome('GOOD'); // Reset so user can proceed
    setCurrentView('acquisition');
  };

  // Send Report to Doctor (Section 18)
  const handleSendToDoctor = () => {
    if (activePatient?.latestScreening) {
      sendToDoctor(activePatient.latestScreening.id);
      setSentToDoctorToast(true);
      setTimeout(() => setSentToDoctorToast(false), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 select-none">
      {/* Hidden File Input for Retinal Image Acquisition */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileUpload}
        className="hidden"
      />

      {/* ─── TOAST NOTIFICATIONS ─── */}
      <AnimatePresence>
        {registeredToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#124B3A] text-white shadow-2xl border border-[#1F7A5A] flex items-center gap-3 text-xs sm:text-sm font-semibold"
          >
            <CheckCircle2 size={18} className="text-[#1F7A5A]" />
            <span>✓ Patient Registered Successfully</span>
          </motion.div>
        )}
        {sentToDoctorToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#124B3A] text-white shadow-2xl border border-[#1F7A5A] flex items-center gap-3 text-xs sm:text-sm font-semibold"
          >
            <CheckCircle2 size={18} className="text-[#1F7A5A]" />
            <span>✓ Report Sent for Doctor Verification</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── OPERATIONAL HEADER (Section 6) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A5A]" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              Hospital / Rural Health Center Workstation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            Health Center Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            AI-assisted retinal screening and patient care
          </p>
        </div>

        {/* Main Actions: Register New Patient & Access Existing Patient */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-xs font-bold transition-all shadow-md shadow-[#124B3A]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus size={15} />
            <span>+ Register New Patient</span>
          </button>

          <button
            onClick={() => setCurrentView('list')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              currentView === 'list'
                ? 'bg-[#1F7A5A]/10 text-[#124B3A] border-[#1F7A5A]'
                : 'bg-white text-[#65736B] border-[#DDE5DC] hover:bg-[#FAF4ED]'
            }`}
          >
            <Users size={15} />
            <span>Access Existing Patient</span>
          </button>
        </div>
      </div>

      {/* ─── URGENT DOCTOR ALERTS & REASSESSMENT BANNER ─── */}
      {hospitalNotifications.length > 0 && (
        <div className="space-y-2">
          {hospitalNotifications.map(notif => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-[#FAF4ED] border-2 border-[#E76F51]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#17221C]"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E76F51] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#E76F51] uppercase tracking-wider">
                      {notif.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#65736B]">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#526058] mt-0.5 font-medium leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    const p = patients.find(pt => notif.message.includes(pt.name));
                    if (p) {
                      setActivePatientId(p.id);
                      setCurrentView('acquisition');
                    } else {
                      setCurrentView('list');
                      setStatusFilter('reassessment');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#E76F51] hover:bg-[#d65f42] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  <Camera size={13} />
                  <span>Repeat Screening</span>
                </button>
                <button
                  type="button"
                  onClick={() => dismissNotification(notif.id)}
                  className="px-2.5 py-1.5 rounded-xl border border-[#DDE5DC] hover:bg-white text-xs font-semibold text-[#65736B] transition-all"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── DASHBOARD STATISTICS (Interactive KPI Cards) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div
          onClick={() => { setStatusFilter('all'); setCurrentView('list'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all' && currentView === 'list'
              ? 'bg-[#124B3A]/10 border-[#124B3A] shadow-sm ring-2 ring-[#124B3A]/20'
              : 'bg-white border-[#DDE5DC] hover:bg-[#FAF4ED] shadow-xs'
          }`}
          title="Click to view all registered patients"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#65736B] block">
            Registered Patients
          </span>
          <span className="text-2xl font-black text-[#124B3A] mt-1 block">
            {totalRegistered}
          </span>
          <span className="text-[10px] text-[#65736B] mt-0.5 block">Total In Center</span>
        </div>

        <div
          onClick={() => { setStatusFilter('unscreened'); setCurrentView('list'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'unscreened' && currentView === 'list'
              ? 'bg-[#1F7A5A]/15 border-[#1F7A5A] shadow-sm ring-2 ring-[#1F7A5A]/20'
              : 'bg-white border-[#DDE5DC] hover:bg-[#FAF4ED] shadow-xs'
          }`}
          title="Click to view unscreened patients"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F7A5A] block">
            Screenings Completed
          </span>
          <span className="text-2xl font-black text-[#1F7A5A] mt-1 block">
            {screeningsCompleted}
          </span>
          <span className="text-[10px] text-[#1F7A5A] mt-0.5 block">AI Scored</span>
        </div>

        <div
          onClick={() => { setStatusFilter('awaiting_review'); setCurrentView('list'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'awaiting_review' && currentView === 'list'
              ? 'bg-[#E9A23B]/15 border-[#E9A23B] shadow-sm ring-2 ring-[#E9A23B]/30'
              : 'bg-white border-[#DDE5DC] hover:bg-[#FAF4ED] shadow-xs'
          }`}
          title="Click to filter reports awaiting doctor review"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A5612] block">
            Awaiting Doctor Review
          </span>
          <span className="text-2xl font-black text-[#E9A23B] mt-1 block">
            {reportsAwaitingReview}
          </span>
          <span className="text-[10px] text-[#8A5612] mt-0.5 block">Queued to Doctor</span>
        </div>

        <div
          onClick={() => { setStatusFilter('verified'); setCurrentView('list'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'verified' && currentView === 'list'
              ? 'bg-[#1F7A5A]/15 border-[#1F7A5A] shadow-sm ring-2 ring-[#1F7A5A]/20'
              : 'bg-white border-[#DDE5DC] hover:bg-[#FAF4ED] shadow-xs'
          }`}
          title="Click to filter doctor verified reports"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#124B3A] block">
            Verified Reports
          </span>
          <span className="text-2xl font-black text-[#124B3A] mt-1 block">
            {verifiedReports}
          </span>
          <span className="text-[10px] text-[#1F7A5A] mt-0.5 block">Doctor Certified</span>
        </div>

        <div
          onClick={() => { setStatusFilter('referrals'); setCurrentView('list'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            statusFilter === 'referrals' && currentView === 'list'
              ? 'bg-[#E76F51]/15 border-[#E76F51] shadow-sm ring-2 ring-[#E76F51]/30'
              : 'bg-white border-[#DDE5DC] hover:bg-[#FAF4ED] shadow-xs'
          }`}
          title="Click to filter high-grade referrals"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E76F51] block">
            Referrals
          </span>
          <span className="text-2xl font-black text-[#E76F51] mt-1 block">
            {referralsCount}
          </span>
          <span className="text-[10px] text-[#E76F51] mt-0.5 block">Grade 2+ Priority</span>
        </div>

        <div
          onClick={() => { setStatusFilter('reassessment'); setCurrentView('list'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            statusFilter === 'reassessment' && currentView === 'list'
              ? 'bg-[#E76F51]/15 border-[#E76F51] shadow-sm ring-2 ring-[#E76F51]/30'
              : 'bg-white border-[#DDE5DC] hover:bg-[#FAF4ED] shadow-xs'
          }`}
          title="Click to filter cases requiring reassessment"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E76F51] block">
            Reassessment
          </span>
          <span className="text-2xl font-black text-[#E76F51] mt-1 block">
            {reassessmentsCount}
          </span>
          <span className="text-[10px] text-[#E76F51] mt-0.5 block">Doctor Flagged</span>
        </div>
      </div>

      {/* ─── WORKSTATION ROUTING BREADCRUMB / TABS ─── */}
      {currentView !== 'list' && (
        <div className="flex items-center gap-2 text-xs font-semibold text-[#65736B] py-1 px-1">
          <button
            onClick={() => setCurrentView('list')}
            className="hover:text-[#124B3A] underline underline-offset-2"
          >
            Patients List
          </button>
          <span>/</span>
          <span className="text-[#124B3A] font-bold">
            {activePatient?.name || 'Selected Patient'}
          </span>
          <span>/</span>
          <span className="text-[#1F7A5A] capitalize">
            {currentView === 'profile'
              ? 'Patient Profile'
              : currentView === 'acquisition'
              ? 'Image Acquisition'
              : currentView === 'quality'
              ? 'Quality Assessment Gate'
              : currentView === 'processing'
              ? '11-Module AI Screening'
              : 'AI Screening Report'}
          </span>
        </div>
      )}

      {/* ─── VIEW 1: PATIENTS LIST (Section 32) ─── */}
      {currentView === 'list' && (
        <div className="bg-white rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#17221C]">
                Registered Screening Queue
              </h2>
              <p className="text-xs text-[#65736B]">
                Frontline patients registered for diabetic retinopathy screening.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="text-[#65736B] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search patient or village..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
              />
            </div>
          </div>

          {/* Interactive Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#DDE5DC]/70">
            {[
              { key: 'all', label: `All Patients (${patients.length})` },
              { key: 'unscreened', label: `Needs Screening (${patients.filter(p => !p.latestScreening).length})` },
              { key: 'awaiting_review', label: `Awaiting Doctor Review (${reportsAwaitingReview})` },
              { key: 'verified', label: `Doctor Verified (${verifiedReports})` },
              { key: 'referrals', label: `Referral Cases (${referralsCount})` },
              { key: 'reassessment', label: `⚠️ Reassessments (${reassessmentsCount})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  statusFilter === f.key
                    ? 'bg-[#124B3A] text-white shadow-xs'
                    : 'bg-[#F8F6EF] text-[#65736B] hover:bg-[#FAF4ED] border border-[#DDE5DC]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DDE5DC] text-[#65736B] font-mono uppercase text-[10px] tracking-wider bg-[#F8F6EF]/40">
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Age</th>
                  <th className="py-3 px-3">Village</th>
                  <th className="py-3 px-3">Diabetes Status</th>
                  <th className="py-3 px-3">Last Screening</th>
                  <th className="py-3 px-3">Report Status</th>
                  <th className="py-3 px-3">Doctor Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DC]/70">
                {filteredPatients.map(patient => {
                  const isVerified = patient.latestScreening?.reportStatus === 'Doctor Verified';
                  const isReassessmentCase =
                    patient.status === 'Requires Reassessment' ||
                    patient.latestScreening?.reportStatus === 'Requires Reassessment';
                  const isAwaitingReview =
                    patient.latestScreening?.reportStatus === 'Awaiting Doctor Review' ||
                    patient.latestScreening?.reportStatus === 'Awaiting Doctor Verification';

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-[#FAF4ED]/60 transition-colors group cursor-pointer"
                      onClick={() => handleOpenPatient(patient)}
                    >
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#17221C] group-hover:text-[#124B3A]">
                          {patient.name}
                        </div>
                        <div className="text-[10px] text-[#65736B] font-mono">{patient.id}</div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[#17221C]">{patient.age}</td>
                      <td className="py-3.5 px-3 text-[#65736B]">{patient.village}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-semibold text-[10px] ${
                            patient.diabetesStatus === 'Yes'
                              ? 'bg-[#E76F51]/15 text-[#E76F51]'
                              : 'bg-[#1F7A5A]/15 text-[#1F7A5A]'
                          }`}
                        >
                          Diabetes: {patient.diabetesStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[#65736B]">
                        {patient.lastScreeningDate || 'Awaiting Screening'}
                      </td>
                      <td className="py-3.5 px-3">
                        {patient.latestScreening ? (
                          <span className="font-bold text-[#124B3A]">
                            {patient.latestScreening.aiResult.drCategory}
                          </span>
                        ) : (
                          <span className="text-[#65736B] italic">Awaiting Screening</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1F7A5A]/15 text-[#1F7A5A]">
                            <CheckCircle2 size={11} />
                            <span>✓ Doctor Verified</span>
                          </span>
                        ) : isReassessmentCase ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E76F51]/15 text-[#E76F51] border border-[#E76F51]/30">
                            <AlertTriangle size={11} />
                            <span>⚠️ Reassessment</span>
                          </span>
                        ) : isAwaitingReview ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E9A23B]/15 text-[#8A5612]">
                            <Clock size={11} />
                            <span>Awaiting Review</span>
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] bg-[#F8F6EF] text-[#65736B] border border-[#DDE5DC]">
                            Unscreened
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          {isReassessmentCase ? (
                            <button
                              type="button"
                              onClick={() => {
                                setActivePatientId(patient.id);
                                handleStartAcquisition();
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-[#E76F51] hover:bg-[#d65f42] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1"
                              title="Capture repeat scan requested by doctor"
                            >
                              <RotateCcw size={12} />
                              <span>Re-Screen</span>
                            </button>
                          ) : !patient.latestScreening ? (
                            <button
                              type="button"
                              onClick={() => {
                                setActivePatientId(patient.id);
                                handleStartAcquisition();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1"
                              title="Start screening image acquisition for this patient"
                            >
                              <Camera size={12} />
                              <span>Screen</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setActivePatientId(patient.id);
                                setCurrentView('result');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#1F7A5A] hover:bg-[#124B3A] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1"
                              title="View full AI screening report"
                            >
                              <FileText size={12} />
                              <span>Report</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenPatient(patient)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#F8F6EF] hover:bg-[#FAF4ED] text-[#124B3A] font-bold text-xs border border-[#DDE5DC] transition-all"
                            title="Open patient profile"
                          >
                            Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── VIEW 2: PATIENT PROFILE (Section 9) ─── */}
      {currentView === 'profile' && activePatient && (
        <div className="bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#124B3A] text-white flex items-center justify-center text-xl font-black">
                {activePatient.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#17221C]">
                    {activePatient.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1F7A5A]/15 text-[#1F7A5A]">
                    {activePatient.status}
                  </span>
                </div>
                <p className="text-xs text-[#65736B] font-mono mt-0.5">
                  ID: {activePatient.id} • Registered {activePatient.village}
                </p>
              </div>
            </div>

            {/* Main Action: Upload Retinal Image */}
            <button
              onClick={() => {
                setCurrentView('acquisition');
                setTimeout(() => fileInputRef.current?.click(), 80);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-xs font-bold transition-all shadow-md shadow-[#124B3A]/20"
            >
              <Camera size={16} />
              <span>Upload Retinal Image</span>
            </button>
          </div>

          {/* Profile Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Section A: Patient Information */}
            <div className="p-4 rounded-2xl bg-[#F8F6EF]/60 border border-[#DDE5DC] space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#124B3A]">
                Patient Information
              </h3>
              <div className="text-xs space-y-1 text-[#17221C]">
                <div>
                  <span className="text-[#65736B]">Age:</span> <strong>{activePatient.age} Years</strong>
                </div>
                <div>
                  <span className="text-[#65736B]">Gender:</span> <strong>{activePatient.gender}</strong>
                </div>
                <div>
                  <span className="text-[#65736B]">Mobile:</span> <strong>{activePatient.mobile}</strong>
                </div>
                <div>
                  <span className="text-[#65736B]">Location:</span>{' '}
                  <strong>
                    {activePatient.village}, {activePatient.talukaBlock}, {activePatient.district}
                  </strong>
                </div>
                <div>
                  <span className="text-[#65736B]">PIN Code:</span>{' '}
                  <strong>{activePatient.pinCode}</strong>
                </div>
              </div>
            </div>

            {/* Section B: Diabetes & Medical Information */}
            <div className="p-4 rounded-2xl bg-[#F8F6EF]/60 border border-[#DDE5DC] space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#124B3A]">
                Diabetes Information
              </h3>
              <div className="text-xs space-y-1 text-[#17221C]">
                <div>
                  <span className="text-[#65736B]">Blood Group:</span>{' '}
                  <strong>{activePatient.bloodGroup}</strong>
                </div>
                <div>
                  <span className="text-[#65736B]">Diabetes Status:</span>{' '}
                  <strong className="text-[#E76F51]">
                    {activePatient.diabetesStatus === 'Yes' ? 'Diabetic (Positive)' : 'Non-Diabetic'}
                  </strong>
                </div>
                <div>
                  <span className="text-[#65736B]">Duration:</span>{' '}
                  <strong>{activePatient.diabetesDuration}</strong>
                </div>
                <div>
                  <span className="text-[#65736B]">Language:</span>{' '}
                  <strong className="uppercase">{activePatient.languagePreference}</strong>
                </div>
              </div>
            </div>

            {/* Section C: Emergency Contact */}
            <div className="p-4 rounded-2xl bg-[#F8F6EF]/60 border border-[#DDE5DC] space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#124B3A]">
                Emergency Contact
              </h3>
              <div className="text-xs space-y-1 text-[#17221C]">
                <div>
                  <span className="text-[#65736B]">Contact Person:</span>{' '}
                  <strong>{activePatient.emergencyContactName}</strong>
                </div>
                <div>
                  <span className="text-[#65736B]">Phone:</span>{' '}
                  <strong>{activePatient.emergencyContactNumber}</strong>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] text-[#1F7A5A] font-semibold block">
                    ✓ Ayushman Bharat Arogya Card Linked
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section D: Current Screening & Reports */}
          <div className="p-5 rounded-2xl border border-[#DDE5DC] bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#17221C]">Current Screening & Reports</h3>
                <p className="text-xs text-[#65736B]">
                  Diagnostic findings, quality assessment, and ophthalmologist verification status.
                </p>
              </div>
              {activePatient.latestScreening && (
                <button
                  onClick={() => setCurrentView('result')}
                  className="text-xs font-bold text-[#1F7A5A] hover:underline"
                >
                  View Full AI Report →
                </button>
              )}
            </div>

            {activePatient.latestScreening ? (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F8F6EF]/70 border border-[#DDE5DC]">
                <div className="sm:col-span-1">
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-black border border-[#124B3A]/30">
                    <img
                      src={activePatient.latestScreening.retinalImage}
                      alt="Fundus"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#65736B] block">Screening Diagnosis</span>
                      <span className="text-base font-black text-[#124B3A]">
                        {activePatient.latestScreening.aiResult.drCategory}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        activePatient.latestScreening.reportStatus === 'Doctor Verified'
                          ? 'bg-[#1F7A5A]/20 text-[#1F7A5A]'
                          : 'bg-[#E9A23B]/20 text-[#8A5612]'
                      }`}
                    >
                      {activePatient.latestScreening.reportStatus === 'Doctor Verified'
                        ? '✓ Doctor Verified'
                        : activePatient.latestScreening.reportStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                    <div>
                      <span className="text-[#65736B] block">Confidence</span>
                      <strong className="text-[#17221C]">
                        {activePatient.latestScreening.aiResult.confidence}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#65736B] block">Detected Lesions</span>
                      <strong className="text-[#17221C]">
                        {activePatient.latestScreening.aiResult.detectedLesions.hardExudates} Exudates,{' '}
                        {activePatient.latestScreening.aiResult.detectedLesions.microaneurysms} MA
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#65736B] block">Quality Gate</span>
                      <strong className="text-[#1F7A5A]">
                        ✓ {activePatient.latestScreening.imageQuality.overall} (Score {activePatient.latestScreening.imageQuality.score})
                      </strong>
                    </div>
                  </div>

                  {/* Doctor notes if verified */}
                  {activePatient.latestScreening.doctorReview && (
                    <div className="p-3 rounded-lg bg-white border border-[#DDE5DC] text-xs mt-2">
                      <span className="font-bold text-[#124B3A] block">
                        Verified by: {activePatient.latestScreening.doctorReview.verifiedBy}
                      </span>
                      <p className="text-[#65736B] mt-0.5 italic">
                        "{activePatient.latestScreening.doctorReview.doctorComments}"
                      </p>
                    </div>
                  )}

                  {/* Send to Doctor button if not yet sent or awaiting review */}
                  {activePatient.latestScreening.reportStatus === 'Awaiting Doctor Verification' && (
                    <div className="pt-2">
                      <button
                        onClick={handleSendToDoctor}
                        className="px-4 py-2 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-xs font-bold flex items-center gap-2"
                      >
                        <Send size={13} />
                        <span>Send to Doctor for Verification</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-[#F8F6EF]/50 border border-dashed border-[#DDE5DC]">
                <Camera size={28} className="mx-auto text-[#65736B] mb-2" />
                <span className="text-xs font-semibold text-[#17221C] block">
                  No retinal scan recorded yet for this patient.
                </span>
                <p className="text-[11px] text-[#65736B] mt-1">
                  Click 'Upload Retinal Image' to acquire fundus photograph and start the 11-module AI pipeline.
                </p>
                <button
                  onClick={() => {
                    setCurrentView('acquisition');
                    setTimeout(() => fileInputRef.current?.click(), 80);
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-xs font-bold flex items-center gap-2 mx-auto shadow-sm"
                >
                  <Camera size={15} />
                  <span>Upload Retinal Image Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── VIEW 3: RETINAL IMAGE ACQUISITION (Section 10) ─── */}
      {currentView === 'acquisition' && (
        <div className="bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#DDE5DC]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5A]">
                Step 1: Point-of-Care Acquisition
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#17221C] tracking-tight mt-0.5">
                Retinal Image Acquisition
              </h2>
              <p className="text-xs text-[#65736B]">
                Patient: <strong className="text-[#124B3A]">{activePatient?.name}</strong> • Supported: Fundus Camera, Smartphone Adapter, or Retinal Imaging Device.
              </p>
            </div>

            <button
              onClick={() => setCurrentView('profile')}
              className="px-3 py-1.5 rounded-xl border border-[#DDE5DC] text-xs font-bold text-[#65736B] hover:bg-[#F8F6EF]"
            >
              Cancel
            </button>
          </div>

          {/* Device Selection & Simulated Fundus Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              'Fundus Camera',
              'Smartphone Fundus Adapter',
              'Retinal Imaging Device',
            ].map(dev => (
              <button
                key={dev}
                type="button"
                onClick={() => setSelectedDevice(dev as any)}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                  selectedDevice === dev
                    ? 'border-[#1F7A5A] bg-[#1F7A5A]/10 text-[#124B3A]'
                    : 'border-[#DDE5DC] bg-[#F8F6EF]/50 text-[#65736B]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Camera size={14} className={selectedDevice === dev ? 'text-[#1F7A5A]' : 'text-[#65736B]'} />
                  <span>{dev}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Real Retinal Image File Upload Dropzone */}
          <div className="p-6 rounded-3xl bg-[#FAF4ED] border-2 border-dashed border-[#1F7A5A]/40 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#124B3A] text-white flex items-center justify-center mx-auto shadow-md">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#124B3A]">
                Upload Patient Retinal Fundus Photograph
              </h3>
              <p className="text-xs text-[#65736B] max-w-md mx-auto mt-1">
                Choose a fundus photograph from your computer, camera, or USB drive. Image directly links to all 11 modules and doctor/patient portals.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 rounded-2xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-xs font-bold transition-all shadow-md shadow-[#124B3A]/20 flex items-center gap-2"
              >
                <Camera size={16} />
                <span>Browse & Upload Retinal Image</span>
              </button>
            </div>
          </div>

          {/* Preset Clinical Fundus Cases for Demonstration */}
          <div className="p-4 rounded-2xl bg-[#F8F6EF]/60 border border-[#DDE5DC] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#124B3A]">
              <span>Or Choose SIH Calibrated Demonstration Fundus Scan:</span>
              <span className="text-[11px] text-[#65736B] font-normal">Click preset to load</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset('normal')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left ${
                  selectedImagePreset === 'normal'
                    ? 'border-[#1F7A5A] bg-white font-bold text-[#124B3A]'
                    : 'border-[#DDE5DC] text-[#65736B]'
                }`}
              >
                1. Normal Fundus (Grade 0)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('npdr')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left ${
                  selectedImagePreset === 'npdr'
                    ? 'border-[#1F7A5A] bg-white font-bold text-[#124B3A]'
                    : 'border-[#DDE5DC] text-[#65736B]'
                }`}
              >
                2. Moderate NPDR (Grade 2)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('severe')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left ${
                  selectedImagePreset === 'severe'
                    ? 'border-[#1F7A5A] bg-white font-bold text-[#124B3A]'
                    : 'border-[#DDE5DC] text-[#65736B]'
                }`}
              >
                3. Severe NPDR (Grade 3)
              </button>
            </div>
          </div>

          {/* Test Gate Option: Force POOR vs GOOD Quality to test both branches (Section 11-13) */}
          <div className="p-3 rounded-xl bg-white border border-[#DDE5DC] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#17221C]">
              Quality Gate Test Branch:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForceQualityOutcome('GOOD')}
                className={`px-3 py-1 rounded-lg font-bold text-xs ${
                  forceQualityOutcome === 'GOOD'
                    ? 'bg-[#1F7A5A] text-white'
                    : 'bg-[#F8F6EF] text-[#65736B]'
                }`}
              >
                ✓ Test Good Quality Flow
              </button>
              <button
                type="button"
                onClick={() => setForceQualityOutcome('POOR')}
                className={`px-3 py-1 rounded-lg font-bold text-xs ${
                  forceQualityOutcome === 'POOR'
                    ? 'bg-[#E76F51] text-white'
                    : 'bg-[#F8F6EF] text-[#65736B]'
                }`}
              >
                ⚠ Test Poor Quality Flow
              </button>
            </div>
          </div>

          {/* Fundus Preview Canvas */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#06150F] border border-[#124B3A]/40 relative overflow-hidden">
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-2 border-[#1F7A5A]/50 shadow-2xl relative">
              <img
                src={imagePreviewUrl}
                alt="Retinal Fundus Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border border-white/20 rounded-full pointer-events-none" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/80 text-[10px] text-white font-mono">
                {selectedDevice} • 45° Posterior Pole
              </div>
            </div>
          </div>

          {/* Analyze Quality Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleRunQualityAssessment}
              className="px-6 py-3 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-xs font-bold transition-all shadow-md shadow-[#124B3A]/20 flex items-center gap-2"
            >
              <ShieldCheck size={16} />
              <span>Analyze Image Quality</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── VIEW 4: IMAGE QUALITY ASSESSMENT (Section 11, 12, 13) ─── */}
      {currentView === 'quality' && (
        <div className="bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#DDE5DC]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5A]">
                Module 2 Quality Gate
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#17221C] tracking-tight mt-0.5">
                IMAGE QUALITY ASSESSMENT
              </h2>
              <p className="text-xs text-[#65736B]">
                Rigorous optical check: Blur, Focus, Illumination, Retina visibility, Eye positioning, Artifacts.
              </p>
            </div>
          </div>

          {isCheckingQuality ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#1F7A5A]/20 border-t-[#1F7A5A] animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-[#124B3A]">
                Analyzing image optical parameters...
              </h3>
              <p className="text-xs text-[#65736B]">
                Checking focus calibration, macular illumination, and artifact interference.
              </p>
            </div>
          ) : qualityCheck ? (
            <div className="space-y-6">
              {/* Quality Outcome Header */}
              {qualityCheck.overall === 'GOOD' ? (
                <div className="p-5 rounded-2xl bg-[#1F7A5A]/10 border border-[#1F7A5A]/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={24} className="text-[#1F7A5A]" />
                    <div>
                      <h3 className="text-sm font-black text-[#124B3A]">
                        ✓ IMAGE QUALITY ACCEPTED
                      </h3>
                      <p className="text-xs text-[#1F7A5A] mt-0.5">
                        High optical clarity. Starting RetinaFusion 360 AI Analysis automatically...
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-[#1F7A5A] text-white text-xs font-bold font-mono">
                    Score: {qualityCheck.score}/100
                  </span>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#E76F51]/10 border border-[#E76F51]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={24} className="text-[#E76F51]" />
                      <div>
                        <h3 className="text-sm font-black text-[#E76F51]">
                          ⚠ IMAGE QUALITY INSUFFICIENT
                        </h3>
                        <p className="text-xs text-[#17221C] mt-0.5">
                          The captured retinal scan does not meet diagnostic grading criteria. Retake image.
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-[#E76F51] text-white text-xs font-bold font-mono">
                      Score: {qualityCheck.score}/100
                    </span>
                  </div>

                  {/* Poor Quality Specific Reasons (Section 12) */}
                  <div className="p-4 rounded-xl bg-white border border-[#E76F51]/30">
                    <span className="text-xs font-bold text-[#E76F51] block mb-1">
                      Identified Quality Failure Reasons:
                    </span>
                    <ul className="text-xs text-[#17221C] space-y-1 list-disc pl-5">
                      {qualityCheck.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Retake Button (Blocks AI pipeline) */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleRetakeImage}
                      className="px-6 py-2.5 rounded-xl bg-[#E76F51] hover:bg-[#d65f42] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                    >
                      <RotateCcw size={14} />
                      <span>Retake Image</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Individual Optical Quality Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {qualityCheck.checks.map(c => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-[#DDE5DC] bg-[#F8F6EF]/50 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17221C]">{c.name}</span>
                      {c.status === 'passed' ? (
                        <Check size={14} className="text-[#1F7A5A]" />
                      ) : (
                        <X size={14} className="text-[#E76F51]" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[#65736B] block">{c.metric}</span>
                    <span className="text-[10px] text-[#65736B] block">{c.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ─── VIEW 5: 11-STAGE AI PIPELINE ANIMATION (Section 14 & 15) ─── */}
      {currentView === 'processing' && (
        <div className="bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1F7A5A]">
              Sequential Execution
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#124B3A] tracking-tight">
              RetinaFusion 360 AI Analysis
            </h2>
            <p className="text-xs text-[#65736B]">
              Executing the complete 11-module clinical screening pipeline.
            </p>
          </div>

          {/* Progress Bar & Stage Indicator */}
          <div className="space-y-2 max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#124B3A]">{pipelineStageName}</span>
              <span className="font-mono text-[#1F7A5A]">{pipelineProgress}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#F8F6EF] border border-[#DDE5DC] overflow-hidden p-0.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#124B3A] via-[#1F7A5A] to-[#E9A23B]"
                animate={{ width: `${pipelineProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* 11 Modules Vertical / Grid Progression (Section 15) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-w-4xl mx-auto pt-2">
            {[
              '01 Image Acquisition',
              '02 Preprocessing & Quality Gate',
              '03 Anatomy & Vessel Extraction',
              '04 Multi-Scale Lesion Detection',
              '05 Retinal Graph Topology',
              '06 ICDR DR Classification',
              '07 Explainability (XAI)',
              '08 Evidence Verification (ETDRS)',
              '09 Self-Aware Error Risk',
              '10 Zero-Trust Decision Gate',
              '11 Referral & Care Pathway',
            ].map((modName, idx) => {
              const modNum = idx + 1;
              const isCompleted = modNum < pipelineStage;
              const isCurrent = modNum === pipelineStage;

              return (
                <div
                  key={modName}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    isCompleted
                      ? 'border-[#1F7A5A]/50 bg-[#1F7A5A]/10 text-[#124B3A]'
                      : isCurrent
                      ? 'border-[#E9A23B] bg-[#E9A23B]/10 text-[#8A5612] font-bold shadow-xs'
                      : 'border-[#DDE5DC] bg-[#F8F6EF]/40 text-[#65736B]/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] opacity-75">{modNum < 10 ? `0${modNum}` : modNum}</span>
                    <span>{modName.split(' ').slice(1).join(' ')}</span>
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 size={14} className="text-[#1F7A5A]" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E9A23B] animate-ping" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#DDE5DC]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── VIEW 6: AI RESULT & REPORT (Section 16, 17, 18) ─── */}
      {currentView === 'result' && activePatient?.latestScreening && (
        <div className="bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header & Simulated Demo Label (Section 16) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-[#E9A23B]/20 text-[#8A5612] font-mono font-bold text-[10px]">
                  DEMO / SIMULATED RESULT
                </span>
                <span className="text-xs text-[#65736B]">
                  Report Status: <strong>{activePatient.latestScreening.reportStatus}</strong>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#124B3A]">
                Screening Report: {activePatient.name}
              </h2>
              <p className="text-xs text-[#65736B]">
                Patient ID: {activePatient.id} • Village: {activePatient.village}
              </p>
            </div>

            {/* Send to Doctor Button (Section 18) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('profile')}
                className="px-4 py-2.5 rounded-xl border border-[#DDE5DC] text-xs font-bold text-[#65736B] hover:bg-[#F8F6EF]"
              >
                Back to Patient
              </button>

              <button
                onClick={handleSendToDoctor}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-xs font-bold shadow-md shadow-[#124B3A]/20 transition-all hover:scale-[1.02]"
              >
                <Send size={15} />
                <span>Send to Doctor</span>
              </button>
            </div>
          </div>

          {/* DR Result Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#124B3A] text-white space-y-2">
              <span className="text-[11px] font-mono tracking-wider text-white/70 uppercase block">
                DR Classification
              </span>
              <span className="text-2xl font-black block">
                {activePatient.latestScreening.aiResult.drCategory}
              </span>
              <div className="text-xs text-white/80 pt-1 border-t border-white/15">
                Confidence: <strong>{activePatient.latestScreening.aiResult.confidence}%</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-2">
              <span className="text-[11px] font-mono tracking-wider text-[#65736B] uppercase block">
                Risk & Error Rate
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-[#E76F51]">
                  {activePatient.latestScreening.aiResult.riskLevel} Risk
                </span>
                <span className="text-xs font-mono font-bold text-[#65736B]">
                  OOD Error: {(activePatient.latestScreening.aiResult.errorRisk * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-[#65736B] pt-1 border-t border-[#DDE5DC]">
                Trust Gate: <strong>{activePatient.latestScreening.aiResult.trustDecision}</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-2">
              <span className="text-[11px] font-mono tracking-wider text-[#65736B] uppercase block">
                Detected Lesions
              </span>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>
                  MA: <strong>{activePatient.latestScreening.aiResult.detectedLesions.microaneurysms}</strong>
                </div>
                <div>
                  Hemorrhages: <strong>{activePatient.latestScreening.aiResult.detectedLesions.hemorrhages}</strong>
                </div>
                <div>
                  Hard Exudates: <strong>{activePatient.latestScreening.aiResult.detectedLesions.hardExudates}</strong>
                </div>
                <div>
                  Cotton Wool: <strong>{activePatient.latestScreening.aiResult.detectedLesions.cottonWoolSpots}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Visualizations Side by Side (Retinal Image & XAI) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-[#DDE5DC] bg-[#FAF4ED]/50 space-y-2">
              <span className="text-xs font-bold text-[#124B3A] block">
                Retinal Fundus Image
              </span>
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-black border border-[#124B3A]/30">
                <img
                  src={activePatient.latestScreening.retinalImage}
                  alt="Original Fundus"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] text-[#65736B] block">
                Preprocessed with dual CLAHE enhancement
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-[#DDE5DC] bg-[#FAF4ED]/50 space-y-2">
              <span className="text-xs font-bold text-[#124B3A] block">
                XAI Spatial Attention Heatmap
              </span>
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-black border border-[#124B3A]/30 relative">
                <img
                  src={activePatient.latestScreening.aiResult.xaiHeatmapUrl}
                  alt="XAI Heatmap"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1F7A5A]/30 via-transparent to-[#E9A23B]/30 pointer-events-none" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                  FAZ & Arcade Attention Overlaid
                </div>
              </div>
              <span className="text-[10px] text-[#65736B] block">
                Evidence Strength: {activePatient.latestScreening.aiResult.evidenceStrength}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── REGISTER NEW PATIENT MODAL (Section 7) ─── */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-start sm:items-center">
            {/* Backdrop click to dismiss */}
            <div
              className="fixed inset-0"
              onClick={() => setShowRegisterModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 bg-white rounded-3xl border border-[#DDE5DC] max-w-2xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            >
              {/* Sticky Modal Header */}
              <div className="p-5 sm:p-6 pb-4 border-b border-[#DDE5DC] flex items-center justify-between shrink-0 bg-[#FFFDF8]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
                      Frontline Registration
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[#124B3A]">Register New Patient</h2>
                  <p className="text-xs text-[#65736B]">
                    Hospital / Health Center Patient Registration
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={quickFillSamplePatient}
                    className="px-3 py-1.5 rounded-xl border border-[#E9A23B] bg-[#E9A23B]/10 hover:bg-[#E9A23B]/20 text-[#8A5612] text-[11px] font-bold transition-all flex items-center gap-1.5"
                    title="1-Click Auto-Fill for Presentation Demo"
                  >
                    <Sparkles size={12} />
                    <span>⚡ Quick Demo Fill</span>
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(false)}
                    className="w-8 h-8 rounded-full border border-[#DDE5DC] flex items-center justify-center text-[#65736B] hover:bg-[#F8F6EF] transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleRegisterSubmit} className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 flex-1">
                {/* 1. PERSONAL INFORMATION */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#124B3A] mb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        Full Name <span className="text-[#E76F51]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Patel"
                        value={newPatient.name}
                        onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        Age <span className="text-[#E76F51]">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="52"
                        value={newPatient.age}
                        onChange={e => setNewPatient({ ...newPatient, age: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        Gender <span className="text-[#E76F51]">*</span>
                      </label>
                      <select
                        value={newPatient.gender}
                        onChange={e => setNewPatient({ ...newPatient, gender: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        Mobile Number <span className="text-[#E76F51]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98231 45678"
                        value={newPatient.mobile}
                        onChange={e => setNewPatient({ ...newPatient, mobile: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. LOCATION */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#124B3A] mb-2">
                    Location
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        Village Name <span className="text-[#E76F51]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Example Village"
                        value={newPatient.village}
                        onChange={e => setNewPatient({ ...newPatient, village: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        Taluka / Block
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shirur Block"
                        value={newPatient.talukaBlock}
                        onChange={e => setNewPatient({ ...newPatient, talukaBlock: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pune District"
                        value={newPatient.district}
                        onChange={e => setNewPatient({ ...newPatient, district: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        placeholder="Maharashtra"
                        value={newPatient.state}
                        onChange={e => setNewPatient({ ...newPatient, state: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        placeholder="412210"
                        value={newPatient.pinCode}
                        onChange={e => setNewPatient({ ...newPatient, pinCode: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. MEDICAL INFORMATION */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#124B3A] mb-2">
                    Medical Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        Blood Group
                      </label>
                      <input
                        type="text"
                        placeholder="B+"
                        value={newPatient.bloodGroup}
                        onChange={e => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        Diabetes Status <span className="text-[#E76F51]">*</span>
                      </label>
                      <select
                        value={newPatient.diabetesStatus}
                        onChange={e => setNewPatient({ ...newPatient, diabetesStatus: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        Diabetes Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5 Years"
                        value={newPatient.diabetesDuration}
                        onChange={e => setNewPatient({ ...newPatient, diabetesDuration: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. EMERGENCY CONTACT */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#124B3A] mb-2">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Suman Patel"
                        value={newPatient.emergencyContactName}
                        onChange={e => setNewPatient({ ...newPatient, emergencyContactName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#17221C] mb-1">
                        Emergency Contact Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98231 99887"
                        value={newPatient.emergencyContactNumber}
                        onChange={e => setNewPatient({ ...newPatient, emergencyContactNumber: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 focus:border-[#1F7A5A] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. PREFERENCE */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#124B3A] mb-2">
                    Language Preference
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'gu', label: 'ગુજરાતી' },
                      { code: 'hi', label: 'हिन्दी' },
                    ].map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setNewPatient({ ...newPatient, languagePreference: lang.code as any })}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                          newPatient.languagePreference === lang.code
                            ? 'bg-[#124B3A] text-white border-[#124B3A] shadow-xs'
                            : 'bg-[#F8F6EF] text-[#65736B] border-[#DDE5DC] hover:bg-[#FAF4ED]'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. CONSENT */}
                <div className="pt-2 border-t border-[#DDE5DC] space-y-2">
                  <label className="flex items-center gap-2 text-xs text-[#17221C] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPatient.termsAccepted}
                      onChange={e => setNewPatient({ ...newPatient, termsAccepted: e.target.checked })}
                      className="accent-[#1F7A5A] rounded"
                      required
                    />
                    <span>I agree to the Terms & Conditions</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#17221C] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPatient.privacyAccepted}
                      onChange={e => setNewPatient({ ...newPatient, privacyAccepted: e.target.checked })}
                      className="accent-[#1F7A5A] rounded"
                      required
                    />
                    <span>I agree to the Privacy Policy</span>
                  </label>
                </div>
              </form>

              {/* Sticky Modal Footer */}
              <div className="p-4 px-6 border-t border-[#DDE5DC] bg-[#FAF4ED]/80 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-[#65736B]">
                  * Required fields for ABDM electronic health record compliance
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#DDE5DC] text-xs font-semibold text-[#65736B] hover:bg-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRegisterSubmit}
                    className="px-5 py-2 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-xs font-bold transition-all shadow-md shadow-[#124B3A]/20 flex items-center gap-1.5"
                  >
                    <UserPlus size={14} />
                    <span>Create Patient Profile</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
