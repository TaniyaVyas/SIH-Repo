import React from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Footer: React.FC = () => {
  const { t } = useAuth();

  return (
    <footer className="bg-[#17221C] text-[#FFFDF8] pt-16 pb-12 border-t border-[#3A4840]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[#3A4840]">
          {/* Col 1 & 2: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#124B3A] flex items-center justify-center text-[#FFFDF8] border border-[#1F7A5A]">
                <Eye className="w-5 h-5 text-[#FFFDF8]" />
              </div>
              <span className="text-xl font-extrabold font-display tracking-tight text-[#FFFDF8]">
                RETINA-FUSION <span className="text-[#1F7A5A]">360</span>
              </span>
            </div>
            
            <p className="text-sm text-[#C8D4C7] max-w-sm leading-relaxed">
              {t.footer.tagline}
            </p>

            <p className="text-xs text-[#8E9E95] max-w-md leading-relaxed">
              {t.footer.subTagline}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A2D22] border border-[#1F7A5A] text-xs font-mono text-[#E9A23B]">
              <Sparkles className="w-3.5 h-3.5 text-[#E76F51]" />
              <span>{t.footer.missionBadge}</span>
            </div>
          </div>

          {/* Col 3: Architecture Modules */}
          <div className="space-y-3 text-xs">
            <div className="font-bold text-[#FFFDF8] uppercase tracking-wider font-mono text-sm text-[#1F7A5A]">
              {t.footer.modulesTitle}
            </div>
            <ul className="space-y-1.5 text-[#C8D4C7]">
              <li>M01: {t.nav.imageAcquisition}</li>
              <li>M02: {t.nav.preprocessing}</li>
              <li>M03: {t.nav.retinalAnatomy}</li>
              <li>M04: {t.nav.lesionDetection}</li>
              <li>M05: {t.nav.retinalGraph}</li>
              <li>M06: {t.nav.drClassification}</li>
              <li>M07: {t.nav.explainability}</li>
              <li>M08: {t.nav.evidenceVerification}</li>
              <li>M09: {t.nav.selfAwareAI}</li>
              <li>M10: {t.nav.trustReject}</li>
              <li>M11: {t.nav.referralCare}</li>
            </ul>
          </div>

          {/* Col 4: Standards & Protocols */}
          <div className="space-y-3 text-xs">
            <div className="font-bold text-[#FFFDF8] uppercase tracking-wider font-mono text-sm text-[#E9A23B]">
              {t.footer.protocolsTitle}
            </div>
            <ul className="space-y-1.5 text-[#C8D4C7]">
              <li>Early Treatment DR Study (ETDRS)</li>
              <li>International Clinical DR (ICDR) Scale</li>
              <li>Ayushman Bharat Digital Mission (ABDM)</li>
              <li>e-Sanjeevani National Tele-OPD</li>
              <li>National Blindness Control (NPCBVI)</li>
              <li>HL7 FHIR R4 DiagnosticReport</li>
              <li>ISO 10940:2009 Ophthalmic Standards</li>
            </ul>
          </div>

          {/* Col 5: Edge Architecture */}
          <div className="space-y-3 text-xs">
            <div className="font-bold text-[#FFFDF8] uppercase tracking-wider font-mono text-sm text-[#E76F51]">
              {t.footer.edgeTitle}
            </div>
            <ul className="space-y-1.5 text-[#C8D4C7]">
              <li>Raspberry Pi 5 & Jetson INT8</li>
              <li>TensorRT & ONNX Runtime</li>
              <li>Sub-1.8s Complete Pipeline</li>
              <li>28.6 MB Total Memory Footprint</li>
              <li>100% Offline PWA & SQLite Cache</li>
              <li>Monte Carlo Epistemic Gating</li>
              <li>Asymmetric Zero False-Negative Loss</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Clinical AI Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8E9E95]">
          <div>
            {t.footer.copyright}
          </div>

          {/* Strict Medical Disclaimer */}
          <div className="text-center md:text-right max-w-xl text-[11px] leading-tight text-[#C8D4C7]">
            <span className="font-bold text-[#E9A23B]">{t.footer.clinicalNotice}</span> {t.footer.disclaimer}
          </div>
        </div>
      </div>
    </footer>
  );
};
