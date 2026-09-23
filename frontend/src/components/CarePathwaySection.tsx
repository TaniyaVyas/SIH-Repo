import React from 'react';
import { SectionHeading } from './SectionHeading';
import { 
  Home, Smartphone, Cpu, ShieldCheck, Share2, 
  Hospital, PhoneCall, ArrowRight, UserCheck, CheckCircle
} from 'lucide-react';

export const CarePathwaySection: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Village Doorstep Screening",
      role: "ASHA Health Worker",
      icon: <Smartphone className="w-5 h-5 text-[#124B3A]" />,
      desc: "ASHA worker snaps non-mydriatic 45° fundus image using low-cost smartphone optical attachment at the village Sub-Health Centre.",
      tag: "Point-of-Care"
    },
    {
      num: "02",
      title: "1.6s Offline AI Inference",
      role: "On-Device Edge Engine",
      icon: <Cpu className="w-5 h-5 text-[#1F7A5A]" />,
      desc: "Full 11-module pipeline executes completely on-device without internet. Real-time feedback ensures scan quality before patient leaves.",
      tag: "100% Offline"
    },
    {
      num: "03",
      title: "ABDM Health Locker Sync",
      role: "National Health Stack",
      icon: <Share2 className="w-5 h-5 text-[#E9A23B]" />,
      desc: "Report, vessel graphs, and diagnostic code are cryptographically associated with patient's Ayushman Bharat Health Account (ABHA).",
      tag: "ABDM Ready"
    },
    {
      num: "04",
      title: "e-Sanjeevani Tele-Review",
      role: "District Ophthalmologist",
      icon: <Hospital className="w-5 h-5 text-[#E76F51]" />,
      desc: "Borderline or severe cases are escalated instantly to government tele-ophthalmologists with pre-highlighted lesion evidence.",
      tag: "Tele-OPD"
    },
    {
      num: "05",
      title: "Intervention & Vernacular SMS",
      role: "Patient & Care Loop",
      icon: <PhoneCall className="w-5 h-5 text-[#124B3A]" />,
      desc: "Patient receives automated WhatsApp/SMS in local language (Hindi, Tamil, Telugu, etc.); ASHA worker receives follow-up reminder.",
      tag: "Care Complete"
    }
  ];

  return (
    <section id="pathway" className="py-20 md:py-28 bg-[#FFFDF8] border-b border-[#DDE5DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Module 11: Rural Referral & Care Pathway"
          title="From Village Sub-Centre to Tertiary Eye Care"
          subtitle="A diagnosis is useless without a care pathway. RETINA-FUSION 360 bridges the last mile between 600,000+ Indian villages and super-specialist eye surgeons."
        />

        {/* 5-Step Horizontal Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DC] shadow-warm-sm flex flex-col justify-between hover:border-[#1F7A5A] transition-all hover:shadow-warm-md"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
                  <span className="text-xl font-extrabold font-display text-[#124B3A]">
                    {step.num}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#F8F6EF] flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-[#E8F3EE] text-[#1F7A5A]">
                    {step.tag}
                  </span>
                  <h4 className="text-sm font-bold text-[#17221C] font-display mt-1.5">
                    {step.title}
                  </h4>
                  <div className="text-[11px] font-medium text-[#E76F51] mb-2">
                    {step.role}
                  </div>
                  <p className="text-xs text-[#65736B] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DDE5DC] text-[10px] font-mono text-[#65736B] flex items-center justify-between">
                <span>Phase {step.num}</span>
                <CheckCircle className="w-3.5 h-3.5 text-[#1F7A5A]" />
              </div>
            </div>
          ))}
        </div>

        {/* Urgency Stratification Triage Matrix */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#F8F6EF] border border-[#DDE5DC]">
          <h4 className="text-base font-bold text-[#17221C] font-display mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#124B3A]" />
            <span>National Triage Stratification Standards (NPCBVI Aligned)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DDE5DC]">
              <div className="flex items-center justify-between font-bold text-[#124B3A] mb-1">
                <span>Routine Triage</span>
                <span className="font-mono text-[11px]">12 Months</span>
              </div>
              <div className="text-[#65736B]">
                Grade 0 (No DR). Optimal glycemic control counseling at village Sub-Health Centre.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DDE5DC]">
              <div className="flex items-center justify-between font-bold text-[#8A5612] mb-1">
                <span>Elective Review</span>
                <span className="font-mono text-[11px]">3 - 6 Months</span>
              </div>
              <div className="text-[#65736B]">
                Grade 1 (Mild NPDR) or Grade 2 without macular threat. Primary Health Centre follow-up.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DDE5DC]">
              <div className="flex items-center justify-between font-bold text-[#9A3B24] mb-1">
                <span>Urgent Referral</span>
                <span className="font-mono text-[11px]">1 - 2 Weeks</span>
              </div>
              <div className="text-[#65736B]">
                Grade 3 (Severe NPDR) or Hard Exudates near Macula. Direct District Hospital laser slot.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DDE5DC]">
              <div className="flex items-center justify-between font-bold text-[#E76F51] mb-1">
                <span>Emergency Surgery</span>
                <span className="font-mono text-[11px]">48 Hours</span>
              </div>
              <div className="text-[#65736B]">
                Grade 4 (Proliferative DR) with active vitreous hemorrhage or retinal detachment risk.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
