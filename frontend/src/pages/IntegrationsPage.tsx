import React from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { Share2, ShieldCheck, HeartPulse, Building2, CheckCircle2 } from 'lucide-react';

export const IntegrationsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10 pb-16">
      <SectionHeading
        badge="System Architecture Pillar 4"
        title="External Healthcare Integrations & Standards"
        subtitle="National digital health integration compliant with Ayushman Bharat Digital Mission (ABDM), e-Sanjeevani tele-consultations, and HL7 FHIR R4."
      />

      <div className="grid md:grid-cols-2 gap-6">
        {[
          {
            title: 'Ayushman Bharat Health Account (ABHA ID)',
            desc: 'Links screening results to 14-digit national ABHA ID. Enables patients to retain their longitudinal ophthalmic health records across public and private hospitals.',
            tag: 'ABDM Milestones 1–3 Compliant',
          },
          {
            title: 'e-Sanjeevani National Tele-Consultation',
            desc: 'Automated referral ticket generation directly initiates high-priority tele-ophthalmology sessions between ASHA workers and district hospital ophthalmologists.',
            tag: 'API Integrated',
          },
          {
            title: 'HL7 FHIR R4 & DICOM Encapsulation',
            desc: 'Standardized DiagnosticReport resources containing structured lesion coordinates, ICDR grade, and base64 encoded retinal vessel segmentations.',
            tag: 'Interoperability Standard',
          },
          {
            title: 'PM-JAY Tertiary Hospital Triage',
            desc: 'Flags patients eligible for cashless vitrectomy and anti-VEGF therapy under the Ayushman Bharat PM-JAY national health protection scheme.',
            tag: 'Social Protection Linkage',
          },
        ].map((item, idx) => (
          <div key={idx} className="bg-[#FFFDF8] rounded-2xl border border-[#DDE5DC] p-6 shadow-sm space-y-3">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1F7A5A]/10 text-[#1F7A5A]">
              {item.tag}
            </span>
            <h3 className="font-bold text-base text-[#124B3A]">{item.title}</h3>
            <p className="text-xs text-[#65736B] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
