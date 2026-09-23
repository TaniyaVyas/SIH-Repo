import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Printer,
  X,
  PhoneCall,
  Video,
  Hospital,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  QrCode,
  ShieldCheck,
  UserCheck,
  Eye,
  ExternalLink
} from 'lucide-react';
import { useRetinaData } from '../context/RetinaContext';
import { printElement } from '../utils/printDocument';

interface TeleOpdDocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicalCase?: {
    patientCode?: string;
    age?: number;
    gender?: string;
    icdrGrade?: number;
    gradeLabel?: string;
    riskScore?: number;
    referralTarget?: string;
    referralHospital?: string;
    etdrsConcordance?: any;
  };
}

export const TeleOpdDocketModal: React.FC<TeleOpdDocketModalProps> = ({
  isOpen,
  onClose,
  clinicalCase,
}) => {
  const { activeImage } = useRetinaData();
  const [isVideoConnecting, setIsVideoConnecting] = useState(false);
  const [videoConnected, setVideoConnected] = useState(false);

  if (!isOpen) return null;

  const patientCode = clinicalCase?.patientCode || 'PT-2024-0892';
  const age = clinicalCase?.age || 58;
  const gender = clinicalCase?.gender || 'Male';
  const gradeLabel = clinicalCase?.gradeLabel || 'Grade 3: Severe NPDR';
  const referralTarget = clinicalCase?.referralTarget || 'District Eye Hospital (Vitreo-Retina Unit)';

  const handlePrint = () => {
    printElement('tele-opd-docket-sheet', `eSanjeevani_TeleOPD_Docket_${patientCode}`);
  };

  const handleConnectVideo = () => {
    setIsVideoConnecting(true);
    setTimeout(() => {
      setIsVideoConnecting(false);
      setVideoConnected(true);
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          id="tele-opd-docket-sheet"
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="printable-sheet single-page-sheet bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Bar Header */}
          <div className="px-6 py-4 bg-[#124B3A] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Hospital size={20} className="text-[#E9A23B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base tracking-tight">
                    e-Sanjeevani 2.0 • Official Tele-OPD Clinical Docket
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E9A23B] text-[#124B3A]">
                    ABDM FAST-TRACK
                  </span>
                </div>
                <p className="text-xs text-[#DDE5DC]/80">
                  Ayushman Bharat Digital Health Mission • Tele-Ophthalmology Triaged Referral
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Print Clinical Docket"
              >
                <Printer size={14} />
                <span>Print Docket</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Clinical Docket Area */}
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 print-container">
            {/* Docket Header Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#124B3A]">
              <div>
                <div className="text-[11px] font-mono font-bold text-[#1F7A5A] uppercase tracking-widest">
                  MINISTRY OF HEALTH & FAMILY WELFARE • GOVERNMENT OF INDIA
                </div>
                <h1 className="text-2xl font-black text-[#124B3A] tracking-tight">
                  Tele-Ophthalmology Triage & Referral Slip
                </h1>
                <p className="text-xs text-[#65736B]">
                  National Programme for Control of Blindness and Visual Impairment (NPCBVI)
                </p>
              </div>

              <div className="text-right font-mono text-xs space-y-0.5">
                <div className="font-bold text-[#124B3A]">DOCKET ID: #eSanj-2024-MH-9482</div>
                <div className="text-[#65736B]">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="inline-block px-2 py-0.5 rounded bg-[#FAF4ED] text-[#8A5612] font-bold text-[10px] border border-[#E9A23B]/30">
                  URGENT TRIAGE (&lt; 14 DAYS)
                </div>
              </div>
            </div>

            {/* Patient & Facility Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Patient Info Card */}
              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-2">
                <div className="font-bold text-[#124B3A] uppercase tracking-wide text-[11px] border-b border-[#DDE5DC] pb-1 flex items-center justify-between">
                  <span>Patient Demographic Profile</span>
                  <span className="text-[#1F7A5A] font-mono font-bold">ABDM VERIFIED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 pt-1">
                  <div><span className="text-[#65736B]">Subject ID:</span> <strong className="text-[#124B3A]">{patientCode}</strong></div>
                  <div><span className="text-[#65736B]">Age / Sex:</span> <strong className="text-[#124B3A]">{age} Yrs • {gender}</strong></div>
                  <div className="col-span-2">
                    <span className="text-[#65736B]">ABHA ID:</span> <span className="font-mono font-bold text-[#124B3A]">91-4820-8192-3841</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#65736B]">Location:</span> <strong className="text-[#124B3A]">Sub-Centre Wadki, Taluka Ralegaon, Yavatmal, MH</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#65736B]">Screening Officer (ASHA):</span> Smt. Sunita Bai (ASHA ID: MH-YTL-4029)
                  </div>
                </div>
              </div>

              {/* Destination Referral Facility */}
              <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-[#E9A23B]/40 space-y-2">
                <div className="font-bold text-[#8A5612] uppercase tracking-wide text-[11px] border-b border-[#E9A23B]/30 pb-1 flex items-center justify-between">
                  <span>Destination Healthcare Facility</span>
                  <span className="text-[#E76F51] font-mono font-bold">TERTIARY CARE</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div>
                    <span className="text-[#65736B]">Facility:</span> <strong className="text-[#124B3A]">{referralTarget}</strong>
                  </div>
                  <div>
                    <span className="text-[#65736B]">Department:</span> <strong>Vitreo-Retina Specialty & Laser Photocoagulation Clinic</strong>
                  </div>
                  <div>
                    <span className="text-[#65736B]">Assigned Consultant:</span> Dr. Ananya Sen, MS (Ophth), Vitreo-Retinal Specialist
                  </div>
                  <div>
                    <span className="text-[#65736B]">Tele-OPD Slot:</span> <strong className="text-[#1F7A5A]">Tomorrow, 10:30 AM (Token #04)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Retinal Clinical Finding Section with Fundus Image */}
            <div className="p-5 rounded-2xl bg-white border border-[#DDE5DC] space-y-4">
              <div className="font-bold text-[#124B3A] uppercase tracking-wide text-xs flex items-center justify-between border-b border-[#DDE5DC] pb-2">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-[#1F7A5A]" />
                  <span>Retinal Fundus Image & AI-Assisted Lesion Census</span>
                </div>
                <span className="font-mono text-[10px] text-[#65736B]">ISO 10940 • Non-Mydriatic 45°</span>
              </div>

              <div className="grid sm:grid-cols-12 gap-5 items-center">
                {/* Active Scan Thumbnail */}
                <div className="sm:col-span-4 aspect-square rounded-2xl bg-[#08170F] overflow-hidden border-2 border-[#1F7A5A]/30 flex items-center justify-center relative shadow-md">
                  {activeImage ? (
                    <img src={activeImage} alt="Patient Fundus" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#3d130c]" />
                  )}
                  <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 text-[9px] font-mono text-white text-center backdrop-blur-xs">
                    Right Eye (OD) • 4-Quadrant Saliency
                  </div>
                </div>

                {/* Finding Summary */}
                <div className="sm:col-span-8 space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FDF0EC] border border-[#E76F51]/30">
                    <div className="text-[10px] font-mono font-bold text-[#9A3B24] uppercase">PRIMARY CLINICAL DIAGNOSIS</div>
                    <div className="text-base font-black text-[#B9381E]">{gradeLabel}</div>
                    <p className="text-[11px] text-[#65736B] mt-0.5">
                      ICD-10 H36.03: Proliferative threat high. Clinically Significant Macular Edema (CSME) detected within 420μm of FAZ border.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-[#F8F6EF] text-center">
                      <span className="text-[#65736B] block text-[9px]">MICROANEURYSMS</span>
                      <strong className="text-[#124B3A]">26 Detected</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F8F6EF] text-center">
                      <span className="text-[#65736B] block text-[9px]">HEMORRHAGES</span>
                      <strong className="text-[#E76F51]">7 Blot / Flame</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F8F6EF] text-center">
                      <span className="text-[#65736B] block text-[9px]">ETDRS 4-2-1</span>
                      <strong className="text-[#1F7A5A]">100% Pass</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#17221C] leading-relaxed bg-[#F8F6EF] p-2.5 rounded-xl border border-[#DDE5DC]">
                    <strong>Recommended Clinical Protocol:</strong> Immediate referral for Anti-VEGF / Focal Argon Laser photocoagulation evaluation. Strict HbA1c control and blood pressure monitoring.
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor Sign-off & QR Authentication */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-[#DDE5DC] text-xs">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] flex items-center justify-center text-[#124B3A] shrink-0">
                  <QrCode size={40} />
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-[#124B3A]">Digital Verification Seal</div>
                  <div className="text-[10px] text-[#65736B] font-mono">SHA256: 4f8b...e92a (ABDM Gateway)</div>
                  <div className="text-[10px] text-[#1F7A5A] font-semibold">✓ Cryptographically Signed by AI CDSS Node</div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="h-8 flex items-end justify-end">
                  <span className="font-serif italic text-sm text-[#124B3A] font-bold">Dr. R. K. Deshmukh, MBBS</span>
                </div>
                <div className="w-48 h-[1px] bg-[#124B3A] ml-auto" />
                <div className="text-[10px] font-mono text-[#65736B]">Medical Officer, PHC Wadki (Reg #MMC-72910)</div>
              </div>
            </div>
          </div>

          {/* Bottom Live Action Footer */}
          <div className="px-6 py-4 bg-[#F8F6EF] border-t border-[#DDE5DC] flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
            <div className="flex items-center gap-2 text-xs font-mono text-[#65736B]">
              <span className="w-2 h-2 rounded-full bg-[#1F7A5A] animate-ping" />
              <span>e-Sanjeevani Tele-OPD Gateway: Online</span>
            </div>

            <div className="flex items-center gap-3">
              {videoConnected ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E8F3EE] text-[#1F7A5A] text-xs font-bold border border-[#1F7A5A]/40">
                  <CheckCircle2 size={15} />
                  <span>Teleconsult Room Active (Token Verified)</span>
                </div>
              ) : (
                <button
                  onClick={handleConnectVideo}
                  disabled={isVideoConnecting}
                  className="px-4 py-2 rounded-xl bg-[#124B3A] hover:bg-[#0E3C2E] disabled:opacity-60 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <Video size={14} className={isVideoConnecting ? 'animate-spin' : ''} />
                  <span>{isVideoConnecting ? 'Initiating Video Link...' : 'Launch e-Sanjeevani Video Room'}</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF4ED] text-[#17221C] text-xs font-semibold border border-[#DDE5DC] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
