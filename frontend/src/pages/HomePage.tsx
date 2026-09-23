import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Retina3DCanvas } from '../components/home/Retina3DCanvas';
import { FloatingAIJourney } from '../components/home/FloatingAIJourney';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  Play,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Activity,
  Sparkles,
  Layers,
  Network,
  Crosshair,
  Hospital,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ExternalLink,
  Target,
  FileCheck,
  Camera,
  Eye,
  BrainCircuit
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAuth();
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const journeySectionRef = useRef<HTMLDivElement>(null);
  const isReducedMotion = useRef(false);

  useEffect(() => {
    isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const localizedJourneyStages = useMemo(() => [
    {
      id: 'stage-acquisition',
      step: '01',
      moduleNumber: 'M1',
      name: 'Acquisition',
      sublabel: 'Optical Capture',
      title: t.journey.stage1Title,
      desc: t.journey.stage1Desc,
      route: '/acquisition',
      icon: Camera,
      badge: '50° FOV • 24-bit RGB',
      highlights: ['Non-Mydriatic (No Drops)', '45° Field of View', 'Corneal Glare Filter'],
      telemetry: 'CLAHE Dynamic Range: 88 SNR | Clarity: 94% Gradable',
    },
    {
      id: 'stage-quality',
      step: '02',
      moduleNumber: 'M2',
      name: 'Quality',
      sublabel: 'ISO 10940 Gate',
      title: 'ISO-10940 Optical Quality & Gradability Assurance',
      desc: 'Real-time assessment for motion blur, field illumination homogeneity, corneal glare, and media opacities preventing ungradable scans.',
      route: '/preprocessing',
      icon: ShieldCheck,
      badge: '94% Gradable Pass',
      highlights: ['ISO 10940 Standards', 'Real-Time Blur Triage', 'Illumination Homogeneity'],
      telemetry: 'Dynamic Range: 88 SNR | Clarity: 94% Gradable | Artifacts: 0',
    },
    {
      id: 'stage-anatomy',
      step: '03',
      moduleNumber: 'M3',
      name: 'Anatomy',
      sublabel: t.journey.stage2Sub,
      title: t.journey.stage2Title,
      desc: t.journey.stage2Desc,
      route: '/anatomy',
      icon: Eye,
      badge: '96.8% Dice Score',
      highlights: ['U-Net Attention Gate', 'Optic Disc / Cup (CDR)', 'A/V Ratio: 0.67 Normal'],
      telemetry: 'Cup-to-Disc: 0.42 Normal | FAZ Caliber: 480μm',
    },
    {
      id: 'stage-lesions',
      step: '04',
      moduleNumber: 'M4',
      name: 'Lesions',
      sublabel: t.journey.stage3Sub,
      title: t.journey.stage3Title,
      desc: t.journey.stage3Desc,
      route: '/lesions',
      icon: Crosshair,
      badge: '4-Quadrant ETDRS',
      highlights: ['Microaneurysms (MA)', 'Blot Hemorrhages', 'Hard Exudates (Lipids)'],
      telemetry: '7 Microaneurysms | 3 Hemorrhages | 12 Hard Exudates',
    },
    {
      id: 'stage-graph',
      step: '05',
      moduleNumber: 'M5',
      name: 'Graph Engine',
      sublabel: t.journey.stage4Sub,
      title: t.journey.stage4Title,
      desc: t.journey.stage4Desc,
      route: '/retinal-graph',
      icon: Network,
      badge: '28 Nodes • 54 Edges',
      highlights: ['Graph Neural Network', 'Vascular Tortuosity Index', 'Bifurcation Angles'],
      telemetry: 'Tortuosity: 1.14 Normal | Branching Fractal Dimension: 1.68',
    },
    {
      id: 'stage-grading',
      step: '06',
      moduleNumber: 'M6',
      name: 'Grading',
      sublabel: t.journey.stage5Sub,
      title: t.journey.stage5Title,
      desc: t.journey.stage5Desc,
      route: '/classification',
      icon: BrainCircuit,
      badge: 'Grade 3 • 94% Conf',
      highlights: ['5-Tier International Scale', 'Dual Consensus', 'Calibrated Confidence'],
      telemetry: 'Primary: Grade 3 (Severe NPDR) | Consensus Match: 98.6%',
    },
    {
      id: 'stage-explainability',
      step: '07',
      moduleNumber: 'M7',
      name: 'Explainability',
      sublabel: 'Multimodal XAI',
      title: 'Multimodal Explainability & Clinical Grounding',
      desc: 'Deterministic clinical criteria, attention saliency heatmaps, and ETDRS rule auditing to verify every AI decision.',
      route: '/explainability',
      icon: Sparkles,
      badge: 'Relational Saliency',
      highlights: ['Multimodal Saliency', 'ETDRS 4-2-1 Verification', 'Counterfactual Explanations'],
      telemetry: 'Rule Check: 4/4 Quadrants Verified | Heatmaps: Active',
    },
    {
      id: 'stage-care',
      step: '08',
      moduleNumber: 'M8',
      name: 'Care Cockpit',
      sublabel: 'ABDM & Tele-OPD',
      title: 'Care Cockpit & National Tele-OPD Referral',
      desc: 'National ABDM e-Sanjeevani referral docket, verified prescription, and follow-up care for rural health centers.',
      route: '/care',
      icon: Hospital,
      badge: 'ABHA & e-Sanjeevani',
      highlights: ['ABDM e-Sanjeevani Tele-OPD', 'ABHA Verified Docket', 'Specialist Referral Slip'],
      telemetry: 'ABHA ID: 91-4820-8192 | E-Referral Status: Ready',
    },
  ], [t]);

  // Sync event listener from FloatingAIJourney
  useEffect(() => {
    const handleSelectStage = (e: any) => {
      if (e.detail && typeof e.detail.index === 'number') {
        setActiveStageIndex(e.detail.index);
      }
    };
    window.addEventListener('select-journey-stage', handleSelectStage);
    return () => window.removeEventListener('select-journey-stage', handleSelectStage);
  }, []);

  // Track scroll position across the 8 journey stages with high-performance IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = localizedJourneyStages.findIndex(s => s.id === entry.target.id);
            if (idx !== -1) {
              setActiveStageIndex(idx);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0.1,
      }
    );

    localizedJourneyStages.forEach((stage) => {
      const el = document.getElementById(stage.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [localizedJourneyStages]);

  const scrollToStage = (index: number) => {
    setActiveStageIndex(index);
    window.dispatchEvent(
      new CustomEvent('sync-journey-stage', { detail: { stageId: index + 1 } })
    );
    const stageId = localizedJourneyStages[index]?.id;
    const el = document.getElementById(stageId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 130;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const scrollToJourneyStart = () => {
    const el = document.getElementById('journey-start');
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 130;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-x-clip min-h-screen bg-[#F8F6EF]">
      {/* ─── PERMANENT FLOATING AI JOURNEY (Homepage Bar, Floating Like Navigation Bar) ─── */}
      <FloatingAIJourney />
      {/* ─── SECTION 1: CINEMATIC HERO ─── */}
      <section className="relative min-h-[92vh] flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Parallax Background Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute top-1/4 left-1/10 w-72 h-72 rounded-full bg-[#1F7A5A]/10 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/10 w-96 h-96 rounded-full bg-[#E9A23B]/10 blur-3xl" />
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column: Headline & Calls to Action */}
          <div className="lg:col-span-6 space-y-6">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFDF8] border border-[#DDE5DC] shadow-xs text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#1F7A5A] animate-ping" />
              <span className="font-bold text-[#124B3A]">{t.hero.badge}</span>
              <span className="text-[#65736B]">• {t.hero.badgeSub}</span>
            </div>

            {/* Main Cinematic Heading */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#124B3A] leading-[1.08]">
                {t.hero.heading1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#124B3A] via-[#1F7A5A] to-[#E76F51]">
                  {t.hero.headingAccent}
                </span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-base sm:text-lg font-medium text-[#65736B] leading-relaxed max-w-xl">
              {t.hero.subheading}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-[#FFFDF8] font-bold text-sm shadow-lg shadow-[#124B3A]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2.5 group"
                data-cursor="button"
              >
                <Play size={16} className="fill-[#FFFDF8]" />
                <span>{t.hero.launchScreening}</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={scrollToJourneyStart}
                className="px-6 py-3.5 rounded-2xl bg-[#FFFDF8] hover:bg-white text-[#124B3A] border border-[#DDE5DC] hover:border-[#1F7A5A]/50 font-bold text-sm shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-2"
                data-cursor="button"
              >
                <Sparkles size={16} className="text-[#E9A23B]" />
                <span>{t.hero.exploreJourney}</span>
                <ChevronDown size={14} className="text-[#65736B]" />
              </button>
            </div>

            {/* Supporting Micro-Indicators */}
            <div className="pt-4 flex flex-wrap gap-4 text-xs font-mono text-[#65736B]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#1F7A5A]" /> {t.hero.offlineBadge}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#1F7A5A]" /> {t.hero.ruralBadge}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#1F7A5A]" /> {t.hero.etdrsBadge}
              </span>
            </div>
          </div>

          {/* Right Column: 3D Interactive Retina Visualization */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-[540px] rounded-3xl bg-gradient-to-br from-[#06150F] via-[#092218] to-[#040D09] p-2 border border-[#1F7A5A]/40 shadow-2xl shadow-[#124B3A]/20 overflow-hidden">
              <Retina3DCanvas scrollStage={activeStageIndex} />

              {/* Floating Real-Time HUD Badges */}
              <div className="absolute top-5 left-5 px-3 py-1.5 rounded-xl bg-[#06150F]/85 backdrop-blur-md border border-[#1F7A5A]/40 text-[11px] font-mono text-[#FFFDF8] shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1F7A5A] animate-pulse" />
                <span>3D Retinal Manifold Active</span>
              </div>

              <div className="absolute bottom-5 right-5 px-3 py-1.5 rounded-xl bg-[#06150F]/85 backdrop-blur-md border border-[#DDE5DC]/20 text-[10px] font-mono text-[#FFFDF8] flex items-center gap-2 shadow-lg">
                <span className="text-[#E9A23B]">●</span>
                <span>360° Drag & Orbit Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { metric: t.hero.metric1, label: t.hero.metric1Label, sub: t.hero.metric1Sub },
            { metric: t.hero.metric2, label: t.hero.metric2Label, sub: t.hero.metric2Sub },
            { metric: t.hero.metric3, label: t.hero.metric3Label, sub: t.hero.metric3Sub },
            { metric: t.hero.metric4, label: t.hero.metric4Label, sub: t.hero.metric4Sub },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-xs hover:border-[#1F7A5A]/30 transition-all"
            >
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#124B3A]">
                {item.metric}
              </div>
              <div className="text-xs font-bold text-[#17221C] mt-1">{item.label}</div>
              <div className="text-[10px] font-mono text-[#65736B]">{item.sub}</div>
            </div>
          ))}
        </div>

        {/* ─── 5 FOUNDATIONAL INNOVATION PILLARS (First 5 Seconds Impact) ─── */}
        <div className="mt-6 p-5 rounded-3xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-sm motion-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#DDE5DC] gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#65736B]">
              {t.hero.pillarsHeader}
            </span>
            <span className="text-[10px] font-mono font-bold text-[#1F7A5A] px-2.5 py-0.5 rounded bg-[#E8F3EE] w-fit">
              {t.hero.pillarsBadge}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            {/* Pillar 1: Structure */}
            <div className="p-3 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]/70 space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#124B3A] block uppercase">
                {t.hero.pillar1Title}
              </span>
              <h4 className="font-black text-[#124B3A]">{t.hero.pillar1Name}</h4>
              <p className="text-[10px] text-[#65736B] leading-tight">
                {t.hero.pillar1Desc}
              </p>
            </div>

            {/* Pillar 2: Evidence */}
            <div className="p-3 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]/70 space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#1F7A5A] block uppercase">
                {t.hero.pillar2Title}
              </span>
              <h4 className="font-black text-[#1F7A5A]">{t.hero.pillar2Name}</h4>
              <p className="text-[10px] text-[#65736B] leading-tight">
                {t.hero.pillar2Desc}
              </p>
            </div>

            {/* Pillar 3: Explainability */}
            <div className="p-3 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]/70 space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#E9A23B] block uppercase">
                {t.hero.pillar3Title}
              </span>
              <h4 className="font-black text-[#8A5612]">{t.hero.pillar3Name}</h4>
              <p className="text-[10px] text-[#65736B] leading-tight">
                {t.hero.pillar3Desc}
              </p>
            </div>

            {/* Pillar 4: Trust */}
            <div className="p-3 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]/70 space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#E76F51] block uppercase">
                {t.hero.pillar4Title}
              </span>
              <h4 className="font-black text-[#E76F51]">{t.hero.pillar4Name}</h4>
              <p className="text-[10px] text-[#65736B] leading-tight">
                {t.hero.pillar4Desc}
              </p>
            </div>

            {/* Pillar 5: Rural Accessibility */}
            <div className="p-3 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC]/70 space-y-1 col-span-2 sm:col-span-1 lg:col-span-1">
              <span className="text-[10px] font-mono font-bold text-[#124B3A] block uppercase">
                {t.hero.pillar5Title}
              </span>
              <h4 className="font-black text-[#124B3A]">{t.hero.pillar5Name}</h4>
              <p className="text-[10px] text-[#65736B] leading-tight">
                {t.hero.pillar5Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: PERMANENT SPOT FOR AI JOURNEY & STORYTELLING (8 STAGES) ─── */}
      <div id="journey-start" ref={journeySectionRef} className="relative py-12 border-t border-[#DDE5DC] space-y-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#FAF4ED] text-[#8A5612] border border-[#E9A23B]/30 uppercase">
              {t.journey.trackBadge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#124B3A] tracking-tight">
              {t.journey.title}
            </h2>
            <p className="text-sm text-[#65736B] max-w-2xl mx-auto">
              {t.journey.desc}
            </p>
          </div>

          {/* ─── INTERACTIVE STAGE STEPPER PILLS ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {localizedJourneyStages.map((stage, idx) => {
              const isActive = activeStageIndex === idx;
              const StageIcon = stage.icon;

              return (
                <button
                  key={stage.id}
                  onClick={() => scrollToStage(idx)}
                  className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between group select-none ${
                    isActive
                      ? 'bg-[#FAF4ED] border-[#E9A23B] shadow-md ring-2 ring-[#E9A23B]/30 scale-[1.02]'
                      : 'bg-[#FFFDF8] hover:bg-white border-[#DDE5DC] hover:border-[#1F7A5A]/40 shadow-2xs'
                  }`}
                  data-cursor="button"
                  title={`Stage ${stage.step}: ${stage.name}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-[#124B3A] text-white' : 'bg-[#124B3A]/10 text-[#124B3A]'
                    }`}>
                      {stage.step}
                    </span>
                    <StageIcon size={14} className={isActive ? 'text-[#E9A23B]' : 'text-[#65736B] group-hover:text-[#1F7A5A]'} />
                  </div>

                  <div className="mt-2 min-w-0">
                    <div className={`font-bold text-xs truncate transition-colors ${
                      isActive ? 'text-[#124B3A]' : 'text-[#17221C] group-hover:text-[#1F7A5A]'
                    }`}>
                      {stage.name}
                    </div>
                    <div className="text-[10px] text-[#65736B] truncate mt-0.5">
                      {stage.sublabel}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#DDE5DC]/60 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#8A5612] font-semibold">{stage.moduleNumber}</span>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-[#E76F51] animate-pulse" />
                    ) : (
                      <ChevronDown size={11} className="text-[#65736B] group-hover:translate-y-0.5 transition-transform" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ─── INTERACTIVE LIVE SHOWCASE CARD ─── */}
          {(() => {
            const currentStage = localizedJourneyStages[activeStageIndex];
            const StageIcon = currentStage.icon;
            const hasPrev = activeStageIndex > 0;
            const hasNext = activeStageIndex < localizedJourneyStages.length - 1;

            return (
              <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 shadow-md space-y-6 relative overflow-hidden transition-all duration-300">
                {/* Subtle gradient glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#1F7A5A]/5 to-[#E9A23B]/10 rounded-full blur-3xl pointer-events-none -z-0" />

                <div className="relative z-10 grid lg:grid-cols-12 gap-6 items-center">
                  {/* Left details */}
                  <div className="lg:col-span-8 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#124B3A] to-[#1F7A5A] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                        {currentStage.step}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#1F7A5A]/10 text-[#1F7A5A] border border-[#1F7A5A]/20 flex items-center gap-1.5">
                        <StageIcon size={13} className="text-[#1F7A5A]" />
                        Stage {currentStage.step} of 08 • {currentStage.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF4ED] text-[#8A5612] border border-[#E9A23B]/30">
                        {currentStage.badge}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-[#124B3A] tracking-tight">
                      {currentStage.title}
                    </h3>

                    <p className="text-sm text-[#526058] leading-relaxed max-w-3xl">
                      {currentStage.desc}
                    </p>

                    {/* Highlights tags */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {currentStage.highlights.map((h, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-[#F8F6EF] border border-[#DDE5DC] text-[11px] font-mono font-semibold text-[#124B3A]">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right interactive telemetry & actions */}
                  <div className="lg:col-span-4 bg-[#FAF4ED]/90 rounded-2xl p-4 border border-[#E9A23B]/30 space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#8A5612] uppercase tracking-wider block">
                        CLINICAL TELEMETRY
                      </span>
                      <p className="text-xs font-mono font-bold text-[#124B3A] mt-1">
                        {currentStage.telemetry}
                      </p>
                    </div>

                    {/* Stepper buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => scrollToStage(Math.max(0, activeStageIndex - 1))}
                        disabled={!hasPrev}
                        className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-[#F8F6EF] disabled:opacity-40 text-xs font-bold text-[#124B3A] border border-[#DDE5DC] transition-all flex items-center justify-center gap-1 shadow-2xs"
                        title="Previous Stage"
                      >
                        <ChevronLeft size={14} />
                        <span>Prev</span>
                      </button>
                      <button
                        onClick={() => scrollToStage(Math.min(localizedJourneyStages.length - 1, activeStageIndex + 1))}
                        disabled={!hasNext}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] disabled:opacity-40 text-xs font-bold text-white transition-all flex items-center justify-center gap-1 shadow-sm"
                        title="Next Stage"
                      >
                        <span>Next</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Direct links */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#E9A23B]/20">
                      <button
                        onClick={() => scrollToStage(activeStageIndex)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-white hover:bg-[#F8F6EF] text-xs font-semibold text-[#124B3A] border border-[#DDE5DC] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <span>{t.journey.exploreBtn}</span>
                        <ArrowDown size={13} className="text-[#1F7A5A]" />
                      </button>
                      <button
                        onClick={() => navigate(currentStage.route)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>{currentStage.moduleNumber} Module</span>
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* STAGE 01: ACQUISITION */}
        <section id="stage-acquisition" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div id="stage-image" className="sr-only" />
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-8 sm:p-12 shadow-sm grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#124B3A] text-white font-mono font-bold text-xs flex items-center justify-center">01</span>
                <span className="text-xs font-mono font-bold text-[#8A5612] uppercase tracking-wider">STAGE 1: ACQUISITION (M1)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#124B3A]">
                {t.journey.stage1Title}
              </h3>
              <p className="text-sm text-[#65736B] leading-relaxed">
                {t.journey.stage1Desc}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">Non-Mydriatic (No Drops)</span>
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">45° Field of View</span>
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">Corneal Glare Filter</span>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => navigate('/acquisition')}
                  className="px-5 py-2.5 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#175643] transition-all flex items-center gap-2"
                  data-cursor="button"
                >
                  <span>{t.journey.workstationBtn} (M1)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#FAF4ED] p-6 rounded-2xl border border-[#E9A23B]/30 space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#8A5612] uppercase block">OPTICAL TELEMETRY</span>
              <div className="text-xs font-semibold text-[#124B3A]">CLAHE + Bilateral Denoising:</div>
              <p className="text-xs text-[#65736B]">Dynamic range expanded from 42 SNR to 88 SNR, resolving capillary pericytes down to 25μm caliber.</p>
              <div className="pt-2 border-t border-[#E9A23B]/20 flex justify-between items-center text-xs font-mono">
                <span className="text-[#65736B]">Sensor Fidelity:</span>
                <span className="font-bold text-[#1F7A5A]">50° FOV • 24-bit RGB</span>
              </div>
            </div>
          </div>
        </section>

        {/* STAGE 02: QUALITY */}
        <section id="stage-quality" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-8 sm:p-12 shadow-sm grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#124B3A] text-white font-mono font-bold text-xs flex items-center justify-center">02</span>
                <span className="text-xs font-mono font-bold text-[#1F7A5A] uppercase tracking-wider">STAGE 2: QUALITY (M2)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#124B3A]">
                ISO-10940 Optical Quality & Gradability Assessment
              </h3>
              <p className="text-sm text-[#65736B] leading-relaxed">
                Deterministic pre-diagnostic quality check assessing motion blur, field illumination homogeneity, and media opacities to ensure only clinical-grade scans enter the AI grading pipeline.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">ISO 10940 Compliant</span>
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">Real-Time Blur Triage</span>
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">Zero False Ungradables</span>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => navigate('/preprocessing')}
                  className="px-5 py-2.5 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#175643] transition-all flex items-center gap-2"
                  data-cursor="button"
                >
                  <span>{t.journey.workstationBtn} (M2)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#FAF4ED] p-6 rounded-2xl border border-[#E9A23B]/30 space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#8A5612] uppercase block">PREPROCESSING TELEMETRY</span>
              <div className="text-xs font-semibold text-[#124B3A]">Illumination & Blur Gate:</div>
              <p className="text-xs text-[#65736B]">ISO-10940 contrast and sharpness indices verified. Motion blur score 0.04 (threshold &lt; 0.15).</p>
              <div className="pt-2 border-t border-[#E9A23B]/20 flex justify-between items-center text-xs font-mono">
                <span className="text-[#65736B]">ISO 10940 Clarity:</span>
                <span className="font-bold text-[#1F7A5A]">94% GRADABLE PASS</span>
              </div>
            </div>
          </div>
        </section>

        {/* STAGE 03: ANATOMY */}
        <section id="stage-anatomy" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-8 sm:p-12 shadow-sm grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#124B3A] text-white font-mono font-bold text-xs flex items-center justify-center">03</span>
                <span className="text-xs font-mono font-bold text-[#1F7A5A] uppercase tracking-wider">STAGE 3: ANATOMY (M3)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#124B3A]">
                {t.journey.stage2Title}
              </h3>
              <p className="text-sm text-[#65736B] leading-relaxed">
                {t.journey.stage2Desc}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">U-Net Attention Gate</span>
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">96.8% Dice Score</span>
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">A/V Ratio: 0.67 (Normal)</span>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => navigate('/anatomy')}
                  className="px-5 py-2.5 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#175643] transition-all flex items-center gap-2"
                  data-cursor="button"
                >
                  <span>{t.journey.workstationBtn} (M3)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#F8F6EF] p-6 rounded-2xl border border-[#DDE5DC] space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#124B3A] uppercase block">ANATOMICAL COORDINATES</span>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 rounded bg-white">
                  <span>Optic Disc:</span>
                  <span className="font-bold text-[#124B3A]">1,800 μm diameter</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white">
                  <span>Fovea (FAZ):</span>
                  <span className="font-bold text-[#E76F51]">750 μm radius</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white">
                  <span>Disc-to-Fovea Vector:</span>
                  <span className="font-bold text-[#1F7A5A]">3,450 μm</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STAGE 04: LESIONS */}
        <section id="stage-lesions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-8 sm:p-12 shadow-sm grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#124B3A] text-white font-mono font-bold text-xs flex items-center justify-center">04</span>
                <span className="text-xs font-mono font-bold text-[#E76F51] uppercase tracking-wider">STAGE 4: LESIONS (M4)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#124B3A]">
                {t.journey.stage3Title}
              </h3>
              <p className="text-sm text-[#65736B] leading-relaxed">
                {t.journey.stage3Desc}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">Microaneurysms (MA)</span>
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">Hard Exudates (Lipids)</span>
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">Blot Hemorrhages</span>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => navigate('/lesions')}
                  className="px-5 py-2.5 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#175643] transition-all flex items-center gap-2"
                  data-cursor="button"
                >
                  <span>{t.journey.workstationBtn} (M4)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#FDF0EC] p-6 rounded-2xl border border-[#F48C71]/40 space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#9A3B24] uppercase block">PATHOLOGY COUNT BY QUADRANT</span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-mono"><span>Supero-Temporal:</span> <span className="font-bold text-[#E76F51]">19 Lesions</span></div>
                <div className="flex justify-between font-mono"><span>Infero-Temporal:</span> <span className="font-bold text-[#E76F51]">23 Lesions</span></div>
                <div className="flex justify-between font-mono"><span>Supero-Nasal:</span> <span className="font-bold text-[#124B3A]">11 Lesions</span></div>
                <div className="flex justify-between font-mono"><span>Infero-Nasal:</span> <span className="font-bold text-[#124B3A]">9 Lesions</span></div>
              </div>
              <div className="pt-2 border-t border-[#F48C71]/30 text-xs text-[#9A3B24] font-medium">
                4-Quadrant hemorrhage density triggers ETDRS 4-2-1 rule.
              </div>
            </div>
          </div>
        </section>

        {/* STAGE 05: GRAPH ENGINE */}
        <section id="stage-graph" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-8 sm:p-12 shadow-sm grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#124B3A] text-white font-mono font-bold text-xs flex items-center justify-center">05</span>
                <span className="text-xs font-mono font-bold text-[#E9A23B] uppercase tracking-wider">STAGE 5: GRAPH ENGINE (M5)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#124B3A]">
                {t.journey.stage4Title}
              </h3>
              <p className="text-sm text-[#65736B] leading-relaxed">
                {t.journey.stage4Desc}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">Graph Neural Network</span>
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">Message-Passing Layers</span>
                <span className="px-3 py-1 rounded-lg bg-[#F8F6EF] text-xs font-mono font-semibold text-[#124B3A]">Relational Attention</span>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => navigate('/retinal-graph')}
                  className="px-5 py-2.5 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#175643] transition-all flex items-center gap-2"
                  data-cursor="button"
                >
                  <span>{t.journey.workstationBtn} (M5)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#FAF4ED] p-6 rounded-2xl border border-[#E9A23B]/30 space-y-3 font-mono text-xs">
              <span className="text-[10px] font-bold text-[#8A5612] uppercase block">GNN TOPOLOGY</span>
              <div className="p-2.5 rounded bg-white text-[#124B3A]">
                <div>Nodes: 28 (Anatomy + Lesions)</div>
                <div>Edges: 54 (Geometric Proximity)</div>
                <div>Attention Weight (FAZ): α = 0.94</div>
              </div>
            </div>
          </div>
        </section>

        {/* STAGE 06: GRADING */}
        <section id="stage-grading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div id="stage-ai" className="sr-only" />
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-8 sm:p-12 shadow-sm grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#124B3A] text-white font-mono font-bold text-xs flex items-center justify-center">06</span>
                <span className="text-xs font-mono font-bold text-[#124B3A] uppercase tracking-wider">STAGE 6: GRADING (M6)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#124B3A]">
                {t.journey.stage5Title}
              </h3>
              <p className="text-sm text-[#65736B] leading-relaxed">
                {t.journey.stage5Desc}
              </p>
              <div className="pt-4">
                <button
                  onClick={() => navigate('/classification')}
                  className="px-5 py-2.5 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#175643] transition-all flex items-center gap-2"
                  data-cursor="button"
                >
                  <span>{t.journey.workstationBtn} (M6)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#F8F6EF] p-6 rounded-2xl border border-[#DDE5DC] space-y-2 text-xs font-mono">
              <div className="flex justify-between"><span>Grade 0 (Normal):</span> <span>2%</span></div>
              <div className="flex justify-between"><span>Grade 1 (Mild):</span> <span>5%</span></div>
              <div className="flex justify-between"><span>Grade 2 (Moderate):</span> <span>15%</span></div>
              <div className="flex justify-between font-bold text-[#E76F51]"><span>Grade 3 (Severe NPDR):</span> <span>78%</span></div>
              <div className="flex justify-between"><span>Grade 4 (PDR):</span> <span>0%</span></div>
            </div>
          </div>
        </section>

        {/* STAGE 07: EXPLAINABILITY */}
        <section id="stage-explainability" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div id="stage-evidence" className="sr-only" />
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-8 sm:p-12 shadow-sm grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#124B3A] text-white font-mono font-bold text-xs flex items-center justify-center">07</span>
                <span className="text-xs font-mono font-bold text-[#1F7A5A] uppercase tracking-wider">STAGE 7: EXPLAINABILITY (M7)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#124B3A]">
                Multimodal Explainability & Clinical Grounding
              </h3>
              <p className="text-sm text-[#65736B] leading-relaxed">
                Relational attention saliency, counterfactual explainability, and deterministic ETDRS 4-2-1 criteria verifying every model prediction to give clinicians fully auditable reasoning.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => navigate('/explainability')}
                  className="px-5 py-2.5 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#175643] transition-all flex items-center gap-2"
                  data-cursor="button"
                >
                  <span>{t.journey.workstationBtn} (M7)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#FFFDF8] p-6 rounded-2xl border border-[#1F7A5A]/40 space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#1F7A5A] uppercase block">ETDRS 4-2-1 CRITERIA</span>
              <div className="text-xs space-y-1.5 text-[#124B3A]">
                <div className="flex items-center gap-2"><CheckCircle2 size={13} className="text-[#1F7A5A]" /> &gt;20 Hemorrhages in 4 quadrants: PASS</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={13} className="text-[#1F7A5A]" /> Venous Beading in 2+ quadrants: PASS</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={13} className="text-[#1F7A5A]" /> IRMA in 1+ quadrant: PASS</div>
              </div>
            </div>
          </div>
        </section>

        {/* STAGE 08: CARE COCKPIT */}
        <section id="stage-care" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-8 sm:p-12 shadow-sm grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#124B3A] text-white font-mono font-bold text-xs flex items-center justify-center">08</span>
                <span className="text-xs font-mono font-bold text-[#E76F51] uppercase tracking-wider">STAGE 8: CARE COCKPIT (M8)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#124B3A]">
                Care Cockpit & National Tele-OPD Referral
              </h3>
              <p className="text-sm text-[#65736B] leading-relaxed">
                National ABDM e-Sanjeevani Tele-OPD referral docket, verified prescription, and specialist tele-consultation linkage for rural health centers.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => navigate('/care')}
                  className="px-5 py-2.5 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#175643] transition-all flex items-center gap-2"
                  data-cursor="button"
                >
                  <span>{t.journey.workstationBtn} (M8)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#FAF4ED] p-6 rounded-2xl border border-[#E9A23B]/30 space-y-3 text-xs">
              <span className="text-[10px] font-mono font-bold text-[#8A5612] uppercase block">ABDM INTEGRATION</span>
              <div className="font-bold text-[#124B3A]">ABHA ID: 91-4820-8192-3841</div>
              <p className="text-[#65736B]">Triage Urgency: Urgent (Within 1-2 Weeks). Transmitted securely to District Eye Hospital Tele-OPD.</p>
            </div>
          </div>
        </section>
      </div>

      {/* ─── SECTION 3: SYSTEM ARCHITECTURE PILLARS ─── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#DDE5DC]">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#F8F6EF] text-[#124B3A] border border-[#DDE5DC] uppercase">
            {t.nav.connectivityImpact}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#124B3A]">
            National Healthcare Connectivity
          </h2>
          <p className="text-xs sm:text-sm text-[#65736B]">
            Engineered for national scale deployment across 600,000+ Indian villages.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            { title: t.nav.continuousLearning, route: '/learning', sub: 'Active Human-in-the-Loop Feedback' },
            { title: t.nav.impactCalculator, route: '/impact', sub: '600k+ Villages Vision Loss Saved' },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => navigate(item.route)}
              className="p-6 rounded-2xl bg-[#FFFDF8] hover:bg-white border border-[#DDE5DC] hover:border-[#1F7A5A]/50 shadow-xs hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between"
              data-cursor="card"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#1F7A5A] block mb-1">0{idx + 1} ARCHITECTURE</span>
                <h4 className="font-bold text-base text-[#124B3A] group-hover:text-[#1F7A5A] transition-colors">{item.title}</h4>
                <p className="text-xs text-[#65736B] mt-1.5 leading-relaxed">{item.sub}</p>
              </div>
              <div className="mt-5 text-xs font-bold text-[#1F7A5A] flex items-center gap-1.5">
                <span>Inspect Architecture</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 4: FOOTER ─── */}
      <Footer />
    </div>
  );
};
