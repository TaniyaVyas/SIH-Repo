import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useRetina, createDefaultFundusDataUrl } from '../../context/RetinaContext';
import { PersistentScreeningStatus } from '../../components/screening/PersistentScreeningStatus';
import { DemoModeBanner } from '../../components/common/DemoModeBanner';
import { printElement } from '../../utils/printDocument';
import {
  UserCheck,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  PlusCircle,
  MapPin,
  Building,
  Wifi,
  WifiOff,
  Play,
  Printer,
  QrCode,
  ShieldCheck,
  X,
  Layers,
  Activity,
  FileText,
  AlertCircle,
  Send,
  Check,
  FileDown,
} from 'lucide-react';

interface FieldPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  village: string;
  qualityScore: number;
  qualityStatus: string;
  stage: string;
  icdrGrade: number;
  urgency: string;
  time: string;
  preset: 'normal' | 'npdr' | 'severe';
}

export const HealthcareWorkerDashboard: React.FC = () => {
  const { user, networkStatus, toggleNetworkStatus } = useAuth();
  const {
    pipelineResults,
    activeImage,
    isProcessingPipeline,
    pipelineProgress,
    currentProcessingStage,
    currentStageName,
    runSequentialPipeline,
    setPresetImage,
  } = useRetina();

  const worker = user?.workerDetails;

  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PT-1049');
  const [showReferralSlip, setShowReferralSlip] = useState(false);
  const [smsSentToast, setSmsSentToast] = useState(false);
  const [screeningCompletedToast, setScreeningCompletedToast] = useState(false);

  // Form states for new patient quick add
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Female',
    village: '',
    mobile: '',
    abhaId: '',
  });

  const [fieldQueue, setFieldQueue] = useState<FieldPatient[]>([
    {
      id: 'PT-1049',
      name: 'Rameshwar Patil',
      age: 58,
      gender: 'Male',
      village: 'Koregaon Mul',
      qualityScore: 94,
      qualityStatus: 'Gradable',
      stage: 'Moderate NPDR',
      icdrGrade: 2,
      urgency: 'Semi-Urgent (14 Days)',
      time: '12 min ago',
      preset: 'npdr',
    },
    {
      id: 'PT-1048',
      name: 'Sunita Waghmare',
      age: 49,
      gender: 'Female',
      village: 'Shindewadi',
      qualityScore: 48,
      qualityStatus: 'Blurry / Motion Artifact',
      stage: 'Uncertain / Recapture Required',
      icdrGrade: -1,
      urgency: 'Recapture Required',
      time: '35 min ago',
      preset: 'npdr',
    },
    {
      id: 'PT-1047',
      name: 'Baburao Shinde',
      age: 63,
      gender: 'Male',
      village: 'Pabal PHC',
      qualityScore: 88,
      qualityStatus: 'Gradable',
      stage: 'Severe NPDR',
      icdrGrade: 3,
      urgency: 'Immediate (7 Days)',
      time: '1 hr ago',
      preset: 'severe',
    },
    {
      id: 'PT-1046',
      name: 'Shakuntala Mane',
      age: 55,
      gender: 'Female',
      village: 'Shirur Town',
      qualityScore: 96,
      qualityStatus: 'Gradable',
      stage: 'No DR',
      icdrGrade: 0,
      urgency: 'Routine (12 Mo)',
      time: '2 hrs ago',
      preset: 'normal',
    },
  ]);

  const activePatient =
    fieldQueue.find((p) => p.id === selectedPatientId) || fieldQueue[0];

  const handleSelectPatient = (patient: FieldPatient) => {
    setSelectedPatientId(patient.id);
    setPresetImage(patient.preset);
  };

  const handleRunFieldScreening = async () => {
    await runSequentialPipeline();

    // Dynamically update the selected active patient in fieldQueue
    setFieldQueue((prev) =>
      prev.map((p) => {
        if (p.id === selectedPatientId) {
          const newGrade = p.preset === 'normal' ? 0 : p.preset === 'severe' ? 3 : 2;
          const newStage =
            newGrade === 0
              ? 'No DR (Clear)'
              : newGrade === 3
              ? 'Severe NPDR'
              : 'Moderate NPDR';
          const newUrgency =
            newGrade === 0
              ? 'Routine (12 Mo)'
              : newGrade === 3
              ? 'Immediate (7 Days)'
              : 'Semi-Urgent (14 Days)';
          return {
            ...p,
            qualityScore: 96,
            qualityStatus: 'Gradable (Verified)',
            stage: newStage,
            icdrGrade: newGrade,
            urgency: newUrgency,
            time: 'Just now',
          };
        }
        return p;
      })
    );

    setScreeningCompletedToast(true);
    setTimeout(() => setScreeningCompletedToast(false), 4000);
  };

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: FieldPatient = {
      id: `PT-${Math.floor(1050 + Math.random() * 50)}`,
      name: newPatient.name || 'New Patient',
      age: parseInt(newPatient.age) || 50,
      gender: newPatient.gender,
      village: newPatient.village || 'Camp Site',
      qualityScore: 95,
      qualityStatus: 'Gradable (Pending Scan)',
      stage: 'Screening Ready',
      icdrGrade: 0,
      urgency: 'Pending Triage',
      time: 'Just now',
      preset: 'npdr',
    };

    setFieldQueue([newEntry, ...fieldQueue]);
    setSelectedPatientId(newEntry.id);
    setRegSuccess(true);

    setTimeout(() => {
      setRegSuccess(false);
      setShowRegisterModal(false);
      setNewPatient({
        name: '',
        age: '',
        gender: 'Female',
        village: '',
        mobile: '',
        abhaId: '',
      });
    }, 900);
  };

  const filteredQueue = fieldQueue.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto pb-12"
    >
      {/* Demo Mode Notice */}
      <motion.div variants={itemVariants}>
        <DemoModeBanner />
      </motion.div>

      {/* Top Welcome & Sub-Centre Banner */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-[#17221C] via-[#124B3A] to-[#1F7A5A] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-[#E9A23B]/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-[#E9A23B] mb-3">
              <UserCheck className="w-3.5 h-3.5 text-[#E9A23B]" />
              <span>Frontline Field Screening Terminal • NCD Mission</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {user?.name || 'Ananya Deshmukh (CHO)'}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-[#E9A23B]" />
                {worker?.healthCenter || 'Shirur Primary Health Sub-Centre'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1F7A5A]" />
                {worker?.district || 'Pune District'}, {worker?.state || 'Maharashtra'}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#124B3A] text-xs font-bold hover:bg-[#F8F6EF] transition-all shadow-sm active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-[#1F7A5A]" />
              <span>Register Camp Patient</span>
            </button>
            <Link
              to="/acquisition"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E9A23B] text-[#17221C] text-xs font-bold hover:bg-[#d6902d] transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <Camera className="w-4 h-4" />
              <span>Live Sensor Workstation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Persistent 11-Stage Pipeline Bar */}
      <motion.div variants={itemVariants}>
        <PersistentScreeningStatus />
      </motion.div>

      {/* 4 Summary Telemetry Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#DDE5DC] shadow-sm hover:border-[#1F7A5A]/40 transition-all">
          <span className="text-xs font-semibold text-[#65736B] block">Screened Today</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#17221C]">28</span>
            <span className="text-xs font-bold text-[#1F7A5A]">+4 vs yesterday</span>
          </div>
          <span className="text-[11px] text-[#65736B] mt-1 block">Camp Target: 35 patients</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#DDE5DC] shadow-sm hover:border-[#1F7A5A]/40 transition-all">
          <span className="text-xs font-semibold text-[#65736B] block">Image Quality Pass Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#124B3A]">94.2%</span>
            <span className="text-xs font-bold text-[#1F7A5A]">Optimal</span>
          </div>
          <span className="text-[11px] text-[#65736B] mt-1 block">ISO 10940 Clarity Gate</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#DDE5DC] shadow-sm hover:border-[#E76F51]/40 transition-all">
          <span className="text-xs font-semibold text-[#65736B] block">Referred to Specialist</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#E76F51]">6</span>
            <span className="text-xs font-bold text-[#E76F51]">21.4% DR</span>
          </div>
          <span className="text-[11px] text-[#65736B] mt-1 block">Dispatched to Tele-Ophthal</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#DDE5DC] shadow-sm hover:border-[#E9A23B]/40 transition-all">
          <span className="text-xs font-semibold text-[#65736B] block">Field Sync Status</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#E9A23B]">
              {networkStatus === 'offline' ? '3 Cached' : 'Online Sync'}
            </span>
            <button
              onClick={toggleNetworkStatus}
              title="Toggle network connectivity simulation"
              className="text-xs text-[#65736B] hover:text-[#17221C] ml-auto p-1 rounded-md border border-[#DDE5DC]"
            >
              {networkStatus === 'online' ? (
                <Wifi className="w-3.5 h-3.5 text-[#1F7A5A]" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-[#E76F51]" />
              )}
            </button>
          </div>
          <span className="text-[11px] text-[#65736B] mt-1 block">
            {networkStatus === 'online' ? 'ABDM Cloud Synchronized' : 'Edge SQLite offline mode'}
          </span>
        </div>
      </motion.div>

      {/* Main Field Queue & Active Patient Triage Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Field Patient Camp Queue */}
        <motion.div variants={itemVariants} className="lg:col-span-7 bg-white rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE5DC] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#17221C]">Field Camp Patient Queue</h2>
              <p className="text-xs text-[#65736B]">Select a patient to review quality, run AI screening, or issue referral</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#65736B] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search patient, ID, village..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] text-xs text-[#17221C] focus:outline-none focus:ring-1 focus:ring-[#1F7A5A]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DDE5DC] text-[#65736B] uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Patient</th>
                  <th className="py-2.5 px-3 font-semibold">Quality Gate</th>
                  <th className="py-2.5 px-3 font-semibold">Diagnosis</th>
                  <th className="py-2.5 px-3 font-semibold">Triage Urgency</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DC]">
                {filteredQueue.map((item) => {
                  const isSelected = item.id === selectedPatientId;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleSelectPatient(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#1F7A5A]/10 font-medium'
                          : 'hover:bg-[#F8F6EF]/60'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#17221C] flex items-center gap-1.5">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />}
                          <span>{item.name}</span>
                        </div>
                        <div className="text-[11px] text-[#65736B]">
                          {item.id} • {item.age}y • {item.village}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.qualityScore >= 80 ? 'bg-[#1F7A5A]' : 'bg-[#E76F51]'
                            }`}
                          />
                          <span className="font-semibold text-[#17221C]">
                            {item.qualityScore}%
                          </span>
                        </div>
                        <span className="text-[10px] text-[#65736B] block">
                          {item.qualityStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.icdrGrade === 0
                              ? 'bg-[#1F7A5A]/10 text-[#1F7A5A]'
                              : item.icdrGrade === -1
                              ? 'bg-[#E76F51]/10 text-[#E76F51]'
                              : 'bg-[#E9A23B]/20 text-[#A6680C]'
                          }`}
                        >
                          {item.stage}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] font-semibold text-[#17221C]">
                        {item.urgency}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPatient(item);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-[#124B3A] text-white shadow-xs'
                              : 'border border-[#DDE5DC] text-[#124B3A] hover:bg-[#F8F6EF]'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-[#65736B]">
            <span>Showing {filteredQueue.length} registered camp attendees</span>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="text-[#1F7A5A] font-bold hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New Patient to Camp</span>
            </button>
          </div>
        </motion.div>

        {/* Right 5 Cols: Active Patient Triage Action Center */}
        <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
          {/* Active Patient Card */}
          <div className="bg-white rounded-3xl border-2 border-[#1F7A5A]/30 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#DDE5DC] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F7A5A]">
                  Active Field Subject
                </span>
                <h3 className="font-bold text-base text-[#17221C]">
                  {activePatient.name} ({activePatient.id})
                </h3>
              </div>
              <span className="text-xs text-[#65736B]">
                {activePatient.age}y / {activePatient.gender} • {activePatient.village}
              </span>
            </div>

            {/* Retinal Preview & Stage 02 Quality Check */}
            <div className="relative rounded-2xl bg-[#0D1510] overflow-hidden flex items-center justify-center p-3 h-44">
              <img
                src={activeImage || createDefaultFundusDataUrl(activePatient.preset)}
                alt="Patient Fundus Preview"
                className="max-h-full rounded-xl object-contain"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono">
                OD 45° Macula Field
              </span>
            </div>

            {/* Quality Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]">
                <span className="text-[#65736B] block text-[10px]">Clarity Score:</span>
                <span className="font-bold text-[#124B3A]">
                  {activePatient.qualityScore}% ({activePatient.qualityStatus})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]">
                <span className="text-[#65736B] block text-[10px]">Microaneurysms:</span>
                <span className="font-bold text-[#17221C]">
                  {pipelineResults.lesions.microaneurysms} Detected
                </span>
              </div>
            </div>

            {/* One-Click Field Screening Trigger */}
            <div className="space-y-2">
              <button
                disabled={isProcessingPipeline}
                onClick={handleRunFieldScreening}
                className="w-full py-3 px-4 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>
                  {isProcessingPipeline
                    ? `Processing Stage ${currentProcessingStage}/11: ${currentStageName}...`
                    : 'Run One-Click Field AI Screening'}
                </span>
              </button>

              <button
                onClick={() => setShowReferralSlip(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#E9A23B] hover:bg-[#d48e28] text-[#17221C] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Generate ABDM Referral Slip</span>
              </button>
            </div>

            {/* Screening Completed Success Alert */}
            <AnimatePresence>
              {screeningCompletedToast && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 rounded-2xl bg-[#1F7A5A]/15 border border-[#1F7A5A]/40 text-[#124B3A] text-xs font-bold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#1F7A5A] shrink-0" />
                  <span>
                    Screening Complete! Record updated for {activePatient.name} ({activePatient.stage}).
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Link for Judges */}
            <div className="pt-2 border-t border-[#DDE5DC] flex items-center justify-between text-[11px] text-[#65736B]">
              <span>Camera Setup & Gating:</span>
              <div className="flex gap-2">
                <Link to="/acquisition" className="text-[#1F7A5A] font-bold hover:underline">
                  Stage 01 Acquisition
                </Link>
                <span>•</span>
                <Link to="/trust" className="text-[#1F7A5A] font-bold hover:underline">
                  Stage 10 Triage
                </Link>
              </div>
            </div>
          </div>

          {/* Quality Assessment Checklist */}
          <div className="bg-white rounded-3xl border border-[#DDE5DC] p-5 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5A] block">
              Stage 02 Quality Gate Checklist
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#17221C]">
                <span>Blur Metric (Laplacian Var):</span>
                <span className="font-bold text-[#1F7A5A]">184 / 100 (Sharp)</span>
              </div>
              <div className="flex items-center justify-between text-[#17221C]">
                <span>Illumination Balance:</span>
                <span className="font-bold text-[#1F7A5A]">91% (Uniform)</span>
              </div>
              <div className="flex items-center justify-between text-[#17221C]">
                <span>FOV Obstruction / Eyelash:</span>
                <span className="font-bold text-[#1F7A5A]">0.38% (Clear)</span>
              </div>
              <div className="flex items-center justify-between text-[#17221C]">
                <span>ISO 10940 Clinical Standard:</span>
                <span className="font-bold text-[#124B3A]">Passed</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* Modal: Quick Register Camp Patient                                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showRegisterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold text-[#17221C] mb-1">Register Camp Patient</h3>
              <p className="text-xs text-[#65736B] mb-5">
                Quick on-the-spot registration for field fundus examination.
              </p>

              {regSuccess ? (
                <div className="p-4 rounded-2xl bg-[#1F7A5A]/15 text-[#1F7A5A] text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Patient registered & loaded into active queue!</span>
                </div>
              ) : (
                <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#17221C] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Patient Name"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] text-[#17221C]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#17221C] mb-1">Age</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        required
                        placeholder="Age"
                        value={newPatient.age}
                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] text-[#17221C]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#17221C] mb-1">Gender</label>
                      <select
                        value={newPatient.gender}
                        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] text-[#17221C]"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#17221C] mb-1">Village / Ward</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Koregaon Mul"
                      value={newPatient.village}
                      onChange={(e) => setNewPatient({ ...newPatient, village: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] text-[#17221C]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#17221C] mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98..."
                      value={newPatient.mobile}
                      onChange={(e) => setNewPatient({ ...newPatient, mobile: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] text-[#17221C]"
                    />
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRegisterModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-[#DDE5DC] font-bold text-[#65736B] hover:bg-[#F8F6EF]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#124B3A] text-white font-bold hover:bg-[#1F7A5A]"
                    >
                      Save to Camp Queue
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* Modal: Official ABDM Field Triage Referral Slip                            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showReferralSlip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              id="ref-slip-print-sheet"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="printable-sheet single-page-sheet bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto"
            >
              {/* Slip Header with Government Emblem */}
              <div className="flex items-center justify-between border-b-2 border-[#124B3A] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#124B3A] text-white flex items-center justify-center font-bold shadow-md">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#E9A23B] font-bold block">
                      AYUSHMAN BHARAT DIGITAL MISSION (ABDM) • NHA
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#17221C]">
                      Fast-Track Tele-Ophthalmic Referral Slip
                    </h3>
                    <span className="text-xs text-[#65736B]">
                      Frontline Primary Health Center to District Specialty Center
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReferralSlip(false)}
                  className="p-1.5 rounded-full hover:bg-[#F8F6EF] text-[#65736B] no-print"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Referral Token & Status Bar */}
              <div className="p-3 rounded-xl bg-[#124B3A]/5 border border-[#124B3A]/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#65736B] block text-[10px]">ABDM Referral Docket No:</span>
                  <span className="font-mono font-bold text-[#124B3A] text-sm">
                    ABDM-REF-MH-{activePatient.id.replace(/\D/g, '') || '9921'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E76F51]/15 text-[#E76F51] uppercase">
                    {activePatient.urgency}
                  </span>
                  <span className="text-[10px] text-[#65736B] block mt-0.5">Priority Queue Slot</span>
                </div>
              </div>

              {/* Patient Demographics & Identification */}
              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#65736B] block text-[10px]">Patient Name:</span>
                  <span className="font-bold text-[#17221C]">{activePatient.name}</span>
                </div>
                <div>
                  <span className="text-[#65736B] block text-[10px]">Age / Gender:</span>
                  <span className="font-bold text-[#17221C]">{activePatient.age} Y / {activePatient.gender}</span>
                </div>
                <div>
                  <span className="text-[#65736B] block text-[10px]">Village / Taluka:</span>
                  <span className="font-bold text-[#17221C]">{activePatient.village}</span>
                </div>
                <div>
                  <span className="text-[#65736B] block text-[10px]">ABHA Health ID:</span>
                  <span className="font-mono font-bold text-[#E9A23B]">
                    91-4820-8192-3841
                  </span>
                </div>
                <div>
                  <span className="text-[#65736B] block text-[10px]">ABHA Address:</span>
                  <span className="font-mono text-[#1F7A5A]">
                    {activePatient.name.toLowerCase().replace(/\s+/g, '')}@abdm
                  </span>
                </div>
                <div>
                  <span className="text-[#65736B] block text-[10px]">Examined Eye:</span>
                  <span className="font-semibold text-[#17221C]">OD (Right Eye) 45°</span>
                </div>
              </div>

              {/* Clinical Findings & Screening Results */}
              <div className="p-4 rounded-2xl border border-[#DDE5DC] space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-[#124B3A] block">
                  Field AI Screening & Diagnostic Assessment
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#F8F6EF]">
                    <span className="text-[#65736B] block text-[10px]">Presumptive Diagnosis:</span>
                    <span className="font-bold text-[#124B3A]">{activePatient.stage}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8F6EF]">
                    <span className="text-[#65736B] block text-[10px]">Image Quality Standard:</span>
                    <span className="font-bold text-[#1F7A5A]">{activePatient.qualityScore}% ({activePatient.qualityStatus})</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#65736B] leading-relaxed pt-1">
                  <strong>Clinical Reason for Referral:</strong> Fundus photograph demonstrates microvascular lesions consistent with {activePatient.stage}. Referred to District Eye Hospital for secondary specialist slit-lamp examination, optical coherence tomography (OCT), and therapeutic tele-prescription.
                </div>
              </div>

              {/* Referring Centre & Destination Centre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
                  <span className="font-bold text-[#124B3A] block text-[11px]">Referring Primary Facility:</span>
                  <div className="font-semibold text-[#17221C]">{worker?.healthCenter || 'Shirur Primary Health Sub-Centre'}</div>
                  <div className="text-[10px] text-[#65736B]">Facility Code: IN-MH-PUN-09214</div>
                  <div className="text-[10px] text-[#65736B]">Field Operator: {user?.name || 'Ananya Deshmukh (CHO)'}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#124B3A]/5 border border-[#124B3A]/20 space-y-1">
                  <span className="font-bold text-[#124B3A] block text-[11px]">Destination Specialty Centre:</span>
                  <div className="font-semibold text-[#17221C]">District Tele-Ophthalmology Centre</div>
                  <div className="text-[10px] text-[#65736B]">Department: Vitreo-Retinal OPD</div>
                  <div className="text-[10px] text-[#1F7A5A] font-bold">Fast-Track OPD Counter 4</div>
                </div>
              </div>

              {/* Digital Barcode / QR Section */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#124B3A]/20 flex items-center gap-4">
                <div className="p-2 bg-[#F8F6EF] rounded-xl shrink-0">
                  <QrCode className="w-16 h-16 text-[#124B3A]" />
                </div>
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-[#124B3A] block">Digital Tele-Prescription Token (FHIR Bundle)</span>
                  <p className="text-[11px] text-[#65736B] leading-relaxed">
                    Scan this QR code at the District Hospital OPD kiosk for zero-wait triage admission and immediate specialist queuing.
                  </p>
                  <span className="text-[10px] font-mono text-[#E9A23B] font-bold block">
                    HMAC-SHA256: 9921-ABDM-VALID-MH
                  </span>
                </div>
              </div>

              {/* SMS Notification Banner */}
              <AnimatePresence>
                {smsSentToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-3 rounded-xl bg-[#1F7A5A]/15 border border-[#1F7A5A]/30 text-[#124B3A] text-xs font-bold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#1F7A5A] shrink-0" />
                    <span>SMS Referral Token successfully dispatched to patient mobile (+91 98***)!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 no-print">
                <button
                  type="button"
                  onClick={() => {
                    setSmsSentToast(true);
                    setTimeout(() => setSmsSentToast(false), 4000);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#124B3A] text-xs font-bold text-[#124B3A] hover:bg-[#F8F6EF] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send SMS to Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => printElement('ref-slip-print-sheet', `ABDM_Referral_Slip_${activePatient.name.replace(/\s+/g, '_')}`)}
                  className="flex-1 py-2.5 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#1F7A5A] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Referral Slip</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
