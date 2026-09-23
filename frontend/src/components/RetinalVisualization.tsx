import React, { useState } from 'react';
import { Layers, Eye, Crosshair, Network, Sparkles, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { ClinicalCase } from '../types';
import { useRetinaData } from '../context/RetinaContext';

interface RetinalVisualizationProps {
  clinicalCase: ClinicalCase;
}

export const RetinalVisualization: React.FC<RetinalVisualizationProps> = ({ clinicalCase }) => {
  const { activeImage } = useRetinaData();
  const [activeLayers, setActiveLayers] = useState({
    vessels: true,
    lesions: true,
    graph: true,
    xai: false,
  });

  const [zoom, setZoom] = useState(1);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const isNormal = clinicalCase.id === 'case-normal';
  const isMild = clinicalCase.id === 'case-mild';
  const isSevere = clinicalCase.id === 'case-severe';
  const isRejected = clinicalCase.id === 'case-rejected';

  return (
    <div className="flex flex-col rounded-2xl border border-[#DDE5DC] bg-[#FFFFFF] overflow-hidden shadow-warm-md">
      {/* Top Interactive Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#FFFDF8] border-b border-[#DDE5DC]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1F7A5A] animate-pulse" />
          <span className="text-xs font-bold font-display uppercase tracking-wider text-[#17221C]">
            Interactive Fundus Viewport (45° Non-Mydriatic)
          </span>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#65736B] mr-1 hidden sm:inline text-[11px] font-mono">Layers:</span>
          
          <button
            onClick={() => toggleLayer('vessels')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeLayers.vessels
                ? 'bg-[#124B3A] text-[#FFFDF8] shadow-warm-sm'
                : 'bg-[#F8F6EF] text-[#65736B] hover:bg-[#E7EEE6]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vessels</span>
          </button>

          <button
            onClick={() => toggleLayer('lesions')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeLayers.lesions
                ? 'bg-[#E76F51] text-[#FFFDF8] shadow-warm-sm'
                : 'bg-[#F8F6EF] text-[#65736B] hover:bg-[#E7EEE6]'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Lesions</span>
          </button>

          <button
            onClick={() => toggleLayer('graph')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeLayers.graph
                ? 'bg-[#1F7A5A] text-[#FFFDF8] shadow-warm-sm'
                : 'bg-[#F8F6EF] text-[#65736B] hover:bg-[#E7EEE6]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Retinal Graph</span>
          </button>

          <button
            onClick={() => toggleLayer('xai')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeLayers.xai
                ? 'bg-[#E9A23B] text-[#17221C] shadow-warm-sm'
                : 'bg-[#F8F6EF] text-[#65736B] hover:bg-[#E7EEE6]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>XAI Attention</span>
          </button>

          <div className="h-4 w-[1px] bg-[#DDE5DC] mx-1" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 1.8))}
            className="p-1 rounded bg-[#F8F6EF] hover:bg-[#E7EEE6] text-[#17221C]"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.8))}
            className="p-1 rounded bg-[#F8F6EF] hover:bg-[#E7EEE6] text-[#17221C]"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 rounded bg-[#F8F6EF] hover:bg-[#E7EEE6] text-[#17221C]"
            title="Reset Zoom"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Fundus Viewport */}
      <div className="relative w-full aspect-square max-w-xl mx-auto bg-[#17221C] flex items-center justify-center overflow-hidden">
        {/* If quality rejected, show simulated cataract opacity blur */}
        {isRejected && (
          <div className="absolute inset-0 z-30 bg-[#FFFDF8]/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FDF0EC] border-2 border-[#E76F51] flex items-center justify-center text-[#E76F51] mb-3 animate-pulse">
              <Layers className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-[#17221C] font-display">
              Media Opacity & Cataract Blur Detected
            </h4>
            <p className="text-xs text-[#65736B] max-w-sm mt-1">
              Quality Assessment Module Q_score = 0.38 (Threshold 0.72). Image discarded to prevent AI misdiagnosis.
            </p>
            <div className="mt-4 px-3 py-1.5 rounded-full bg-[#E76F51] text-[#FFFDF8] text-xs font-semibold shadow-warm-sm">
              Recapture Required by ASHA Worker
            </div>
          </div>
        )}

        <div
          className="relative transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoom})` }}
        >
          <svg
            viewBox="0 0 600 600"
            className="w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[500px] md:h-[500px] rounded-full shadow-2xl border-4 border-[#3A4840] overflow-hidden"
          >
            <defs>
              {/* Radial gradient for the realistic warm retinal fundus body */}
              <radialGradient id="fundusGrad" cx="45%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C44D34" />
                <stop offset="40%" stopColor="#9E3520" />
                <stop offset="85%" stopColor="#691F11" />
                <stop offset="100%" stopColor="#350E07" />
              </radialGradient>

              {/* Optic Disc Gradient (warm amber-yellow) */}
              <radialGradient id="opticDiscGrad" cx="45%" cy="45%" r="50%">
                <stop offset="0%" stopColor="#FFF2D6" />
                <stop offset="45%" stopColor="#E9A23B" />
                <stop offset="90%" stopColor="#B2741E" />
                <stop offset="100%" stopColor="#6C420D" />
              </radialGradient>

              {/* Fovea / Macula dark depression */}
              <radialGradient id="foveaGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4A130A" />
                <stop offset="60%" stopColor="#782314" />
                <stop offset="100%" stopColor="#9E3520" stopOpacity="0" />
              </radialGradient>

              {/* XAI Heatmap Radial */}
              <radialGradient id="xaiHeatmap" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E9A23B" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#E76F51" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#1F7A5A" stopOpacity="0" />
              </radialGradient>

              {/* Vessel Glow Filter */}
              <filter id="vesselGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#1F7A5A" floodOpacity="0.8" />
              </filter>

              {/* Fundus Circular Clip for Photo */}
              <clipPath id="fundusCircleClip">
                <circle cx="300" cy="300" r="298" />
              </clipPath>
            </defs>

            {/* Base Fundus Globe */}
            <circle cx="300" cy="300" r="298" fill="url(#fundusGrad)" />

            {/* Uploaded Retinal Fundus Photo (when active image is present) */}
            {activeImage && (
              <image
                href={activeImage}
                x="0"
                y="0"
                width="600"
                height="600"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#fundusCircleClip)"
                opacity="0.85"
              />
            )}

            {/* Choroidal Background Texture */}
            <circle cx="300" cy="300" r="290" fill="none" stroke="#50170C" strokeWidth="6" opacity="0.4" />
            <circle cx="300" cy="300" r="240" fill="none" stroke="#50170C" strokeWidth="3" opacity="0.2" strokeDasharray="12 8" />

            {/* Optic Disc (Nasal side, coordinates: ~180, 300) */}
            <g
              className="cursor-pointer transition-transform hover:scale-105"
              onMouseEnter={() => setHoveredElement('Optic Disc (Optic Nerve Head) — Emergence of central retinal artery/vein')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <ellipse cx="170" cy="300" rx="36" ry="42" fill="url(#opticDiscGrad)" />
              {/* Physiological Cup */}
              <ellipse cx="166" cy="298" rx="16" ry="20" fill="#FFFDF8" opacity="0.85" />
            </g>

            {/* Macula & Fovea Centralis (Temporal side, coordinates: ~380, 305) */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredElement('Fovea Centralis (Macula) — 1500μm Avascular Zone, site of highest visual acuity')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <circle cx="380" cy="305" r="52" fill="url(#foveaGrad)" />
              {/* Foveal Center Dot */}
              <circle cx="380" cy="305" r="5" fill="#2E0A04" />
              {/* FAZ contour */}
              <circle cx="380" cy="305" r="16" fill="none" stroke="#E9A23B" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
            </g>

            {/* Retinal Blood Vessels (Arteries & Veins emerging from Disc and arching around Macula) */}
            <g
              className={`transition-opacity duration-300 ${activeLayers.vessels ? 'opacity-100' : 'opacity-25'}`}
            >
              {/* Superior Temporal Arcade (Main arch above macula) */}
              <path
                d="M 170 280 C 190 200, 260 140, 360 145 C 440 150, 480 200, 520 240"
                fill="none"
                stroke={activeLayers.vessels ? "#1F7A5A" : "#6E1B0E"}
                strokeWidth="6"
                strokeLinecap="round"
                filter={activeLayers.vessels ? "url(#vesselGlow)" : undefined}
              />
              <path
                d="M 280 155 Q 320 110, 390 90"
                fill="none"
                stroke={activeLayers.vessels ? "#1F7A5A" : "#6E1B0E"}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 370 148 Q 400 180, 430 200"
                fill="none"
                stroke={activeLayers.vessels ? "#1F7A5A" : "#6E1B0E"}
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Inferior Temporal Arcade (Main arch below macula) */}
              <path
                d="M 170 320 C 195 400, 270 460, 370 455 C 450 450, 490 390, 530 350"
                fill="none"
                stroke={activeLayers.vessels ? "#1F7A5A" : "#6E1B0E"}
                strokeWidth="6"
                strokeLinecap="round"
                filter={activeLayers.vessels ? "url(#vesselGlow)" : undefined}
              />
              <path
                d="M 290 445 Q 340 490, 410 510"
                fill="none"
                stroke={activeLayers.vessels ? "#1F7A5A" : "#6E1B0E"}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 380 452 Q 410 420, 440 400"
                fill="none"
                stroke={activeLayers.vessels ? "#1F7A5A" : "#6E1B0E"}
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Nasal Vessels (Heading left towards nasal periphery) */}
              <path
                d="M 160 290 Q 120 270, 70 260"
                fill="none"
                stroke={activeLayers.vessels ? "#1F7A5A" : "#6E1B0E"}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 160 310 Q 120 330, 80 350"
                fill="none"
                stroke={activeLayers.vessels ? "#1F7A5A" : "#6E1B0E"}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 100 265 Q 80 220, 60 180"
                fill="none"
                stroke={activeLayers.vessels ? "#1F7A5A" : "#6E1B0E"}
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Small capillary network surrounding Foveal Avascular Zone */}
              <path d="M 350 250 Q 365 270, 360 290" fill="none" stroke={activeLayers.vessels ? "#2CA077" : "#50170C"} strokeWidth="1.5" />
              <path d="M 410 255 Q 400 275, 402 290" fill="none" stroke={activeLayers.vessels ? "#2CA077" : "#50170C"} strokeWidth="1.5" />
              <path d="M 360 320 Q 365 335, 375 340" fill="none" stroke={activeLayers.vessels ? "#2CA077" : "#50170C"} strokeWidth="1.5" />
              <path d="M 400 320 Q 395 335, 385 340" fill="none" stroke={activeLayers.vessels ? "#2CA077" : "#50170C"} strokeWidth="1.5" />
            </g>

            {/* XAI Grad-CAM / Attention Overlay (Heatmap glow) */}
            {activeLayers.xai && !isNormal && !isRejected && (
              <g className="transition-opacity duration-500 animate-pulse-slow">
                {/* Attention circle focused on Macula exudates and Superior Arcade hemorrhages */}
                <circle cx="395" cy="275" r="75" fill="url(#xaiHeatmap)" />
                <circle cx="450" cy="210" r="55" fill="url(#xaiHeatmap)" />
                <circle cx="270" cy="380" r="50" fill="url(#xaiHeatmap)" />
              </g>
            )}

            {/* Topological Graph Layer (Nodes & Edges connecting anatomical landmarks & lesions) */}
            {activeLayers.graph && !isRejected && (
              <g className="transition-opacity duration-300">
                {/* Landmark Graph Nodes: Optic Disc & Fovea */}
                <circle cx="170" cy="300" r="8" fill="#124B3A" stroke="#FFFDF8" strokeWidth="2" />
                <circle cx="380" cy="305" r="8" fill="#124B3A" stroke="#FFFDF8" strokeWidth="2" />

                {/* Disc-to-Fovea Primary Anatomical Vector */}
                <line x1="170" y1="300" x2="380" y2="305" stroke="#E9A23B" strokeWidth="2" strokeDasharray="4 4" />

                {/* If Mild: Graph connects isolated Microaneurysms */}
                {isMild && (
                  <>
                    <line x1="170" y1="300" x2="430" y2="180" stroke="#1F7A5A" strokeWidth="1.5" opacity="0.7" />
                    <line x1="380" y1="305" x2="430" y2="180" stroke="#1F7A5A" strokeWidth="1.5" opacity="0.7" />
                    <line x1="380" y1="305" x2="340" y2="430" stroke="#1F7A5A" strokeWidth="1.5" opacity="0.7" />
                  </>
                )}

                {/* If Severe: Dense Graph mesh linking lesion clusters to vascular arcade and fovea */}
                {isSevere && (
                  <>
                    <line x1="380" y1="305" x2="360" y2="280" stroke="#E76F51" strokeWidth="2" />
                    <line x1="380" y1="305" x2="410" y2="275" stroke="#E76F51" strokeWidth="2" />
                    <line x1="380" y1="305" x2="400" y2="330" stroke="#E76F51" strokeWidth="2" />
                    <line x1="360" y1="280" x2="410" y2="275" stroke="#E9A23B" strokeWidth="1.5" />
                    <line x1="410" y1="275" x2="400" y2="330" stroke="#E9A23B" strokeWidth="1.5" />
                    <line x1="360" y1="145" x2="450" y2="210" stroke="#1F7A5A" strokeWidth="1.5" />
                    <line x1="450" y1="210" x2="410" y2="275" stroke="#E76F51" strokeWidth="2" />
                    <line x1="370" y1="455" x2="330" y2="400" stroke="#1F7A5A" strokeWidth="1.5" />
                    <line x1="330" y1="400" x2="380" y2="305" stroke="#E76F51" strokeWidth="2" />
                  </>
                )}
              </g>
            )}

            {/* Lesions Layer (Microaneurysms, Hemorrhages, Hard Exudates, Cotton Wool Spots) */}
            {activeLayers.lesions && (
              <g className="transition-opacity duration-300">
                {/* Mild Case: Just 4 isolated Microaneurysms */}
                {isMild && (
                  <g>
                    <circle
                      cx="430"
                      cy="180"
                      r="4"
                      fill="#E76F51"
                      stroke="#FFFDF8"
                      strokeWidth="1"
                      className="cursor-pointer animate-ping"
                      onMouseEnter={() => setHoveredElement('Microaneurysm #1 (Superior-Temporal quadrant) — Area: 28 μm²')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <circle cx="430" cy="180" r="3.5" fill="#E76F51" />
                    <circle cx="445" cy="195" r="3" fill="#E76F51" stroke="#FFFDF8" strokeWidth="0.8" />
                    <circle cx="340" cy="430" r="3.5" fill="#E76F51" stroke="#FFFDF8" strokeWidth="0.8" />
                    <circle cx="270" cy="410" r="3" fill="#E76F51" stroke="#FFFDF8" strokeWidth="0.8" />
                  </g>
                )}

                {/* Severe Case: Widespread Blot Hemorrhages + Hard Exudates near Macula + Cotton Wool Spots */}
                {isSevere && (
                  <g>
                    {/* Hard Exudates (Lipid circinate ring encroaching on Macula) */}
                    <g
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredElement('Hard Exudate Circinate Ring — 420μm from Fovea Centralis. Macular Edema High Threat!')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <circle cx="360" cy="280" r="5.5" fill="#FFF2D6" stroke="#E9A23B" strokeWidth="1.5" />
                      <circle cx="368" cy="272" r="4.5" fill="#FFF2D6" stroke="#E9A23B" strokeWidth="1.5" />
                      <circle cx="405" cy="275" r="5" fill="#FFF2D6" stroke="#E9A23B" strokeWidth="1.5" />
                      <circle cx="415" cy="285" r="6" fill="#FFF2D6" stroke="#E9A23B" strokeWidth="1.5" />
                      <circle cx="400" cy="330" r="5" fill="#FFF2D6" stroke="#E9A23B" strokeWidth="1.5" />
                      <circle cx="365" cy="325" r="4" fill="#FFF2D6" stroke="#E9A23B" strokeWidth="1.5" />
                    </g>

                    {/* Extensive Blot & Flame Hemorrhages in all 4 quadrants (ETDRS 4-2-1 Rule) */}
                    <ellipse cx="450" cy="210" rx="14" ry="9" fill="#8B1E0F" stroke="#E76F51" strokeWidth="1.5" />
                    <ellipse cx="480" cy="235" rx="12" ry="7" fill="#8B1E0F" stroke="#E76F51" strokeWidth="1" />
                    <ellipse cx="320" cy="180" rx="11" ry="8" fill="#8B1E0F" stroke="#E76F51" strokeWidth="1" />
                    <ellipse cx="250" cy="370" rx="16" ry="10" fill="#8B1E0F" stroke="#E76F51" strokeWidth="1.5" />
                    <ellipse cx="330" cy="400" rx="13" ry="8" fill="#8B1E0F" stroke="#E76F51" strokeWidth="1" />
                    <ellipse cx="440" cy="420" rx="15" ry="11" fill="#8B1E0F" stroke="#E76F51" strokeWidth="1.5" />
                    <ellipse cx="110" cy="250" rx="12" ry="7" fill="#8B1E0F" stroke="#E76F51" strokeWidth="1" />

                    {/* Cotton Wool Spots (Ischemia / Axonal swelling) */}
                    <ellipse cx="470" cy="170" rx="10" ry="8" fill="#FFFDF8" opacity="0.8" stroke="#E7EEE6" strokeWidth="1" />
                    <ellipse cx="280" cy="460" rx="9" ry="7" fill="#FFFDF8" opacity="0.8" stroke="#E7EEE6" strokeWidth="1" />
                  </g>
                )}
              </g>
            )}
          </svg>
        </div>

        {/* Live Hover Telemetry Readout */}
        <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
          <div className="bg-[#17221C]/90 backdrop-blur-md border border-[#3A4840] text-[#FFFDF8] px-3 py-1.5 rounded-xl text-xs font-mono flex items-center justify-between">
            <span className="truncate">
              {hoveredElement ? hoveredElement : 'Hover anatomical features or lesions for telemetry'}
            </span>
            <span className="text-[10px] text-[#2CA077] ml-2 shrink-0">
              {zoom > 1 ? `${Math.round(zoom * 100)}% Zoom` : '1.0x Scale'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Legend */}
      <div className="p-4 bg-[#FFFDF8] border-t border-[#DDE5DC] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#1F7A5A]" />
          <span className="text-[#17221C]">Retinal Vessels</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#E9A23B]" />
          <span className="text-[#17221C]">Optic Disc / FAZ</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#E76F51]" />
          <span className="text-[#17221C]">Lesions (MA / Hems)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FFF2D6] border border-[#E9A23B]" />
          <span className="text-[#17221C]">Hard Exudates (Lipids)</span>
        </div>
      </div>
    </div>
  );
};
