import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

interface EvidenceItem {
  rule: string;
  status: 'Matched' | 'Violated' | 'Not Applicable';
  notes: string;
}

interface EvidenceCardProps {
  concordance: EvidenceItem[];
  icdrGrade: number;
  gradeLabel: string;
  macularInvolvement: boolean;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  concordance,
  icdrGrade,
  gradeLabel,
  macularInvolvement,
}) => {
  return (
    <div className="rounded-2xl border border-[#DDE5DC] bg-[#FFFFFF] p-6 shadow-warm-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#DDE5DC]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F3EE] flex items-center justify-center text-[#1F7A5A]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#17221C] font-display uppercase tracking-wider">
              Clinical Evidence Verification
            </h4>
            <p className="text-xs text-[#65736B]">
              International Clinical Diabetic Retinopathy (ICDR) / ETDRS Rule Audit
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-[#F8F6EF] text-[#124B3A] border border-[#DDE5DC]">
            ICDR Grade {icdrGrade}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold text-[#17221C] mb-3">
          Assigned Diagnosis: <span className="font-bold text-[#124B3A]">{gradeLabel}</span>
        </div>

        <div className="space-y-2.5">
          {concordance.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs transition-all ${
                item.status === 'Matched'
                  ? 'bg-[#FFFDF8] border-[#DDE5DC]'
                  : 'bg-[#FDF0EC] border-[#F48C71]'
              }`}
            >
              <div className="flex items-start gap-2">
                {item.status === 'Matched' ? (
                  <CheckCircle className="w-4 h-4 text-[#1F7A5A] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#E76F51] shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-[#17221C]">{item.rule}</div>
                  <div className="text-[11px] text-[#65736B] mt-0.5 leading-relaxed">{item.notes}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {macularInvolvement && (
          <div className="mt-4 p-3 rounded-xl bg-[#FDF0EC] border border-[#F48C71] flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E76F51] animate-ping" />
            <div className="text-xs text-[#9A3B24]">
              <span className="font-bold">Macular Edema Alert:</span> Hard exudate ring within 1 disc diameter of foveal center. High priority for anti-VEGF / focal laser evaluation.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
