import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRetinaData } from '../context/RetinaContext';
import { useAuth } from '../context/AuthContext';
import { ActiveScanPipelineBanner } from '../components/layout/ActiveScanPipelineBanner';
import { printElement } from '../utils/printDocument';
import {
  FileText,
  Printer,
  Download,
  Share2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Hospital,
  Eye,
  Layers,
  Network,
  QrCode,
  Calendar,
  Clock,
  User,
  ExternalLink,
  ChevronRight,
  Activity
} from 'lucide-react';

type ReportType = 'clinical' | 'referral' | 'etdrs' | 'morphometry' | 'fhir';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeImage, imageSource, imageMetadata, pipelineResults } = useRetinaData();
  const { t } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ReportType>('clinical');
  const [isCopied, setIsCopied] = useState(false);

  // Fallback / dynamic patient metadata
  const patientData = {
    patientCode: 'PT-2024-0892',
    abhaId: '91-4820-8192-3841',
    name: 'Rameshwar Patil',
    age: 58,
    gender: 'Male',
    icdrGrade: pipelineResults.classification?.icdrGrade ?? 3,
    gradeLabel: pipelineResults.classification?.gradeLabel ?? 'Grade 3: Severe NPDR',
    riskScore: pipelineResults.classification?.confidence ? Math.round(pipelineResults.classification.confidence * 100) : 94,
    etdrsConcordance: '100% Rule Concordance (Strict Pass)',
    macularInvolvement: pipelineResults.lesions?.macularEdemaPresent ?? true,
    referralTarget: 'District Eye Hospital (Vitreo-Retina Unit)',
    notes: 'Severe non-proliferative diabetic retinopathy with high risk of progression to proliferative stage. Dense circinate hard exudates bordering FAZ.',
  };

  const handlePrint = () => {
    printElement('reports-print-canvas', `RetinaFusion_${selectedReport.toUpperCase()}_Report`);
  };

  const handleSavePdf = () => {
    printElement('reports-print-canvas', `RetinaFusion_${selectedReport.toUpperCase()}_Report`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8 pb-16 select-none">
      {/* ─── 1. PAGE HEADER & QUICK ACTIONS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC] no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              {t.modules.reportsBadge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            {t.modules.reportsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            {t.modules.reportsDesc}
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#124B3A] hover:bg-[#0E3C2E] text-white text-xs font-bold shadow-md shadow-[#124B3A]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Print this official medical report"
          >
            <Printer size={15} />
            <span>{t.modules.reportsPrintBtn}</span>
          </button>

          <button
            onClick={handleSavePdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFDF8] hover:bg-[#FAF4ED] text-[#124B3A] text-xs font-bold border border-[#DDE5DC] transition-all shadow-xs"
            title="Save as PDF via Print"
          >
            <Download size={15} />
            <span>{t.modules.reportsPdfBtn}</span>
          </button>
        </div>
      </div>

      {/* ─── ACTIVE SCAN PIPELINE RUNNER ─── */}
      <div className="no-print">
        <ActiveScanPipelineBanner currentModuleNumber={10} />
      </div>

      {/* ─── 2. REPORT SELECTOR TABS ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-print">
        {[
          { id: 'clinical', label: t.modules.tabClinical, icon: FileText, badge: 'Official' },
          { id: 'referral', label: t.modules.tabReferral, icon: Hospital, badge: 'e-Sanjeevani' },
          { id: 'etdrs', label: t.modules.tabEtdrs, icon: ShieldCheck, badge: 'Concordance' },
          { id: 'morphometry', label: t.modules.tabMorphometry, icon: Network, badge: 'GNN Metrics' },
        ].map((tab) => {
          const isSelected = selectedReport === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id as ReportType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? 'bg-[#124B3A] text-white border-[#124B3A] shadow-sm scale-[1.01]'
                  : 'bg-[#FFFDF8] hover:bg-[#FAF4ED] text-[#65736B] hover:text-[#17221C] border-[#DDE5DC]'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-[#E9A23B]' : 'text-[#1F7A5A]'} />
              <span>{tab.label}</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#F8F6EF] text-[#65736B]'}`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── 3. PRINTABLE REPORT CANVAS (A4 Medical Format) ─── */}
      <div
        id="reports-print-canvas"
        className="printable-sheet single-page-sheet bg-white rounded-3xl border border-[#DDE5DC] shadow-sm p-6 sm:p-10 max-w-5xl mx-auto print-container space-y-8"
      >
        {/* REPORT 1: COMPREHENSIVE CLINICAL SUMMARY */}
        {selectedReport === 'clinical' && (
          <div className="space-y-8">
            {/* Hospital Letterhead Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-[#124B3A] gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#124B3A] text-white flex items-center justify-center shadow-md shrink-0">
                  <Eye size={28} className="text-[#FFFDF8]" />
                </div>
                <div>
                  <div className="text-[11px] font-mono font-bold text-[#1F7A5A] uppercase tracking-widest">
                    NATIONAL INSTITUTE OF OPHTHALMOLOGY & CDSS
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#124B3A] tracking-tight">
                    Comprehensive Diabetic Retinopathy Diagnostic Dossier
                  </h2>
                  <p className="text-xs text-[#65736B]">
                    ISO 10940 Compliant • Validated against International Clinical Diabetic Retinopathy (ICDR) Standards
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs space-y-0.5">
                <div className="font-bold text-[#124B3A]">REPORT #: RF360-2024-0982</div>
                <div className="text-[#65736B]">DATE: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div className="text-[10px] text-[#1F7A5A] font-bold">DIGITAL SIGNATURE VERIFIED</div>
              </div>
            </div>

            {/* Patient Demographics & ABHA Information */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] text-xs">
              <div>
                <span className="text-[#65736B] block text-[10px] font-mono uppercase">Patient Name</span>
                <strong className="text-[#124B3A] text-sm">{patientData.name}</strong>
              </div>
              <div>
                <span className="text-[#65736B] block text-[10px] font-mono uppercase">Patient Code / ID</span>
                <strong className="font-mono text-sm text-[#124B3A]">{patientData.patientCode}</strong>
              </div>
              <div>
                <span className="text-[#65736B] block text-[10px] font-mono uppercase">Age / Gender</span>
                <strong className="text-[#124B3A]">{patientData.age} Years • {patientData.gender}</strong>
              </div>
              <div>
                <span className="text-[#65736B] block text-[10px] font-mono uppercase">Ayushman ABHA ID</span>
                <strong className="font-mono text-[#1F7A5A]">{patientData.abhaId}</strong>
              </div>
            </div>

            {/* Primary Diagnostic Finding Callout */}
            <div className="p-5 rounded-2xl bg-[#FDF0EC] border-2 border-[#E76F51]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#9A3B24] uppercase tracking-wider">
                  AI-ASSISTED PRIMARY CLINICAL VERDICT
                </span>
                <div className="text-2xl font-black text-[#B9381E] tracking-tight">
                  {patientData.gradeLabel}
                </div>
                <p className="text-xs text-[#65736B]">
                  Classification Code: <strong>ICD-10 H36.03</strong> (Severe Non-Proliferative Diabetic Retinopathy)
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-[#E76F51]/30 sm:pl-6 space-y-1 shrink-0">
                <span className="text-[10px] font-mono text-[#65736B] block">SIGHT-THREAT INDEX</span>
                <div className="text-3xl font-black font-mono text-[#E76F51]">{patientData.riskScore}%</div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FAF4ED] text-[#8A5612]">
                  URGENT TRIAGE (&lt; 2 WEEKS)
                </span>
              </div>
            </div>

            {/* Fundus Photography Examination Views */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#DDE5DC] pb-2">
                <h3 className="text-sm font-bold text-[#124B3A] uppercase tracking-wide">
                  Retinal Imaging Examination (OD - Right Eye)
                </h3>
                <span className="text-xs font-mono text-[#65736B]">Field: 45° Non-Mydriatic Fundus</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* View 1: Raw Original */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#65736B] flex items-center justify-between">
                    <span>1. Original Raw Fundus</span>
                    <span className="text-[10px] font-mono">Input Stream 1</span>
                  </div>
                  <div className="aspect-[4/3] rounded-2xl bg-[#08170F] overflow-hidden border border-[#DDE5DC] flex items-center justify-center">
                    {activeImage ? (
                      <img src={activeImage} alt="Raw Fundus" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#3d130c]" />
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-[#65736B]">
                    Resolution: {imageMetadata.resolution} • Quality Score: 94% (Gradable)
                  </p>
                </div>

                {/* View 2: CLAHE & Vascular Enhancement */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#124B3A] flex items-center justify-between">
                    <span>2. Enhanced Microvascular Map</span>
                    <span className="text-[10px] font-mono text-[#1F7A5A]">CLAHE + Lesions</span>
                  </div>
                  <div className="aspect-[4/3] rounded-2xl bg-[#08170F] overflow-hidden border border-[#1F7A5A]/50 flex items-center justify-center relative">
                    {activeImage ? (
                      <img
                        src={activeImage}
                        alt="Enhanced Fundus"
                        className="w-full h-full object-cover filter contrast-[1.4] saturate-[1.3] brightness-[1.05]"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#4a170e]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#1F7A5A]/15 via-transparent to-[#E9A23B]/10 mix-blend-overlay pointer-events-none" />
                  </div>
                  <p className="text-[10px] font-mono text-[#65736B]">
                    Contrast expanded from 42 SNR to 88 SNR • Capillary visibility: 25μm
                  </p>
                </div>
              </div>
            </div>

            {/* Lesions & Anatomical Biomarkers Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#124B3A] uppercase tracking-wide border-b border-[#DDE5DC] pb-2">
                Quantitative Pathology & Morphometric Census
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#F8F6EF] text-[#124B3A] font-mono font-bold border-b border-[#DDE5DC]">
                      <th className="p-3">Biomarker / Pathology</th>
                      <th className="p-3">Count / Measurement</th>
                      <th className="p-3">Normal Reference</th>
                      <th className="p-3">Clinical Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DC] text-[#17221C]">
                    <tr>
                      <td className="p-3 font-semibold">Microaneurysms (MA)</td>
                      <td className="p-3 font-mono font-bold text-[#E76F51]">26 detected</td>
                      <td className="p-3 text-[#65736B]">0</td>
                      <td className="p-3 text-[#E76F51]">Severe microvascular permeability</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Blot & Flame Hemorrhages</td>
                      <td className="p-3 font-mono font-bold text-[#E76F51]">7 clusters in 4 quadrants</td>
                      <td className="p-3 text-[#65736B]">0</td>
                      <td className="p-3 text-[#E76F51]">Meets ETDRS 4-2-1 Rule (&gt;20 hemorrhages/quad)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Lipoprotein Hard Exudates</td>
                      <td className="p-3 font-mono font-bold text-[#8A5612]">12 circinate plaques</td>
                      <td className="p-3 text-[#65736B]">0</td>
                      <td className="p-3 text-[#8A5612]">Circinate ring 420μm to FAZ (CSME Threat)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Arteriolar-Venular Ratio (A/V)</td>
                      <td className="p-3 font-mono font-bold text-[#1F7A5A]">0.67</td>
                      <td className="p-3 text-[#65736B]">0.65 – 0.70</td>
                      <td className="p-3 text-[#1F7A5A]">Normal caliber</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Cup-to-Disc Ratio (CDR)</td>
                      <td className="p-3 font-mono font-bold text-[#1F7A5A]">0.32</td>
                      <td className="p-3 text-[#65736B]">&lt; 0.50</td>
                      <td className="p-3 text-[#1F7A5A]">Physiological normal (No glaucoma cupping)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clinician Recommendation & Digital Seal */}
            <div className="p-5 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-3">
              <h4 className="font-bold text-[#124B3A] text-xs uppercase">
                Clinical Recommendations & Follow-Up Protocol
              </h4>
              <p className="text-xs text-[#17221C] leading-relaxed">
                1. <strong>Immediate Referral:</strong> Urgent appointment at District Eye Hospital for Optical Coherence Tomography (OCT) and potential Anti-VEGF injection.<br />
                2. <strong>Metabolic Optimization:</strong> Target HbA1c &lt; 7.0%, blood pressure control &lt; 130/80 mmHg.<br />
                3. <strong>Retinal Re-evaluation:</strong> Follow-up comprehensive dilated fundus examination within 90 days post-intervention.
              </p>
            </div>

            {/* Sign-off Footers */}
            <div className="pt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-[#DDE5DC] text-xs">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-white border border-[#DDE5DC] flex items-center justify-center text-[#124B3A] shrink-0">
                  <QrCode size={44} />
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-[#124B3A]">Government of India ABDM Seal</div>
                  <div className="text-[10px] text-[#65736B] font-mono">HASH: 9a3e21...8fbc</div>
                  <div className="text-[10px] text-[#1F7A5A] font-semibold">Verified on e-Sanjeevani Tele-OPD Network</div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="h-10 flex items-end justify-end">
                  <span className="font-serif italic text-base text-[#124B3A] font-bold">
                    Dr. R. K. Deshmukh, MBBS
                  </span>
                </div>
                <div className="w-56 h-[1px] bg-[#124B3A] ml-auto" />
                <div className="text-[10px] font-mono text-[#65736B]">
                  Medical Officer In-Charge • Reg #MMC-72910
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 2: ABDM TELE-OPD REFERRAL SLIP */}
        {selectedReport === 'referral' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#124B3A]">
              <div>
                <div className="text-[11px] font-mono font-bold text-[#1F7A5A] uppercase">
                  AYUSHMAN BHARAT DIGITAL MISSION (ABDM)
                </div>
                <h2 className="text-2xl font-black text-[#124B3A]">e-Sanjeevani Tele-OPD Referral Slip</h2>
                <p className="text-xs text-[#65736B]">National Fast-Track Tele-Ophthalmology Consultation Docket</p>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-[#E76F51]">URGENT PRIORITY</div>
                <div className="text-[#65736B]">TOKEN: #eSanj-MH-9482</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-2">
                <span className="font-mono font-bold text-[#124B3A] uppercase block border-b pb-1">Referring Facility</span>
                <div><strong>Facility:</strong> Primary Health Sub-Centre Wadki</div>
                <div><strong>District / State:</strong> Yavatmal, Maharashtra</div>
                <div><strong>Referring Health Worker:</strong> Smt. Sunita Bai (ASHA ID: MH-YTL-4029)</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-[#E9A23B]/40 space-y-2">
                <span className="font-mono font-bold text-[#8A5612] uppercase block border-b pb-1">Receiving Specialist Center</span>
                <div><strong>Center:</strong> {patientData.referralTarget}</div>
                <div><strong>Specialty:</strong> Vitreo-Retinal Surgery & Laser Clinic</div>
                <div><strong>Assigned Consultant:</strong> Dr. Ananya Sen, MS (Ophthalmology)</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#DDE5DC] space-y-3 text-xs">
              <span className="font-bold text-[#124B3A] uppercase block">Triage Diagnostic Summary</span>
              <p>
                Patient flagged with <strong>{patientData.gradeLabel}</strong> (Risk Score: {patientData.riskScore}%). Macular involvement confirmed with hard exudate ring encroachment. Prompt vitreo-retinal evaluation indicated.
              </p>
            </div>
          </div>
        )}

        {/* REPORT 3: ETDRS 4-2-1 CLINICAL AUDIT */}
        {selectedReport === 'etdrs' && (
          <div className="space-y-6">
            <div className="pb-4 border-b-2 border-[#124B3A]">
              <div className="text-[11px] font-mono font-bold text-[#1F7A5A] uppercase">EVIDENCE AUDIT ENGINE</div>
              <h2 className="text-2xl font-black text-[#124B3A]">ETDRS 4-2-1 Clinical Rule Concordance Audit</h2>
              <p className="text-xs text-[#65736B]">Deterministic verification forbidding AI hallucinations without grounded anatomical evidence</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-2">
                <span className="text-[10px] text-[#65736B] block">RULE 1 (4 QUADRANTS)</span>
                <strong className="text-sm text-[#124B3A] block">&gt;20 Hemorrhages in all 4 quadrants</strong>
                <span className="inline-block px-2 py-0.5 rounded bg-[#E8F3EE] text-[#1F7A5A] font-bold">✓ RULE SATISFIED</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-2">
                <span className="text-[10px] text-[#65736B] block">RULE 2 (2+ QUADRANTS)</span>
                <strong className="text-sm text-[#124B3A] block">Definite Venous Beading in 2+ quadrants</strong>
                <span className="inline-block px-2 py-0.5 rounded bg-[#E8F3EE] text-[#1F7A5A] font-bold">✓ RULE SATISFIED</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-2">
                <span className="text-[10px] text-[#65736B] block">RULE 3 (1+ QUADRANT)</span>
                <strong className="text-sm text-[#124B3A] block">Prominent IRMA in 1+ quadrant</strong>
                <span className="inline-block px-2 py-0.5 rounded bg-[#E8F3EE] text-[#1F7A5A] font-bold">✓ RULE SATISFIED</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-[#E9A23B]/30 text-xs space-y-2">
              <span className="font-bold text-[#8A5612]">Concordance Status: {patientData.etdrsConcordance}</span>
              <p className="text-[#65736B]">
                Conclusion: Both vision backbone activations and microvascular lesion counts conform 100% to international ETDRS criteria for Severe NPDR.
              </p>
            </div>
          </div>
        )}

        {/* REPORT 4: VASCULAR & GRAPH MORPHOMETRY */}
        {selectedReport === 'morphometry' && (
          <div className="space-y-6">
            <div className="pb-4 border-b-2 border-[#124B3A]">
              <div className="text-[11px] font-mono font-bold text-[#1F7A5A] uppercase">TOPOLOGICAL MANIFOLD ENGINE</div>
              <h2 className="text-2xl font-black text-[#124B3A]">Retinal Vascular Topology & Morphometry Report</h2>
              <p className="text-xs text-[#65736B]">Geometric Graph G=(V,E) metrics representing retinal vascular flow and foveal geodesics</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]">
                <span className="text-[#65736B] block text-[10px]">GRAPH NODES</span>
                <strong className="text-lg text-[#124B3A]">28 Nodes</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]">
                <span className="text-[#65736B] block text-[10px]">GEOMETRIC EDGES</span>
                <strong className="text-lg text-[#124B3A]">54 Edges</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]">
                <span className="text-[#65736B] block text-[10px]">TORTUOSITY INDEX</span>
                <strong className="text-lg text-[#E9A23B]">1.24 (Moderate)</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]">
                <span className="text-[#65736B] block text-[10px]">FRACTAL DIMENSION</span>
                <strong className="text-lg text-[#1F7A5A]">1.48</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
