import React, { useState } from 'react';
import { SectionHeading } from './SectionHeading';
import { Users, Eye, Clock, IndianRupee, Sparkles } from 'lucide-react';

export const ImpactCalculator: React.FC = () => {
  const [population, setPopulation] = useState<number>(250000);
  const [diabetesPrevalence, setDiabetesPrevalence] = useState<number>(11.4); // ICMR-INDIAB study benchmark
  const [screeningCoverage, setScreeningCoverage] = useState<number>(65);

  // Math Calculations
  const adultPopulation = Math.round(population * 0.65);
  const diabeticPopulation = Math.round(adultPopulation * (diabetesPrevalence / 100));
  const patientsScreened = Math.round(diabeticPopulation * (screeningCoverage / 100));
  
  // ~21% of diabetics have some DR
  const drCasesDetected = Math.round(patientsScreened * 0.21);
  // ~6.2% of screened have referable/sight-threatening DR
  const sightThreateningSaved = Math.round(patientsScreened * 0.062);
  // Specialist time saved: normal cases handled autonomously (each saves 15 mins)
  const specialistHoursSaved = Math.round((patientsScreened * 0.74 * 15) / 60);
  // Cost saved: ₹2,400 average travel + lost wage per rural visit avoided
  const rupeesSavedCrores = ((patientsScreened * 0.74 * 2400) / 10000000).toFixed(2);

  return (
    <section id="impact" className="py-20 md:py-28 bg-[#F8F6EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Real-World Rural Health Impact"
          title="Interactive District Health Impact Calculator"
          subtitle="Model the public health transformation of deploying RETINA-FUSION 360 across your district, taluk, or rural block health infrastructure."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls Panel */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DC] shadow-warm-md space-y-6">
            <h3 className="text-lg font-bold text-[#17221C] font-display flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#124B3A]" />
              <span>Configure Population Parameters</span>
            </h3>

            {/* Slider 1: Population */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[#17221C]">
                <span>Rural Block Population:</span>
                <span className="font-mono text-[#124B3A] font-bold">
                  {population.toLocaleString('en-IN')} citizens
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="1000000"
                step="25000"
                value={population}
                onChange={(e) => setPopulation(Number(e.target.value))}
                className="w-full h-2 bg-[#E7EEE6] rounded-lg appearance-none cursor-pointer accent-[#124B3A]"
              />
              <div className="flex justify-between text-[10px] text-[#65736B] font-mono">
                <span>50k (Sub-district)</span>
                <span>10 Lakhs (Full District)</span>
              </div>
            </div>

            {/* Slider 2: Diabetes Prevalence */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[#17221C]">
                <span>Adult Diabetes Prevalence:</span>
                <span className="font-mono text-[#E9A23B] font-bold">
                  {diabetesPrevalence}% (ICMR-INDIAB)
                </span>
              </div>
              <input
                type="range"
                min="6"
                max="24"
                step="0.5"
                value={diabetesPrevalence}
                onChange={(e) => setDiabetesPrevalence(Number(e.target.value))}
                className="w-full h-2 bg-[#E7EEE6] rounded-lg appearance-none cursor-pointer accent-[#E9A23B]"
              />
              <div className="flex justify-between text-[10px] text-[#65736B] font-mono">
                <span>6% (Low)</span>
                <span>24% (High Urban-Rural Fringe)</span>
              </div>
            </div>

            {/* Slider 3: Screening Coverage */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[#17221C]">
                <span>Annual Doorstep Screening Rate:</span>
                <span className="font-mono text-[#1F7A5A] font-bold">
                  {screeningCoverage}% of Diabetics
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                step="5"
                value={screeningCoverage}
                onChange={(e) => setScreeningCoverage(Number(e.target.value))}
                className="w-full h-2 bg-[#E7EEE6] rounded-lg appearance-none cursor-pointer accent-[#1F7A5A]"
              />
              <div className="flex justify-between text-[10px] text-[#65736B] font-mono">
                <span>20% (Baseline ASHA)</span>
                <span>95% (Intensive Saturation)</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#65736B] border-t border-[#DDE5DC] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1F7A5A]" />
              <span>Calculated using ICMR-INDIAB epidemiological ratios & NPCBVI triage norms.</span>
            </div>
          </div>

          {/* Results Display Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Patients Screened */}
            <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DC] shadow-warm-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#65736B] font-mono">
                  Screenings Delivered
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#E8F3EE] text-[#124B3A] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="my-4">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#124B3A] font-display">
                  {patientsScreened.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-[#65736B] mt-1">
                  Diabetic individuals evaluated at local Sub-Health Centres
                </div>
              </div>
              <div className="text-[11px] font-mono text-[#1F7A5A] font-bold">
                100% On-Device & ABDM Synced
              </div>
            </div>

            {/* Card 2: Sight-Threatening Cases Intervened */}
            <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DC] shadow-warm-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9A3B24] font-mono">
                  Vision Loss Prevented
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#FDF0EC] text-[#E76F51] flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="my-4">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#E76F51] font-display">
                  {sightThreateningSaved.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-[#65736B] mt-1">
                  Severe NPDR / DME cases flagged before irreversible blindness
                </div>
              </div>
              <div className="text-[11px] font-mono text-[#E76F51] font-bold">
                0% Missed Sight-Threatening Rate
              </div>
            </div>

            {/* Card 3: Specialist Hours Saved */}
            <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DC] shadow-warm-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8A5612] font-mono">
                  Ophthalmologist Hours Saved
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#FCF5E9] text-[#E9A23B] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="my-4">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#E9A23B] font-display">
                  {specialistHoursSaved.toLocaleString('en-IN')} hrs
                </div>
                <div className="text-xs text-[#65736B] mt-1">
                  Surgeon time freed up from routine non-referable triage
                </div>
              </div>
              <div className="text-[11px] font-mono text-[#8A5612] font-bold">
                74% Hospital OPD Burden Cut
              </div>
            </div>

            {/* Card 4: Economic Out-of-Pocket Savings */}
            <div className="p-6 rounded-3xl bg-[#124B3A] text-[#FFFDF8] border-2 border-[#0A2D22] shadow-warm-lg flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C8D4C7] font-mono">
                  Rural Out-of-Pocket Saved
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#1F7A5A] text-[#FFFDF8] flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="my-4">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#FFFDF8] font-display">
                  ₹{rupeesSavedCrores} Cr
                </div>
                <div className="text-xs text-[#DDE5DC] mt-1">
                  Avoided bus fares, lost wages, and unnecessary city consultations
                </div>
              </div>
              <div className="text-[11px] font-mono text-[#E9A23B] font-bold">
                Empowering Rural Indian Families
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
