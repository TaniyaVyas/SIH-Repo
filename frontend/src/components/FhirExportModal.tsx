import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCode,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { generateFhirR4Bundle, downloadFhirR4Bundle, PatientDataForFhir } from '../utils/exportFhirR4Bundle';

interface FhirExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientData: PatientDataForFhir;
}

export const FhirExportModal: React.FC<FhirExportModalProps> = ({
  isOpen,
  onClose,
  patientData,
}) => {
  const [copied, setCopied] = useState(false);
  const bundle = generateFhirR4Bundle(patientData);
  const jsonString = JSON.stringify(bundle, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadFhirR4Bundle(patientData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-[#F8F6EF] border-b border-[#DDE5DC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#124B3A] text-white flex items-center justify-center shadow-xs">
                <FileCode size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-[#124B3A]">
                    HL7 FHIR R4 Diagnostic Document Bundle
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1F7A5A]/15 text-[#1F7A5A] border border-[#1F7A5A]/30">
                    ABDM Ready
                  </span>
                </div>
                <p className="text-xs text-[#65736B]">
                  Subject: <strong className="text-[#124B3A]">{patientData.patientCode}</strong> • Standard: NRCES India DiagnosticReportRecord Profile
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white border border-[#DDE5DC] text-[#65736B] hover:text-[#124B3A] flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            {/* Quick Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70">
                <span className="text-[#65736B] block text-[10px]">BUNDLE TYPE</span>
                <span className="font-bold text-[#124B3A]">document</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70">
                <span className="text-[#65736B] block text-[10px]">ENTRIES</span>
                <span className="font-bold text-[#124B3A]">5 Resources</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70">
                <span className="text-[#65736B] block text-[10px]">SECURITY</span>
                <span className="font-bold text-[#1F7A5A]">SHA-256 Digest</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70">
                <span className="text-[#65736B] block text-[10px]">INTEROP TARGET</span>
                <span className="font-bold text-[#8A5612]">e-Sanjeevani</span>
              </div>
            </div>

            {/* JSON Code Viewer */}
            <div className="relative rounded-2xl bg-[#08170F] border border-[#1F7A5A]/30 overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10 text-xs font-mono text-[#DDE5DC]">
                <span>bundle.json</span>
                <span>{jsonString.length} bytes</span>
              </div>
              <pre className="p-4 text-[11px] font-mono text-[#DDE5DC] overflow-x-auto max-h-[380px] custom-scrollbar leading-relaxed">
                <code>{jsonString}</code>
              </pre>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-[#F8F6EF] border-t border-[#DDE5DC] flex items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] font-mono text-[#65736B] flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#1F7A5A]" />
              <span>Compliant with Ayushman Bharat NDHM Specifications</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-[#DDE5DC] bg-white hover:bg-[#FAF4ED] text-[#124B3A] flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check size={14} className="text-[#1F7A5A]" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#124B3A] hover:bg-[#0E3C2E] text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Download size={14} />
                <span>Download .json Bundle</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
