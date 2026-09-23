import React, { useState } from 'react';
import { QrCode, PhoneCall, Building2, Calendar, FileText } from 'lucide-react';
import { ClinicalCase } from '../types';
import { TeleOpdDocketModal } from './TeleOpdDocketModal';

interface ReferralCardProps {
  clinicalCase: ClinicalCase;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ clinicalCase }) => {
  const [docketOpen, setDocketOpen] = useState(false);
  const isUrgent = clinicalCase.triageUrgency.includes('Urgent');
  const isRejected = clinicalCase.severityStage === 'Quality Rejected';

  const getUrgencyBadge = () => {
    if (isRejected) {
      return { bg: 'bg-[#FDF0EC]', text: 'text-[#E76F51]', border: 'border-[#F48C71]', label: 'Immediate Recapture Required' };
    }
    if (isUrgent) {
      return { bg: 'bg-[#FDF0EC]', text: 'text-[#E76F51]', border: 'border-[#F48C71]', label: 'Urgent Triage (1-2 Weeks)' };
    }
    if (clinicalCase.triageUrgency.includes('Elective')) {
      return { bg: 'bg-[#FCF5E9]', text: 'text-[#8A5612]', border: 'border-[#F3B964]', label: 'Elective Review (3-6 Months)' };
    }
    return { bg: 'bg-[#E8F3EE]', text: 'text-[#124B3A]', border: 'border-[#C8D4C7]', label: 'Routine Screening (12 Months)' };
  };

  const badge = getUrgencyBadge();

  return (
    <div className="rounded-2xl border-2 border-[#DDE5DC] bg-[#FFFFFF] p-6 shadow-warm-md relative overflow-hidden">
      {/* Top Banner with Ayushman Bharat branding */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#124B3A] font-display">
              Ayushman Bharat Digital Mission (ABDM)
            </span>
            <span className="text-[10px] bg-[#FFFDF8] border border-[#DDE5DC] text-[#1F7A5A] px-1.5 py-0.5 rounded font-mono">
              e-Sanjeevani Tier-1
            </span>
          </div>
          <h4 className="text-base font-bold text-[#17221C] mt-0.5">
            Ophthalmic Triage & Referral Slip
          </h4>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}>
          {badge.label}
        </div>
      </div>

      {/* Patient & Facility Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-[#DDE5DC] text-xs">
        <div>
          <div className="text-[#65736B]">Patient ABHA ID</div>
          <div className="font-mono font-bold text-[#124B3A] mt-0.5">{clinicalCase.abhaId}</div>
        </div>
        <div>
          <div className="text-[#65736B]">Demographics</div>
          <div className="font-semibold text-[#17221C] mt-0.5">
            {clinicalCase.age} Y / {clinicalCase.gender} ({clinicalCase.patientCode})
          </div>
        </div>
        <div>
          <div className="text-[#65736B]">Primary Facility</div>
          <div className="font-semibold text-[#17221C] truncate mt-0.5">
            {clinicalCase.healthCentre}
          </div>
        </div>
        <div>
          <div className="text-[#65736B]">Clinical Triage</div>
          <div className="font-semibold text-[#17221C] mt-0.5">
            {clinicalCase.severityStage}
          </div>
        </div>
      </div>

      {/* Referral Action Plan */}
      <div className="mt-4 flex flex-col md:flex-row gap-4 items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[#65736B]">
            Care Pathway Action Plan
          </div>
          <p className="text-xs text-[#17221C] leading-relaxed">
            {clinicalCase.notes}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-[#F8F6EF] border border-[#DDE5DC] text-[#124B3A]">
              <Building2 className="w-3.5 h-3.5 text-[#1F7A5A]" />
              <span>Direct District Hospital EHR Dispatch</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-[#F8F6EF] border border-[#DDE5DC] text-[#124B3A]">
              <PhoneCall className="w-3.5 h-3.5 text-[#E76F51]" />
              <span>Vernacular SMS to Patient Phone</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-[#F8F6EF] border border-[#DDE5DC] text-[#124B3A]">
              <Calendar className="w-3.5 h-3.5 text-[#E9A23B]" />
              <span>ASHA Re-check in Calendar</span>
            </div>
          </div>
        </div>

        {/* QR Code and Cryptographic Verification Seal */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] shrink-0 text-center w-full md:w-36">
          <QrCode className="w-16 h-16 text-[#124B3A]" />
          <span className="text-[10px] font-mono text-[#65736B] mt-1.5">
            VERIFIED ABDM
          </span>
          <span className="text-[9px] text-[#1F7A5A] font-bold">
            SHA-256 Signed
          </span>
        </div>
      </div>

      {/* Teleconsult Dispatch Callout if urgent */}
      {clinicalCase.teleConsultRequired && !isRejected && (
        <div className="mt-4 pt-3 border-t border-[#DDE5DC] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#9A3B24]">
            <span className="w-2 h-2 rounded-full bg-[#E76F51] animate-pulse" />
            <span className="font-semibold">e-Sanjeevani Tele-OPD Consultation Assigned</span>
          </div>
          <button
            onClick={() => setDocketOpen(true)}
            className="px-3 py-1 rounded-lg bg-[#124B3A] hover:bg-[#0E3C2E] text-[#FFFDF8] font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open Tele-OPD Docket</span>
          </button>
        </div>
      )}

      {/* Interactive Tele-OPD Clinical Docket Modal */}
      <TeleOpdDocketModal
        isOpen={docketOpen}
        onClose={() => setDocketOpen(false)}
        clinicalCase={clinicalCase}
      />
    </div>
  );
};
