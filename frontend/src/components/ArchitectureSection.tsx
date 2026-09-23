import React, { useState } from 'react';
import { ARCHITECTURE_PILLARS } from '../data/architectureData';
import { SectionHeading } from './SectionHeading';
import { 
  Database, Cpu, LayoutDashboard, Share2, Repeat, 
  Lightbulb, BarChart3, HeartHandshake, CheckCircle2, ArrowRight, ShieldCheck
} from 'lucide-react';
import { ArchitecturePillar } from '../types';

export const ArchitectureSection: React.FC = () => {
  const [activePillarId, setActivePillarId] = useState<string>('key-innovations');

  const activePillar: ArchitecturePillar = ARCHITECTURE_PILLARS.find(p => p.id === activePillarId) || ARCHITECTURE_PILLARS[0];

  const getPillarIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Database': return <Database className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'LayoutDashboard': return <LayoutDashboard className={className} />;
      case 'Share2': return <Share2 className={className} />;
      case 'Repeat': return <Repeat className={className} />;
      case 'Lightbulb': return <Lightbulb className={className} />;
      case 'BarChart3': return <BarChart3 className={className} />;
      case 'HeartHandshake': return <HeartHandshake className={className} />;
      default: return <Cpu className={className} />;
    }
  };

  return (
    <section id="architecture" className="py-20 md:py-28 bg-[#F8F6EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Image 2: System Architecture & Ecosystem"
          title="The Complete Ecosystem Architecture"
          subtitle="Beyond the core AI classifier — an integrated clinical ecosystem engineered for nationwide deployment, rural accessibility, national digital health integration, and continuous safety."
        />

        {/* 8-Pillar Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-10">
          {ARCHITECTURE_PILLARS.map((pillar) => {
            const isActive = activePillarId === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setActivePillarId(pillar.id)}
                className={`p-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center ${
                  isActive
                    ? 'bg-[#124B3A] text-[#FFFDF8] border-[#124B3A] shadow-warm-md scale-105'
                    : 'bg-[#FFFFFF] text-[#17221C] border-[#DDE5DC] hover:border-[#1F7A5A] hover:bg-[#FFFDF8]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${
                    isActive ? 'bg-[#1F7A5A] text-[#FFFDF8]' : 'bg-[#F8F6EF] text-[#124B3A]'
                  }`}
                >
                  {getPillarIcon(pillar.icon, "w-5 h-5")}
                </div>
                <span className="text-[11px] font-bold font-display line-clamp-2 leading-tight">
                  {pillar.title.split('&')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Pillar Full Deep-Dive Showcase Card */}
        <div className="rounded-3xl border-2 border-[#DDE5DC] bg-[#FFFFFF] shadow-warm-xl overflow-hidden">
          {/* Header Banner */}
          <div className="p-6 md:p-8 bg-[#FFFDF8] border-b border-[#DDE5DC] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#124B3A] flex items-center justify-center text-[#FFFDF8] shadow-warm-md shrink-0">
                {getPillarIcon(activePillar.icon, "w-7 h-7 text-[#FFFDF8]")}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#E8F3EE] text-[#124B3A] border border-[#C8D4C7]">
                    SYSTEM ARCHITECTURE LAYER
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-[#17221C] font-display">
                  {activePillar.title}
                </h3>
                <p className="text-sm font-medium text-[#E76F51]">
                  {activePillar.subtitle}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {activePillar.badges.map((b, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#F8F6EF] text-[#124B3A] border border-[#DDE5DC]"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Summary */}
            <p className="text-base text-[#17221C] leading-relaxed">
              {activePillar.summary}
            </p>

            {/* Key Components 3-Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activePillar.keyComponents.map((comp, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#124B3A] font-display">
                        {comp.name}
                      </h4>
                    </div>
                    <p className="text-xs text-[#17221C] leading-relaxed">
                      {comp.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Metrics & Rural Advantage Split */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              {/* Telemetry Metrics */}
              <div className="md:col-span-6 p-5 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#65736B] font-display mb-3">
                  Key Architectural Metrics & Specifications
                </h4>
                <div className="space-y-2.5 text-xs">
                  {activePillar.metricsOrSpecs.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFFFF] border border-[#DDE5DC]">
                      <span className="text-[#65736B]">{m.label}</span>
                      <span className="font-bold font-mono text-[#124B3A]">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rural Healthcare Advantage */}
              <div className="md:col-span-6 p-5 rounded-2xl bg-[#E8F3EE] border border-[#C8D4C7] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#124B3A] font-display mb-2">
                    <ShieldCheck className="w-4 h-4 text-[#1F7A5A]" />
                    <span>Indian Rural Healthcare Advantage</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#17221C] leading-relaxed mt-1">
                    {activePillar.ruralAdvantage}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#C8D4C7] flex items-center justify-between text-[11px] font-mono text-[#124B3A]">
                  <span>National Health Stack</span>
                  <span className="font-bold">ABDM Scale Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
