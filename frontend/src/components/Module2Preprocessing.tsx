import React, { useState, useEffect, useRef } from 'react';
import { SectionHeading } from './SectionHeading';
import { 
  CheckCircle2, AlertTriangle, XCircle, Sliders, 
  RotateCw, Eye, Sparkles, Activity, Layers, ArrowLeftRight,
  ShieldCheck, RefreshCw, Cpu
} from 'lucide-react';

export const Module2Preprocessing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gradable' | 'non-gradable'>('gradable');
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100% split slider
  const [isHoveringSlider, setIsHoveringSlider] = useState<boolean>(false);
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const isGradable = activeTab === 'gradable';
  const targetScore = isGradable ? 94 : 38;

  // Animate quality score whenever tab changes or on scroll
  useEffect(() => {
    let current = 0;
    const step = targetScore / 25;
    const interval = setInterval(() => {
      current += step;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(interval);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, 24);

    return () => clearInterval(interval);
  }, [targetScore]);

  // Handle manual dragging or slider input
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPos(Number(e.target.value));
  };

  // Processing indicators defined in prompt
  const processingIndicators = [
    {
      name: "Noise Removal",
      desc: "2D Bilateral Filter (Gaussian σ=1.8)",
      gradableStatus: "Suppressed (-14 dB)",
      nonGradableStatus: "Noise High",
      gradableIcon: "green",
      nonGradableIcon: "saffron"
    },
    {
      name: "Blur Detection",
      desc: "Sobel Tenengrad Focus Measure",
      gradableStatus: "Score: 184 (Sharp)",
      nonGradableStatus: "Score: 42 (Severe Blur)",
      gradableIcon: "green",
      nonGradableIcon: "coral"
    },
    {
      name: "Artifact Detection",
      desc: "Corneal Glare & Eyelash Masking",
      gradableStatus: "< 0.4% FOV impact",
      nonGradableStatus: "24.8% FOV Obstructed",
      gradableIcon: "green",
      nonGradableIcon: "coral"
    },
    {
      name: "Illumination Normalization",
      desc: "Surface Spline Background Flattening",
      gradableStatus: "Gradient Corrected",
      nonGradableStatus: "Vignetting Severe",
      gradableIcon: "green",
      nonGradableIcon: "saffron"
    },
    {
      name: "Contrast Enhancement",
      desc: "Dynamic Range Stretching [0-255]",
      gradableStatus: "Dynamic Range: 98%",
      nonGradableStatus: "Dynamic Range: 41%",
      gradableIcon: "green",
      nonGradableIcon: "coral"
    },
    {
      name: "CLAHE",
      desc: "Contrast-Limited Adaptive Histogram Eq.",
      gradableStatus: "ClipLimit=2.4 (Active)",
      nonGradableStatus: "Contrast Fail",
      gradableIcon: "green",
      nonGradableIcon: "coral"
    },
    {
      name: "Image Quality Assessment",
      desc: "Multi-factor Clarity Metric (ISO 10940)",
      gradableStatus: "Passed (Q = 0.94)",
      nonGradableStatus: "Failed (Q = 0.38 < 0.72)",
      gradableIcon: "green",
      nonGradableIcon: "coral"
    }
  ];

  return (
    <section ref={sectionRef} id="module2-preprocessing" className="py-20 md:py-28 bg-[#FFFDF8] border-y border-[#DDE5DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <SectionHeading
          badge="Module 02: Preprocessing & Quality Assessment"
          title="Clinical Preprocessing & Quality Assessment"
          subtitle="Real-time optical normalization, automated noise suppression, and intelligent quality gating to prevent diagnostic errors caused by blurry or compromised fundus photography."
        />

        {/* Clinical Screening Workstation Shell */}
        <div className="rounded-3xl border-2 border-[#DDE5DC] bg-[#FFFFFF] shadow-warm-xl overflow-hidden">
          
          {/* Workstation Top Bar / HUD */}
          <div className="p-4 sm:p-6 bg-[#F8F6EF] border-b border-[#DDE5DC] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#124B3A] flex items-center justify-center text-[#FFFDF8] shadow-warm-sm">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-bold text-[#17221C] font-display">
                    ASHA Field Workstation • Optical Normalization Unit
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8F3EE] text-[#124B3A] border border-[#C8D4C7] font-bold">
                    110 ms EDGE NPU
                  </span>
                </div>
                <div className="text-xs text-[#65736B]">
                  Sub-Health Centre Triage • Standard 45° Non-Mydriatic Fundus Stream
                </div>
              </div>
            </div>

            {/* Gradable vs Non-Gradable Mode Switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-warm-sm">
              <button
                onClick={() => setActiveTab('gradable')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold font-display transition-all flex items-center gap-2 ${
                  isGradable
                    ? 'bg-[#124B3A] text-[#FFFDF8] shadow-warm-sm'
                    : 'text-[#65736B] hover:text-[#17221C]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2CA077]" />
                <span>Gradable Scan (Pass)</span>
              </button>

              <button
                onClick={() => setActiveTab('non-gradable')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold font-display transition-all flex items-center gap-2 ${
                  !isGradable
                    ? 'bg-[#E76F51] text-[#FFFDF8] shadow-warm-sm'
                    : 'text-[#65736B] hover:text-[#17221C]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#FFFDF8]" />
                <span>Non-Gradable Scan (Reject)</span>
              </button>
            </div>
          </div>

          {/* Main Workstation Grid */}
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left / Center Column: Before / After Split Retinal Visualization */}
            <div className="lg:col-span-7 flex flex-col items-center">
              
              {/* Top Viewport Header */}
              <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-[#DDE5DC] text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#17221C] font-mono uppercase">
                    Split Optical Comparison
                  </span>
                  <span className="text-[11px] text-[#65736B]">
                    (Drag slider to compare)
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-[#8A5612] font-bold">LEFT: Original</span>
                  <span className="text-[#1F7A5A] font-bold">RIGHT: Enhanced (CLAHE)</span>
                </div>
              </div>

              {/* Central Large Retinal Comparison Viewport */}
              <div 
                className="relative w-full aspect-square max-w-md rounded-full bg-[#17221C] overflow-hidden border-4 border-[#3A4840] shadow-2xl flex items-center justify-center select-none"
                onMouseEnter={() => setIsHoveringSlider(true)}
                onMouseLeave={() => setIsHoveringSlider(false)}
              >
                {/* Rotating Circular Scanner Calibration Ring around Retina */}
                <div className="absolute -inset-2 rounded-full border border-dashed border-[#1F7A5A] animate-spin-slow opacity-60 pointer-events-none" />
                <div className="absolute -inset-5 rounded-full border border-dotted border-[#E9A23B] animate-spin-slow opacity-40 pointer-events-none" style={{ animationDirection: 'reverse', animationDuration: '22s' }} />

                {/* SVG Fundus Canvas */}
                <svg viewBox="0 0 300 300" className="w-full h-full rounded-full">
                  <defs>
                    {/* Raw / Unprocessed Fundus Gradient (Dim, murky, low contrast) */}
                    <radialGradient id="rawFundusGrad" cx="40%" cy="45%" r="60%">
                      <stop offset="0%" stopColor="#6E281C" />
                      <stop offset="60%" stopColor="#48180E" />
                      <stop offset="100%" stopColor="#1E0704" />
                    </radialGradient>

                    {/* Enhanced CLAHE Fundus Gradient (Vibrant green-channel contrast boosted) */}
                    <radialGradient id="claheFundusGrad" cx="46%" cy="50%" r="52%">
                      <stop offset="0%" stopColor="#A83924" />
                      <stop offset="50%" stopColor="#7E2414" />
                      <stop offset="85%" stopColor="#451209" />
                      <stop offset="100%" stopColor="#17221C" />
                    </radialGradient>

                    {/* Non-gradable cataract haze gradient */}
                    <radialGradient id="cataractHaze" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFFDF8" stopOpacity="0.75" />
                      <stop offset="60%" stopColor="#E9A23B" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#17221C" stopOpacity="0" />
                    </radialGradient>

                    {/* Clip-path for split comparison slider */}
                    <clipPath id="originalClip">
                      <rect x="0" y="0" width={`${sliderPos * 3}`} height="300" />
                    </clipPath>
                    <clipPath id="enhancedClip">
                      <rect x={`${sliderPos * 3}`} y="0" width={`${300 - sliderPos * 3}`} height="300" />
                    </clipPath>
                  </defs>

                  {/* LEFT SIDE: "Original" Unprocessed Layer */}
                  <g clipPath="url(#originalClip)">
                    {/* Dim base fundus */}
                    <circle cx="150" cy="150" r="148" fill="url(#rawFundusGrad)" />

                    {/* Murky Optic Disc */}
                    <ellipse cx="90" cy="150" rx="18" ry="21" fill="#C5852B" opacity="0.6" />
                    <ellipse cx="88" cy="148" rx="7" ry="9" fill="#FFFDF8" opacity="0.4" />

                    {/* Low contrast fovea */}
                    <circle cx="195" cy="152" r="26" fill="#300903" opacity="0.8" />

                    {/* Faint, noisy vessels in raw scan */}
                    <path
                      d="M 90 140 C 105 90, 145 75, 190 80 C 230 85, 255 115, 275 140"
                      fill="none"
                      stroke="#5C1F15"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 90 160 C 105 210, 150 225, 195 220 C 235 215, 260 185, 280 160"
                      fill="none"
                      stroke="#5C1F15"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />

                    {/* If Non-gradable: heavy cataract haze & motion blur overlay */}
                    {!isGradable && (
                      <circle cx="150" cy="150" r="148" fill="url(#cataractHaze)" />
                    )}

                    {/* Subtle vignetting shadow */}
                    <circle cx="150" cy="150" r="148" fill="none" stroke="#000000" strokeWidth="22" opacity="0.5" />
                  </g>

                  {/* RIGHT SIDE: "Enhanced" CLAHE Normalization Layer */}
                  <g clipPath="url(#enhancedClip)">
                    {/* Vibrant CLAHE enhanced fundus */}
                    <circle cx="150" cy="150" r="148" fill="url(#claheFundusGrad)" />

                    {/* Sharp Optic Disc with neuro-retinal rim */}
                    <ellipse cx="90" cy="150" rx="18" ry="22" fill="#E9A23B" />
                    <ellipse cx="88" cy="149" rx="8" ry="10" fill="#FFFDF8" opacity="0.9" />

                    {/* Sharp Fovea Centralis (FAZ) */}
                    <circle cx="195" cy="152" r="26" fill="#2E0803" />
                    <circle cx="195" cy="152" r="3" fill="#17221C" />
                    <circle cx="195" cy="152" r="9" fill="none" stroke="#E9A23B" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />

                    {/* Enhanced Sharp Arteriolar-Venular Vessels (Emerald #1F7A5A) */}
                    <path
                      d="M 90 140 C 105 90, 145 75, 190 80 C 230 85, 255 115, 275 140"
                      fill="none"
                      stroke="#1F7A5A"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                    />
                    <path d="M 148 77 Q 175 52, 215 46" fill="none" stroke="#2CA077" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 195 80 Q 215 105, 230 115" fill="none" stroke="#2CA077" strokeWidth="1.6" strokeLinecap="round" />

                    <path
                      d="M 90 160 C 105 210, 150 225, 195 220 C 235 215, 260 185, 280 160"
                      fill="none"
                      stroke="#1F7A5A"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                    />
                    <path d="M 152 222 Q 185 245, 225 248" fill="none" stroke="#2CA077" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 200 218 Q 215 195, 235 185" fill="none" stroke="#2CA077" strokeWidth="1.6" strokeLinecap="round" />

                    {/* Microaneurysms crisply resolved under CLAHE */}
                    <circle cx="215" cy="115" r="3.5" fill="#E76F51" stroke="#FFFDF8" strokeWidth="0.8" />
                    <circle cx="170" cy="205" r="3.2" fill="#E76F51" stroke="#FFFDF8" strokeWidth="0.8" />

                    {/* If Non-gradable: shows where CLAHE attempted enhancement but cataract blocks */}
                    {!isGradable && (
                      <g opacity="0.6">
                        <circle cx="150" cy="150" r="90" fill="#E76F51" opacity="0.2" />
                        <text x="150" y="150" textAnchor="middle" fill="#FFFDF8" className="text-[10px] font-mono font-bold">
                          MEDIA OPACITY UNSALVAGEABLE
                        </text>
                      </g>
                    )}
                  </g>

                  {/* Divider Line */}
                  <line
                    x1={`${sliderPos * 3}`}
                    y1="0"
                    x2={`${sliderPos * 3}`}
                    y2="300"
                    stroke="#FFFDF8"
                    strokeWidth="3"
                    strokeDasharray="6 3"
                    className="pointer-events-none"
                  />
                  {/* Handle Pip */}
                  <circle
                    cx={`${sliderPos * 3}`}
                    cy="150"
                    r="12"
                    fill="#124B3A"
                    stroke="#FFFDF8"
                    strokeWidth="2.5"
                    className="pointer-events-none shadow-lg"
                  />
                  <path
                    d={`M ${sliderPos * 3 - 4} 150 L ${sliderPos * 3 + 4} 150`}
                    stroke="#FFFDF8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="pointer-events-none"
                  />
                </svg>

                {/* Overlay Text Badges inside Retinal Circle */}
                <div className="absolute top-3 left-4 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#17221C]/80 text-[#E9A23B] border border-[#E9A23B]/40">
                    RAW CAPTURE
                  </span>
                </div>
                <div className="absolute top-3 right-4 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#17221C]/80 text-[#1F7A5A] border border-[#1F7A5A]/40">
                    CLAHE ENHANCED
                  </span>
                </div>
              </div>

              {/* Interactive Comparison Range Slider */}
              <div className="w-full max-w-md mt-4 space-y-2">
                <div className="flex justify-between text-xs font-mono font-semibold text-[#65736B]">
                  <span>← Reveal Original (0%)</span>
                  <span className="text-[#124B3A] font-bold">{sliderPos}% Split</span>
                  <span>Reveal Enhanced (100%) →</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={handleSliderChange}
                  className="w-full h-2.5 bg-[#E7EEE6] rounded-lg appearance-none cursor-pointer accent-[#124B3A]"
                />
              </div>

              {/* Circular Scanner Animation HUD Badge */}
              <div className="mt-4 flex items-center gap-2 text-xs font-mono text-[#65736B]">
                <RotateCw className="w-3.5 h-3.5 text-[#1F7A5A] animate-spin" />
                <span>360° Circular Scanner Ring Active • 45° Field-of-View Calibrated</span>
              </div>
            </div>

            {/* Right Column: Animated Quality Score, Classification, Indicators & Clinical Rationale */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Quality Score Gauge Card */}
              <div className="p-6 rounded-2xl bg-[#FFFDF8] border-2 border-[#DDE5DC] shadow-warm-sm flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#65736B] font-mono">
                    Automated Quality Score
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F8F6EF] text-[#124B3A] border border-[#DDE5DC]">
                    ISO 10940:2009
                  </span>
                </div>

                {/* Big Score Readout */}
                <div className="my-4 flex items-baseline justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#65736B] font-mono">
                      Calculated Clarity Index:
                    </div>
                    <div className={`text-4xl sm:text-5xl font-extrabold font-display tracking-tight mt-1 ${
                      isGradable ? 'text-[#1F7A5A]' : 'text-[#E76F51]'
                    }`}>
                      Image Quality: {animatedScore}%
                    </div>
                  </div>

                  {/* Small Classification Badge */}
                  <div>
                    {isGradable ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-[#E8F3EE] text-[#124B3A] border border-[#C8D4C7] shadow-warm-sm">
                        <CheckCircle2 className="w-4 h-4 text-[#1F7A5A]" />
                        <span>GRADABLE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-[#FDF0EC] text-[#9A3B24] border border-[#F48C71] shadow-warm-sm">
                        <XCircle className="w-4 h-4 text-[#E76F51]" />
                        <span>NON-GRADABLE</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Score Progress Bar with Threshold Marker */}
                <div className="space-y-1.5">
                  <div className="relative w-full h-3 bg-[#E7EEE6] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isGradable ? 'bg-[#1F7A5A]' : 'bg-[#E76F51]'
                      }`}
                      style={{ width: `${animatedScore}%` }}
                    />
                    {/* 72% Threshold Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-[2px] bg-[#17221C]"
                      style={{ left: '72%' }}
                      title="Gatekeeper Threshold: 72%"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#65736B]">
                    <span>0% (Unusable)</span>
                    <span className="text-[#17221C] font-bold">▲ 72% Minimum Clinical Threshold</span>
                    <span>100% (Gold Standard)</span>
                  </div>
                </div>

                {/* Human-Readable Clinical Explanation Box */}
                <div className={`mt-5 p-4 rounded-xl border text-xs leading-relaxed ${
                  isGradable
                    ? 'bg-[#E8F3EE] border-[#C8D4C7] text-[#124B3A]'
                    : 'bg-[#FDF0EC] border-[#F48C71] text-[#9A3B24]'
                }`}>
                  <div className="font-bold font-display uppercase tracking-wider text-[11px] mb-1 flex items-center gap-1.5">
                    {isGradable ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#1F7A5A]" />
                        <span>Clinical Clearance Justification</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-[#E76F51]" />
                        <span>Rejection Rationale & Operator Action</span>
                      </>
                    )}
                  </div>
                  {isGradable ? (
                    <p>
                      Foveal avascular zone (FAZ) and 4-quadrant vascular arcades exhibit sharp contrast (&gt; 2.4 SNR). Microaneurysms down to 25μm caliber are fully resolvable. Image cleared for downstream GNN inference.
                    </p>
                  ) : (
                    <p>
                      Media opacity (dense nuclear cataract) combined with camera motion blur. Central 15° macular field is completely obscured. <span className="font-bold">ASHA Worker Action:</span> Darken room, instruct patient to hold gaze, re-capture; or refer patient to PHC for cataract surgical evaluation.
                    </p>
                  )}
                </div>
              </div>

              {/* 7 Processing Indicators Checklist */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DDE5DC] shadow-warm-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DDE5DC]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#17221C] font-display">
                    Optical Preprocessing Pipeline Indicators
                  </h4>
                  <span className="text-[10px] font-mono text-[#65736B]">
                    7 Telemetry Channels
                  </span>
                </div>

                <div className="space-y-2">
                  {processingIndicators.map((item, idx) => {
                    const statusText = isGradable ? item.gradableStatus : item.nonGradableStatus;
                    const isPassed = isGradable;

                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#1F7A5A] shrink-0" />
                          ) : (
                            item.nonGradableIcon === 'coral' ? (
                              <XCircle className="w-4 h-4 text-[#E76F51] shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-[#E9A23B] shrink-0" />
                            )
                          )}
                          <div>
                            <span className="font-bold text-[#17221C]">{item.name}</span>
                            <span className="text-[10px] text-[#65736B] block sm:inline sm:ml-1 font-mono">
                              ({item.desc})
                            </span>
                          </div>
                        </div>

                        <span className={`text-[11px] font-mono font-bold shrink-0 ml-2 ${
                          isPassed ? 'text-[#1F7A5A]' : (
                            item.nonGradableIcon === 'coral' ? 'text-[#E76F51]' : 'text-[#8A5612]'
                          )
                        }`}>
                          {statusText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Telemetry Strip */}
          <div className="p-4 bg-[#F8F6EF] border-t border-[#DDE5DC] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#65736B]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#124B3A]" />
              <span>Edge Execution: MobileNet-V3 Clarity Model (1.4 MB) • Zero Latency Overhead</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Threshold: <strong className="text-[#124B3A]">Q ≥ 0.72</strong></span>
              <span>FOV: <strong className="text-[#124B3A]">45° Verified</strong></span>
              <span>Noise Rejection: <strong className="text-[#1F7A5A]">Active</strong></span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
