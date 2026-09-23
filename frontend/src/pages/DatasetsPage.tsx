import React from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { ARCHITECTURE_PILLARS } from '../data/architectureData';
import { Database, Layers, CheckCircle2, Globe, BarChart2 } from 'lucide-react';

export const DatasetsPage: React.FC = () => {
  const datasetPillar = ARCHITECTURE_PILLARS.find(p => p.id === 'datasets-training');

  const cohorts = [
    { name: 'EyePACS Benchmark', samples: '88,702 Scans', pop: 'Global Diverse', role: 'Foundation Pretraining' },
    { name: 'IDRiD (Indian Diabetic Retinopathy)', samples: '516 High-Res', pop: 'Indian Subcontinent', role: 'Lesion Pixel-Level Ground Truth' },
    { name: 'Messidor & Messidor-2', samples: '1,748 Scans', pop: 'European Multi-Center', role: 'Clinical Validation Benchmark' },
    { name: 'DDR Dataset', samples: '13,673 Scans', pop: 'Asian Cohort', role: 'Multi-Lesion Segmentation' },
    { name: 'Rural PHC Indian Field Cohort', samples: '12,450 Scans', pop: 'Rural Maharashtra & Tamil Nadu', role: 'Low-Cost Optical Field Tuning' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10 pb-16">
      <SectionHeading
        badge="System Architecture Pillar 1"
        title="Datasets & Multi-Cohort Training Pipeline"
        subtitle="Addressing clinical AI bias by training across international open-access benchmarks and authentic rural Indian primary health centre cohorts."
      />

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Datasets Table */}
        <div className="lg:col-span-8 bg-[#FFFDF8] rounded-2xl border border-[#DDE5DC] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-[#124B3A]" />
              <h3 className="text-sm font-bold text-[#124B3A] uppercase tracking-wide">
                Training & Validation Demographic Cohorts
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1F7A5A]/10 text-[#1F7A5A] font-bold">
              117,000+ Total Images
            </span>
          </div>

          <div className="space-y-3">
            {cohorts.map((c, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-[#124B3A]">{c.name}</h4>
                  <div className="text-[11px] text-[#65736B]">{c.pop} • {c.role}</div>
                </div>
                <div className="font-mono text-xs font-bold text-[#1F7A5A] px-2.5 py-1 rounded-lg bg-white border border-[#DDE5DC] whitespace-nowrap">
                  {c.samples}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Contrastive Multi-Task Loss Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#DDE5DC] p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide pb-2 border-b border-[#DDE5DC]">
              Loss Function Formulation
            </h4>

            <div className="p-3 rounded-xl bg-[#F8F6EF] font-mono text-[11px] text-[#124B3A] space-y-1">
              <div>L_total = λ1 L_ordinal</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ λ2 L_topological</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ λ3 L_contrastive</div>
            </div>

            <p className="text-xs text-[#65736B] leading-relaxed">
              Ordinal cross-entropy penalizes distant misclassifications (e.g. predicting Grade 0 for a Grade 3 patient) far more severely than adjacent class errors, ensuring high patient safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
