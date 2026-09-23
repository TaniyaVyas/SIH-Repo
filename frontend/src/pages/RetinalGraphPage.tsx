import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ModulePipelineNav } from '../components/layout/ModulePipelineNav';
import { ActiveScanPipelineBanner } from '../components/layout/ActiveScanPipelineBanner';
import { useRetinaData } from '../context/RetinaContext';
import { useAuth } from '../context/AuthContext';
import {
  Network,
  ArrowRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Eye,
  Activity,
  Sparkles,
  Cpu,
  Layers,
  Crosshair,
  Info,
  CheckCircle2,
  GitCommit,
  Share2,
  Move,
  Target,
  BarChart2,
  Compass,
  Sliders,
  ShieldCheck,
  TrendingUp,
  Circle
} from 'lucide-react';

// ─── TYPES & INTERFACES ───
export type NodeType =
  | 'Optic Disc Core'
  | 'Optic Disc Boundary'
  | 'Fovea Centralis'
  | 'Vessel Junction'
  | 'Cellular Network'
  | 'Lesion Node';

export type FunctionalCategory =
  | 'Vascular Junction'
  | 'Disc Boundary'
  | 'Cellular Network'
  | 'Landmark Root'
  | 'Pathology Anchor';

export type EdgeType = 'Connectivity' | 'Topology' | 'Spatial Relationship';

export interface RetinalGraphNode {
  id: string;
  name: string;
  type: NodeType;
  functionalCategory: FunctionalCategory;
  x: number;
  y: number;
  radius: number;
  color: string;
  quadrant: string;
  degree: number;
  structuralRole: string;
  clinicalSignificance: string;
  fovealDistance: string;
  attentionWeight: number;
  geometricFeature?: string;
}

export interface RetinalGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  label: string;
  weight: number;
  color: string;
  distanceMicrons: number;
  vesselWidthMicrons?: number; // Calibre width in μm
  branchingAngleDeg?: number; // Branching angle θ
  tortuosityIndex?: number; // Geometric Tortuosity τ = L_arc / L_chord - 1
  branchingPattern?: string; // Hierarchical pattern description
}

// ─── COMPREHENSIVE STRUCTURAL & FUNCTIONAL NODES ───
const GRAPH_NODES: RetinalGraphNode[] = [
  // ── 1. OPTIC DISC ROOT & BOUNDARY NODES (Landmarks & Boundaries) ──
  {
    id: 'disc',
    name: 'Optic Nerve Head (CRA/CRV Origin)',
    type: 'Optic Disc Core',
    functionalCategory: 'Landmark Root',
    x: 155,
    y: 250,
    radius: 24,
    color: '#E9A23B',
    quadrant: 'Nasal Landmark Origin',
    degree: 6,
    structuralRole: 'Primary Vascular Root (Central Retinal Artery & Vein Trunk)',
    clinicalSignificance: 'Origin anchor for spatial coordinate normalization and cup-to-disc ratio (CDR 0.38).',
    fovealDistance: '3,450 μm (Inter-landmark Horizon)',
    attentionWeight: 0.88,
    geometricFeature: 'Optic Disc Boundary Origin • Mean Diameter 1.82 mm',
  },
  {
    id: 'disc-rim-sup',
    name: 'Superior Neuroretinal Rim Boundary',
    type: 'Optic Disc Boundary',
    functionalCategory: 'Disc Boundary',
    x: 155,
    y: 224,
    radius: 9,
    color: '#F4A261',
    quadrant: 'Superior Optic Rim',
    degree: 3,
    structuralRole: 'Neuroretinal Rim Boundary Contour (ISNT Rule Anchor)',
    clinicalSignificance: 'Superior rim thickness monitored to exclude glaucomatous cupping or disc edema.',
    fovealDistance: '3,480 μm',
    attentionWeight: 0.72,
    geometricFeature: 'Rim Thickness: 320 μm • Normal ISNT compliance',
  },
  {
    id: 'disc-rim-inf',
    name: 'Inferior Neuroretinal Rim Boundary',
    type: 'Optic Disc Boundary',
    functionalCategory: 'Disc Boundary',
    x: 155,
    y: 276,
    radius: 9,
    color: '#F4A261',
    quadrant: 'Inferior Optic Rim',
    degree: 3,
    structuralRole: 'Inferior Neuroretinal Margin Contour (Thickest Rim)',
    clinicalSignificance: 'Inferior rim must be thickest per ISNT rule; vital for papilledema differential.',
    fovealDistance: '3,470 μm',
    attentionWeight: 0.74,
    geometricFeature: 'Rim Thickness: 380 μm • ISNT Rule Concordant',
  },
  {
    id: 'disc-cup-margin',
    name: 'Physiological Cup Margin Anchor',
    type: 'Optic Disc Boundary',
    functionalCategory: 'Disc Boundary',
    x: 168,
    y: 250,
    radius: 8,
    color: '#F4A261',
    quadrant: 'Central Optic Cup',
    degree: 2,
    structuralRole: 'Excavation Boundary Landmark',
    clinicalSignificance: 'Vertical cup-to-disc ratio baseline calculated relative to outer disc rim boundary.',
    fovealDistance: '3,320 μm',
    attentionWeight: 0.69,
    geometricFeature: 'Cup Diameter: 0.71 mm • Vertical Ratio: 0.38',
  },

  // ── 2. CENTRAL MACULA & CELLULAR NETWORK NODES ──
  {
    id: 'fovea',
    name: 'Fovea Centralis (FAZ Center)',
    type: 'Fovea Centralis',
    functionalCategory: 'Landmark Root',
    x: 350,
    y: 255,
    radius: 20,
    color: '#124B3A',
    quadrant: 'Central Macular Axis',
    degree: 7,
    structuralRole: 'High-Acuity Photoreceptor Center & Avascular Core',
    clinicalSignificance: 'Highest clinical weight; any lesion proximity <500μm triggers CSME vision threat.',
    fovealDistance: '0 μm (Geometric Center)',
    attentionWeight: 0.99,
    geometricFeature: 'Visual Axis Coordinate (0,0) • Avascular Core Diameter: 500 μm',
  },
  {
    id: 'faz-rim-sup',
    name: 'FAZ Superior Cellular Boundary',
    type: 'Cellular Network',
    functionalCategory: 'Cellular Network',
    x: 350,
    y: 235,
    radius: 8,
    color: '#2A9D8F',
    quadrant: 'Superior Parafoveal Ring',
    degree: 4,
    structuralRole: 'Capillary Plexus Endothelial Barrier (FAZ Perimeter)',
    clinicalSignificance: 'Terminal capillary boundary; evaluated for ischemic enlargement or capillary dropout.',
    fovealDistance: '240 μm',
    attentionWeight: 0.94,
    geometricFeature: 'FAZ Boundary Curvature: 0.92 Circularity Index',
  },
  {
    id: 'faz-rim-inf',
    name: 'FAZ Inferior Cellular Boundary',
    type: 'Cellular Network',
    functionalCategory: 'Cellular Network',
    x: 350,
    y: 275,
    radius: 8,
    color: '#2A9D8F',
    quadrant: 'Inferior Parafoveal Ring',
    degree: 4,
    structuralRole: 'Terminal Capillary Loop Margin',
    clinicalSignificance: 'Monitors capillary ring integrity; disruption marks diabetic foveal ischemia.',
    fovealDistance: '250 μm',
    attentionWeight: 0.92,
    geometricFeature: 'FAZ Boundary Calibre: 18 μm Capillary Loop',
  },
  {
    id: 'faz-rim-temp',
    name: 'FAZ Temporal Cellular Perimeter',
    type: 'Cellular Network',
    functionalCategory: 'Cellular Network',
    x: 372,
    y: 255,
    radius: 8,
    color: '#2A9D8F',
    quadrant: 'Temporal Parafoveal Rim',
    degree: 3,
    structuralRole: 'Cellular Capillary Meshwork Enclosure',
    clinicalSignificance: 'Temporal border bordering circinate lipid exudates and microaneurysm cluster.',
    fovealDistance: '260 μm',
    attentionWeight: 0.91,
    geometricFeature: 'FAZ Area Segment: 0.28 mm² Baseline Area',
  },
  {
    id: 'cell-plexus-sup',
    name: 'Supero-Macular Capillary Meshwork',
    type: 'Cellular Network',
    functionalCategory: 'Cellular Network',
    x: 320,
    y: 195,
    radius: 9,
    color: '#2A9D8F',
    quadrant: 'Supero-Macular Plexus',
    degree: 4,
    structuralRole: 'Deep Capillary Plexus Anastomotic Node',
    clinicalSignificance: 'High metabolic exchange region prone to focal microvascular outpouching.',
    fovealDistance: '680 μm',
    attentionWeight: 0.87,
    geometricFeature: 'Capillary Density: 48.2% • Inter-capillary distance 42 μm',
  },

  // ── 3. BLOOD VESSEL JUNCTIONS & ARCADES (Branching & Angles) ──
  {
    id: 'vessel-sta',
    name: 'Superior Temporal Artery Trunk',
    type: 'Vessel Junction',
    functionalCategory: 'Vascular Junction',
    x: 235,
    y: 165,
    radius: 12,
    color: '#1F7A5A',
    quadrant: 'Supero-Temporal Arcade',
    degree: 4,
    structuralRole: 'Primary Order-1 Arteriolar Supply',
    clinicalSignificance: 'Calibre 118 μm; normal arteriolar-to-venular ratio (AVR 0.81).',
    fovealDistance: '1,840 μm',
    attentionWeight: 0.82,
    geometricFeature: 'Vessel Calibre: 118 μm • Order 1 Arteriolar Conduit',
  },
  {
    id: 'vessel-ita',
    name: 'Inferior Temporal Artery Trunk',
    type: 'Vessel Junction',
    functionalCategory: 'Vascular Junction',
    x: 240,
    y: 335,
    radius: 12,
    color: '#1F7A5A',
    quadrant: 'Infero-Temporal Arcade',
    degree: 4,
    structuralRole: 'Primary Order-1 Arteriolar Supply',
    clinicalSignificance: 'Main feeder vessel supplying inferior macular and peripheral capillary beds.',
    fovealDistance: '1,920 μm',
    attentionWeight: 0.79,
    geometricFeature: 'Vessel Calibre: 114 μm • Order 1 Arteriolar Conduit',
  },
  {
    id: 'vessel-stv',
    name: 'Superior Temporal Vein Trunk',
    type: 'Vessel Junction',
    functionalCategory: 'Vascular Junction',
    x: 280,
    y: 135,
    radius: 12,
    color: '#1F7A5A',
    quadrant: 'Supero-Temporal Mid-Arcade',
    degree: 3,
    structuralRole: 'Order-1 Venous Return Channel',
    clinicalSignificance: 'Calibre 146 μm; evaluated for focal constrictions and venous beading.',
    fovealDistance: '1,980 μm',
    attentionWeight: 0.76,
    geometricFeature: 'Vessel Calibre: 146 μm • Order 1 Venular Conduit',
  },
  {
    id: 'vessel-itv',
    name: 'Inferior Temporal Vein Trunk',
    type: 'Vessel Junction',
    functionalCategory: 'Vascular Junction',
    x: 275,
    y: 370,
    radius: 12,
    color: '#1F7A5A',
    quadrant: 'Infero-Temporal Mid-Arcade',
    degree: 3,
    structuralRole: 'Order-1 Venous Return Channel',
    clinicalSignificance: 'Monitored for venous loops or tortuosity indicative of retinal ischemia.',
    fovealDistance: '2,150 μm',
    attentionWeight: 0.74,
    geometricFeature: 'Vessel Calibre: 142 μm • Tortuosity Index τ = 0.18',
  },
  {
    id: 'vessel-sna',
    name: 'Superior Nasal Artery',
    type: 'Vessel Junction',
    functionalCategory: 'Vascular Junction',
    x: 95,
    y: 170,
    radius: 10,
    color: '#1F7A5A',
    quadrant: 'Supero-Nasal Quadrant',
    degree: 2,
    structuralRole: 'Nasal Vascular Feed',
    clinicalSignificance: 'Supplies nasal hemiretina; landmark for 4-quadrant ETDRS compliance.',
    fovealDistance: '3,850 μm',
    attentionWeight: 0.58,
    geometricFeature: 'Vessel Calibre: 84 μm • Low tortuosity baseline',
  },
  {
    id: 'vessel-ina',
    name: 'Inferior Nasal Artery',
    type: 'Vessel Junction',
    functionalCategory: 'Vascular Junction',
    x: 100,
    y: 330,
    radius: 10,
    color: '#1F7A5A',
    quadrant: 'Infero-Nasal Quadrant',
    degree: 2,
    structuralRole: 'Nasal Vascular Feed',
    clinicalSignificance: 'Inferior nasal boundary marking low-risk peripheral zone.',
    fovealDistance: '3,920 μm',
    attentionWeight: 0.55,
    geometricFeature: 'Vessel Calibre: 82 μm • Low tortuosity baseline',
  },
  {
    id: 'junc-sta-alpha',
    name: 'Bifurcation Junction Alpha (STA)',
    type: 'Vessel Junction',
    functionalCategory: 'Vascular Junction',
    x: 295,
    y: 155,
    radius: 10,
    color: '#2D8A68',
    quadrant: 'Supero-Temporal Branch Point',
    degree: 4,
    structuralRole: 'Arteriolar Bifurcation (Order-1 to Order-2)',
    clinicalSignificance: 'Branching angle 74.2°; Murray minimum energy law compliance verified.',
    fovealDistance: '1,520 μm',
    attentionWeight: 0.85,
    geometricFeature: 'Bifurcation Angle θ: 74.2° • Murray Law Ratio: 0.89',
  },
  {
    id: 'junc-ita-beta',
    name: 'Bifurcation Junction Beta (ITA)',
    type: 'Vessel Junction',
    functionalCategory: 'Vascular Junction',
    x: 305,
    y: 345,
    radius: 10,
    color: '#2D8A68',
    quadrant: 'Infero-Temporal Branch Point',
    degree: 4,
    structuralRole: 'Arteriolar Bifurcation (Order-1 to Order-2)',
    clinicalSignificance: 'Critical hemodynamic shear stress node; monitored for microvascular outpouching.',
    fovealDistance: '1,610 μm',
    attentionWeight: 0.84,
    geometricFeature: 'Bifurcation Angle θ: 68.5° • High shear stress zone',
  },
  {
    id: 'junc-av-crossing',
    name: 'Arterio-Venous Crossing (AV-1)',
    type: 'Vessel Junction',
    functionalCategory: 'Vascular Junction',
    x: 260,
    y: 148,
    radius: 9,
    color: '#2D8A68',
    quadrant: 'Supero-Temporal Arcade Crossing',
    degree: 3,
    structuralRole: 'Common Adventitial Arteriovenous Sheath',
    clinicalSignificance: 'Arterial stiffening causes venous nicking or branch retinal vein occlusion (BRVO).',
    fovealDistance: '1,720 μm',
    attentionWeight: 0.81,
    geometricFeature: 'Crossing Angle: 86.4° • Calibre Deflection: 8% (Nominal)',
  },
  {
    id: 'junc-cap-sup',
    name: 'Perifoveal Capillary Anastomosis Supero',
    type: 'Vessel Junction',
    functionalCategory: 'Vascular Junction',
    x: 340,
    y: 205,
    radius: 9,
    color: '#2D8A68',
    quadrant: 'Superior Parafoveal Ring',
    degree: 4,
    structuralRole: 'Capillary Plexus Anastomosis to FAZ',
    clinicalSignificance: 'Feeds superior macular microcirculation; adjacent to hard exudates.',
    fovealDistance: '520 μm',
    attentionWeight: 0.93,
    geometricFeature: 'Branching Angle θ: 81.3° • Calibre: 34 μm',
  },
  {
    id: 'junc-cap-inf',
    name: 'Perifoveal Capillary Anastomosis Infero',
    type: 'Vessel Junction',
    functionalCategory: 'Vascular Junction',
    x: 345,
    y: 305,
    radius: 9,
    color: '#2D8A68',
    quadrant: 'Inferior Parafoveal Ring',
    degree: 4,
    structuralRole: 'Capillary Plexus Anastomosis to FAZ',
    clinicalSignificance: 'Inferior capillary arcade draining into venular manifold.',
    fovealDistance: '540 μm',
    attentionWeight: 0.91,
    geometricFeature: 'Branching Angle θ: 78.4° • Calibre: 32 μm',
  },

  // ── 4. LESION NODES (Pathology Anchors) ──
  {
    id: 'lesion-hex1',
    name: 'Hard Exudate Circinate Cluster (HEX-01)',
    type: 'Lesion Node',
    functionalCategory: 'Pathology Anchor',
    x: 380,
    y: 220,
    radius: 11,
    color: '#E76F51',
    quadrant: 'Supero-Temporal Macular Border',
    degree: 3,
    structuralRole: 'Lipid/Lipoprotein Extravasation Plaque',
    clinicalSignificance: '420 μm from Fovea — Clinically Significant Macular Edema (CSME) Threat!',
    fovealDistance: '420 μm (CRITICAL)',
    attentionWeight: 0.98,
    geometricFeature: 'Plaque Area: 0.08 mm² • Geodesic Distance to FAZ: 420 μm',
  },
  {
    id: 'lesion-hex2',
    name: 'Hard Exudate Satellite (HEX-02)',
    type: 'Lesion Node',
    functionalCategory: 'Pathology Anchor',
    x: 395,
    y: 275,
    radius: 10,
    color: '#E76F51',
    quadrant: 'Infero-Temporal Macular Margin',
    degree: 3,
    structuralRole: 'Circinate Lipid Deposition',
    clinicalSignificance: 'Chronic deep microvascular barrier breakdown; high GNN attention weight.',
    fovealDistance: '680 μm',
    attentionWeight: 0.91,
    geometricFeature: 'Plaque Area: 0.05 mm² • Bordering inferior capillary bed',
  },
  {
    id: 'lesion-ma1',
    name: 'Microaneurysm Cluster Alpha (MA-01)',
    type: 'Lesion Node',
    functionalCategory: 'Pathology Anchor',
    x: 315,
    y: 215,
    radius: 9,
    color: '#E76F51',
    quadrant: 'Supero-Nasal Parafovea',
    degree: 3,
    structuralRole: 'Focal Saccular Capillary Dilatation',
    clinicalSignificance: 'Earliest sign of diabetic microangiopathy; pericyte loss verified.',
    fovealDistance: '510 μm',
    attentionWeight: 0.88,
    geometricFeature: 'Lumen Diameter: 46 μm • Wall Thickness Attenuation: 62%',
  },
  {
    id: 'lesion-ma2',
    name: 'Microaneurysm Cluster Beta (MA-02)',
    type: 'Lesion Node',
    functionalCategory: 'Pathology Anchor',
    x: 330,
    y: 315,
    radius: 9,
    color: '#E76F51',
    quadrant: 'Infero-Temporal Parafovea',
    degree: 2,
    structuralRole: 'Pericapillary Out-pouching',
    clinicalSignificance: 'Bordering the inferior perifoveal capillary bed.',
    fovealDistance: '640 μm',
    attentionWeight: 0.83,
    geometricFeature: 'Lumen Diameter: 42 μm • Proximity to capillary feeder: 110 μm',
  },
  {
    id: 'lesion-hem1',
    name: 'Blot Hemorrhage Deep (HEM-01)',
    type: 'Lesion Node',
    functionalCategory: 'Pathology Anchor',
    x: 260,
    y: 275,
    radius: 12,
    color: '#E76F51',
    quadrant: 'Inferior Papillomacular Zone',
    degree: 2,
    structuralRole: 'Intra-retinal Rupture in Inner Nuclear Layer',
    clinicalSignificance: 'Severe NPDR criterion under ETDRS 4-2-1 rule.',
    fovealDistance: '920 μm',
    attentionWeight: 0.89,
    geometricFeature: 'Hemorrhage Area: 0.14 mm² • Deep INL localization',
  },
  {
    id: 'lesion-cws1',
    name: 'Cotton Wool Spot Ischemia (CWS-01)',
    type: 'Lesion Node',
    functionalCategory: 'Pathology Anchor',
    x: 265,
    y: 185,
    radius: 11,
    color: '#E76F51',
    quadrant: 'Supero-Temporal Arcade Margin',
    degree: 2,
    structuralRole: 'Axoplasmic Stasis in Nerve Fiber Layer',
    clinicalSignificance: 'Focal pre-capillary arteriolar micro-infarct denoting local hypoxia.',
    fovealDistance: '1,120 μm',
    attentionWeight: 0.86,
    geometricFeature: 'Ischemic Opacity: 0.09 mm² • Nerve fiber layer edema',
  },
];

// ─── COMPREHENSIVE EDGES WITH GEOMETRIC & TORTUOSITY ATTRIBUTES ───
const GRAPH_EDGES: RetinalGraphEdge[] = [
  // ── 1. CONNECTIVITY EDGES (14) - Solid Emerald (#1F7A5A) ──
  { id: 'e-conn-1', sourceId: 'disc', targetId: 'vessel-sta', type: 'Connectivity', label: 'Arterial Feed (STA)', weight: 0.94, color: '#1F7A5A', distanceMicrons: 1240, vesselWidthMicrons: 142, branchingAngleDeg: 42.1, tortuosityIndex: 0.08, branchingPattern: 'Order-1 Main Arteriolar Trunk' },
  { id: 'e-conn-2', sourceId: 'disc', targetId: 'vessel-ita', type: 'Connectivity', label: 'Arterial Feed (ITA)', weight: 0.92, color: '#1F7A5A', distanceMicrons: 1280, vesselWidthMicrons: 138, branchingAngleDeg: 44.3, tortuosityIndex: 0.07, branchingPattern: 'Order-1 Main Arteriolar Trunk' },
  { id: 'e-conn-3', sourceId: 'disc', targetId: 'vessel-sna', type: 'Connectivity', label: 'Arterial Feed (SNA)', weight: 0.85, color: '#1F7A5A', distanceMicrons: 980, vesselWidthMicrons: 92, branchingAngleDeg: 55.4, tortuosityIndex: 0.06, branchingPattern: 'Order-1 Nasal Conduit' },
  { id: 'e-conn-4', sourceId: 'disc', targetId: 'vessel-ina', type: 'Connectivity', label: 'Arterial Feed (INA)', weight: 0.83, color: '#1F7A5A', distanceMicrons: 1040, vesselWidthMicrons: 88, branchingAngleDeg: 52.8, tortuosityIndex: 0.06, branchingPattern: 'Order-1 Nasal Conduit' },
  { id: 'e-conn-5', sourceId: 'vessel-sta', targetId: 'junc-sta-alpha', type: 'Connectivity', label: 'Bifurcation Branch', weight: 0.88, color: '#1F7A5A', distanceMicrons: 720, vesselWidthMicrons: 118, branchingAngleDeg: 74.2, tortuosityIndex: 0.12, branchingPattern: 'Primary Bifurcation Order 1→2' },
  { id: 'e-conn-6', sourceId: 'junc-sta-alpha', targetId: 'vessel-stv', type: 'Connectivity', label: 'Capillary Transition to Vein', weight: 0.79, color: '#1F7A5A', distanceMicrons: 610, vesselWidthMicrons: 146, branchingAngleDeg: 62.4, tortuosityIndex: 0.18, branchingPattern: 'Venular Drainage Loop' },
  { id: 'e-conn-7', sourceId: 'junc-sta-alpha', targetId: 'junc-cap-sup', type: 'Connectivity', label: 'Perifoveal Feeder Arteriole', weight: 0.91, color: '#1F7A5A', distanceMicrons: 760, vesselWidthMicrons: 64, branchingAngleDeg: 71.8, tortuosityIndex: 0.14, branchingPattern: 'Order-2 Parafoveal Feeder' },
  { id: 'e-conn-8', sourceId: 'vessel-ita', targetId: 'junc-ita-beta', type: 'Connectivity', label: 'Bifurcation Branch', weight: 0.87, color: '#1F7A5A', distanceMicrons: 740, vesselWidthMicrons: 114, branchingAngleDeg: 68.5, tortuosityIndex: 0.11, branchingPattern: 'Primary Bifurcation Order 1→2' },
  { id: 'e-conn-9', sourceId: 'junc-ita-beta', targetId: 'vessel-itv', type: 'Connectivity', label: 'Capillary Transition to Vein', weight: 0.78, color: '#1F7A5A', distanceMicrons: 630, vesselWidthMicrons: 142, branchingAngleDeg: 59.2, tortuosityIndex: 0.22, branchingPattern: 'Venular Return Loop (High Tortuosity)' },
  { id: 'e-conn-10', sourceId: 'junc-ita-beta', targetId: 'junc-cap-inf', type: 'Connectivity', label: 'Perifoveal Feeder Arteriole', weight: 0.89, color: '#1F7A5A', distanceMicrons: 780, vesselWidthMicrons: 62, branchingAngleDeg: 73.1, tortuosityIndex: 0.13, branchingPattern: 'Order-2 Parafoveal Feeder' },
  { id: 'e-conn-11', sourceId: 'junc-cap-sup', targetId: 'faz-rim-sup', type: 'Connectivity', label: 'Terminal FAZ Capillary Loop', weight: 0.96, color: '#1F7A5A', distanceMicrons: 280, vesselWidthMicrons: 28, branchingAngleDeg: 81.3, tortuosityIndex: 0.05, branchingPattern: 'Terminal Capillary Anastomosis' },
  { id: 'e-conn-12', sourceId: 'junc-cap-inf', targetId: 'faz-rim-inf', type: 'Connectivity', label: 'Terminal FAZ Capillary Loop', weight: 0.94, color: '#1F7A5A', distanceMicrons: 290, vesselWidthMicrons: 26, branchingAngleDeg: 78.4, tortuosityIndex: 0.05, branchingPattern: 'Terminal Capillary Anastomosis' },
  { id: 'e-conn-13', sourceId: 'faz-rim-sup', targetId: 'faz-rim-temp', type: 'Connectivity', label: 'FAZ Cellular Boundary Arc', weight: 0.97, color: '#1F7A5A', distanceMicrons: 220, vesselWidthMicrons: 22, branchingAngleDeg: 90.0, tortuosityIndex: 0.04, branchingPattern: 'Cellular Capillary Perimeter' },
  { id: 'e-conn-14', sourceId: 'faz-rim-temp', targetId: 'faz-rim-inf', type: 'Connectivity', label: 'FAZ Cellular Boundary Arc', weight: 0.97, color: '#1F7A5A', distanceMicrons: 220, vesselWidthMicrons: 22, branchingAngleDeg: 90.0, tortuosityIndex: 0.04, branchingPattern: 'Cellular Capillary Perimeter' },

  // ── 2. TOPOLOGY & BOUNDARY EDGES (8) - Dashed Saffron (#E9A23B) ──
  { id: 'e-topo-1', sourceId: 'disc', targetId: 'fovea', type: 'Topology', label: 'Primary Anatomical Horizon Vector', weight: 0.99, color: '#E9A23B', distanceMicrons: 3450, vesselWidthMicrons: 0, branchingAngleDeg: 0, tortuosityIndex: 0.02, branchingPattern: 'Geometric Inter-landmark Baseline' },
  { id: 'e-topo-2', sourceId: 'disc', targetId: 'disc-rim-sup', type: 'Topology', label: 'Superior Rim Radial Boundary', weight: 0.88, color: '#E9A23B', distanceMicrons: 320, vesselWidthMicrons: 0, branchingAngleDeg: 90.0, tortuosityIndex: 0.01, branchingPattern: 'Optic Disc Boundary Radial' },
  { id: 'e-topo-3', sourceId: 'disc', targetId: 'disc-rim-inf', type: 'Topology', label: 'Inferior Rim Radial Boundary', weight: 0.89, color: '#E9A23B', distanceMicrons: 380, vesselWidthMicrons: 0, branchingAngleDeg: 90.0, tortuosityIndex: 0.01, branchingPattern: 'Optic Disc Boundary Radial' },
  { id: 'e-topo-4', sourceId: 'junc-sta-alpha', targetId: 'junc-ita-beta', type: 'Topology', label: 'Vertical Arcade Symmetry Axis', weight: 0.81, color: '#E9A23B', distanceMicrons: 2280, vesselWidthMicrons: 0, branchingAngleDeg: 88.2, tortuosityIndex: 0.05, branchingPattern: 'Arcade Spatial Symmetry Axis' },
  { id: 'e-topo-5', sourceId: 'vessel-sta', targetId: 'junc-av-crossing', type: 'Topology', label: 'AV Crossing Adventitia', weight: 0.84, color: '#E9A23B', distanceMicrons: 420, vesselWidthMicrons: 120, branchingAngleDeg: 86.4, tortuosityIndex: 0.15, branchingPattern: 'AV Crossing Adventitial Sheath' },
  { id: 'e-topo-6', sourceId: 'fovea', targetId: 'faz-rim-sup', type: 'Topology', label: 'Radial FAZ Radius Vector', weight: 0.95, color: '#E9A23B', distanceMicrons: 240, vesselWidthMicrons: 0, branchingAngleDeg: 90.0, tortuosityIndex: 0.01, branchingPattern: 'FAZ Radial Radius' },
  { id: 'e-topo-7', sourceId: 'fovea', targetId: 'faz-rim-inf', type: 'Topology', label: 'Radial FAZ Radius Vector', weight: 0.95, color: '#E9A23B', distanceMicrons: 250, vesselWidthMicrons: 0, branchingAngleDeg: 90.0, tortuosityIndex: 0.01, branchingPattern: 'FAZ Radial Radius' },
  { id: 'e-topo-8', sourceId: 'cell-plexus-sup', targetId: 'faz-rim-sup', type: 'Topology', label: 'Plexus-to-Ring Bridge', weight: 0.86, color: '#E9A23B', distanceMicrons: 480, vesselWidthMicrons: 24, branchingAngleDeg: 72.0, tortuosityIndex: 0.09, branchingPattern: 'Capillary Network Bridge' },

  // ── 3. SPATIAL RELATIONSHIP EDGES (8) - Dotted Coral (#E76F51) ──
  { id: 'e-spat-1', sourceId: 'lesion-hex1', targetId: 'fovea', type: 'Spatial Relationship', label: 'Macular Edema Risk Vector', weight: 0.98, color: '#E76F51', distanceMicrons: 420, vesselWidthMicrons: 0, branchingAngleDeg: 0, tortuosityIndex: 0.01, branchingPattern: 'Threat Vector to Foveal Axis' },
  { id: 'e-spat-2', sourceId: 'lesion-hex1', targetId: 'junc-cap-sup', type: 'Spatial Relationship', label: 'Microvascular Leakage Source', weight: 0.87, color: '#E76F51', distanceMicrons: 410, vesselWidthMicrons: 0, branchingAngleDeg: 0, tortuosityIndex: 0.02, branchingPattern: 'Capillary Leakage Conduit' },
  { id: 'e-spat-3', sourceId: 'lesion-hex2', targetId: 'fovea', type: 'Spatial Relationship', label: 'Macular Edema Risk Vector', weight: 0.90, color: '#E76F51', distanceMicrons: 680, vesselWidthMicrons: 0, branchingAngleDeg: 0, tortuosityIndex: 0.01, branchingPattern: 'Threat Vector to Foveal Axis' },
  { id: 'e-spat-4', sourceId: 'lesion-hex2', targetId: 'junc-cap-inf', type: 'Spatial Relationship', label: 'Microvascular Leakage Source', weight: 0.83, color: '#E76F51', distanceMicrons: 520, vesselWidthMicrons: 0, branchingAngleDeg: 0, tortuosityIndex: 0.02, branchingPattern: 'Capillary Leakage Conduit' },
  { id: 'e-spat-5', sourceId: 'lesion-hex1', targetId: 'lesion-hex2', type: 'Spatial Relationship', label: 'Circinate Plaque Clustering Array', weight: 0.89, color: '#E76F51', distanceMicrons: 620, vesselWidthMicrons: 0, branchingAngleDeg: 0, tortuosityIndex: 0.03, branchingPattern: 'Pathology Cluster Coupling' },
  { id: 'e-spat-6', sourceId: 'lesion-ma1', targetId: 'fovea', type: 'Spatial Relationship', label: 'Parafoveal Capillary Proximity', weight: 0.86, color: '#E76F51', distanceMicrons: 510, vesselWidthMicrons: 0, branchingAngleDeg: 0, tortuosityIndex: 0.01, branchingPattern: 'Threat Vector to Foveal Axis' },
  { id: 'e-spat-7', sourceId: 'lesion-ma1', targetId: 'vessel-sta', type: 'Spatial Relationship', label: 'Parent Vessel Branch Association', weight: 0.82, color: '#E76F51', distanceMicrons: 880, vesselWidthMicrons: 0, branchingAngleDeg: 0, tortuosityIndex: 0.04, branchingPattern: 'Hemodynamic Parent Supply' },
  { id: 'e-spat-8', sourceId: 'lesion-cws1', targetId: 'vessel-sta', type: 'Spatial Relationship', label: 'Pre-capillary Arteriolar Infarct Origin', weight: 0.84, color: '#E76F51', distanceMicrons: 490, vesselWidthMicrons: 0, branchingAngleDeg: 0, tortuosityIndex: 0.02, branchingPattern: 'Focal Ischemic Occlusion' },
];

export const RetinalGraphPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeImage, pipelineResults } = useRetinaData();

  // ─── STATE MANAGEMENT ───
  // Transformation animation stages: 0 = Image, 1 = Vessels, 2 = Nodes, 3 = Edges, 4 = Full Graph
  const [animStage, setAnimStage] = useState<number>(4);
  const [isPlayingSeq, setIsPlayingSeq] = useState<boolean>(false);

  // Interaction: selection & hover
  const [selectedNodeId, setSelectedNodeId] = useState<string>('lesion-hex1');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // View Mode: Topology, Tortuosity Heatmap, Calibre & Angles, Boundary Rings
  const [viewMode, setViewMode] = useState<'topology' | 'tortuosity' | 'calibre' | 'boundaries'>('topology');

  // Edge type filters
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Record<EdgeType, boolean>>({
    'Connectivity': true,
    'Topology': true,
    'Spatial Relationship': true,
  });

  // 3D Parallax Tilt state
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas Viewport Controls: Zoom & Pan
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // ─── PAGE ENTRANCE TRANSFORMATION SEQUENCE ───
  const runEntranceAnimation = () => {
    setIsPlayingSeq(true);
    setAnimStage(0);

    setTimeout(() => setAnimStage(1), 800);
    setTimeout(() => setAnimStage(2), 1600);
    setTimeout(() => setAnimStage(3), 2400);
    setTimeout(() => {
      setAnimStage(4);
      setIsPlayingSeq(false);
    }, 3200);
  };

  useEffect(() => {
    runEntranceAnimation();
  }, []);

  // ─── MOUSE 3D PARALLAX TILT ───
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -yPct * 8,
      y: xPct * 8,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setTilt({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Currently focused node and neighbors
  const focusNodeId = hoveredNodeId || selectedNodeId;
  const activeNode = GRAPH_NODES.find(n => n.id === focusNodeId) || GRAPH_NODES[0];

  const connectedNeighborIds = GRAPH_EDGES.filter(
    edge => edge.sourceId === activeNode.id || edge.targetId === activeNode.id
  ).map(edge => (edge.sourceId === activeNode.id ? edge.targetId : edge.sourceId));

  const visibleEdges = GRAPH_EDGES.filter(edge => activeEdgeTypes[edge.type]);
  const activeEdge = selectedEdgeId ? GRAPH_EDGES.find(e => e.id === selectedEdgeId) : null;

  // Helper for Tortuosity Heatmap Edge Colors
  const getTortuosityEdgeColor = (edge: RetinalGraphEdge) => {
    if (viewMode !== 'tortuosity') return edge.color;
    const tau = edge.tortuosityIndex ?? 0.05;
    if (tau > 0.20) return '#E76F51'; // High Tortuosity (Coral)
    if (tau > 0.10) return '#E9A23B'; // Moderate Curvature (Saffron)
    return '#1F7A5A'; // Normal Straight (Emerald)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-16 space-y-8 select-none">
      {/* ─── 1. PAGE HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A5A] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#65736B] uppercase">
              {t.modules.m5Badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#124B3A] tracking-tight">
            {t.modules.m5Title}
          </h1>
          <p className="text-xs sm:text-sm text-[#65736B]">
            {t.modules.m5Desc}
          </p>
        </div>

        {/* CTA to DR Classification */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/classification')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-md shadow-[#124B3A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            data-cursor="button"
          >
            <span>{t.modules.m5Action}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Active Scan Pipeline Banner */}
      <ActiveScanPipelineBanner currentModuleNumber={5} />

      {/* ─── 2. VIEW MODE SWITCHER & TRANSFORMATION BANNER ─── */}
      <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[10px] font-bold text-[#65736B] uppercase mr-1">
            VIEW OVERLAY:
          </span>
          {[
            { id: 'topology', label: 'Topology Network', icon: Network },
            { id: 'tortuosity', label: 'Tortuosity Heatmap', icon: TrendingUp },
            { id: 'calibre', label: 'Vessel Width & Angles (μm / θ)', icon: Compass },
            { id: 'boundaries', label: 'Disc & FAZ Boundaries', icon: Circle },
          ].map(mode => {
            const Icon = mode.icon;
            const isSelected = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#124B3A] text-white shadow-xs'
                    : 'bg-[#F8F6EF] text-[#65736B] hover:text-[#124B3A] hover:bg-[#FAF4ED]'
                }`}
              >
                <Icon size={12} className={isSelected ? 'text-[#E9A23B]' : ''} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Replay Sequence Button */}
        <button
          onClick={runEntranceAnimation}
          disabled={isPlayingSeq}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#65736B] hover:text-[#124B3A] hover:bg-[#F8F6EF] border border-[#DDE5DC] transition-all disabled:opacity-50 shrink-0"
          title="Replay Full Transformation Sequence"
        >
          <RotateCcw size={13} className={isPlayingSeq ? 'animate-spin' : ''} />
          <span>{isPlayingSeq ? 'Transforming...' : 'Replay Animation'}</span>
        </button>
      </div>

      {/* ─── 3. MAIN WORKSPACE GRID ─── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Large Interactive 3D Retinal Graph Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Edge Filter Pills & Viewport Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-xs">
            {/* Edge Filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] font-mono font-bold text-[#65736B] uppercase mr-1">
                EDGE MANIFOLDS:
              </span>
              {(['Connectivity', 'Topology', 'Spatial Relationship'] as const).map(type => (
                <button
                  key={type}
                  onClick={() =>
                    setActiveEdgeTypes(prev => ({ ...prev, [type]: !prev[type] }))
                  }
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    activeEdgeTypes[type]
                      ? type === 'Connectivity'
                        ? 'bg-[#1F7A5A] text-white shadow-2xs'
                        : type === 'Topology'
                        ? 'bg-[#E9A23B] text-[#17221C] shadow-2xs'
                        : 'bg-[#E76F51] text-white shadow-2xs'
                      : 'bg-[#F8F6EF] text-[#65736B] opacity-60 hover:opacity-100'
                  }`}
                  data-cursor="button"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        type === 'Connectivity'
                          ? '#1F7A5A'
                          : type === 'Topology'
                          ? '#E9A23B'
                          : '#E76F51',
                    }}
                  />
                  <span>{type}</span>
                </button>
              ))}
            </div>

            {/* Viewport Action Controls: Zoom, Pan, Reset, Fullscreen */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom(z => Math.max(0.8, z - 0.15))}
                className="p-1.5 rounded-lg text-[#65736B] hover:text-[#124B3A] hover:bg-[#F8F6EF] transition-colors"
                title="Zoom Out"
                data-cursor="button"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-[10px] font-mono font-bold text-[#124B3A] px-1">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(2.2, z + 0.15))}
                className="p-1.5 rounded-lg text-[#65736B] hover:text-[#124B3A] hover:bg-[#F8F6EF] transition-colors"
                title="Zoom In"
                data-cursor="button"
              >
                <ZoomIn size={15} />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-[#65736B] hover:text-[#124B3A] hover:bg-[#F8F6EF] transition-colors"
                title="Reset View (Scale & Pan)"
                data-cursor="button"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg text-[#65736B] hover:text-[#124B3A] hover:bg-[#F8F6EF] transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                data-cursor="button"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>

          {/* 3D PARALLAX CANVAS CONTAINER */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl bg-[#08170F] overflow-hidden border-2 border-[#1F7A5A]/40 shadow-inner flex items-center justify-center cursor-${
              isDragging ? 'grabbing' : 'grab'
            }`}
            style={{ perspective: 1100 }}
          >
            {/* Top-Left Viewport HUD Badge */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2 pointer-events-none">
              <span className="px-3 py-1 rounded-lg bg-[#17221C]/85 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white flex items-center gap-2 shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#1F7A5A] animate-pulse" />
                <span>
                  {viewMode === 'tortuosity' && 'MODE: GEOMETRIC TORTUOSITY HEATMAP (τ = L_arc / L_chord - 1)'}
                  {viewMode === 'calibre' && 'MODE: VESSEL CALIBRE (μm) & BRANCHING ANGLES (θ°)'}
                  {viewMode === 'boundaries' && 'MODE: OPTIC DISC & FAZ CELLULAR BOUNDARIES'}
                  {viewMode === 'topology' && 'MODE: HETEROGENEOUS ANATOMICAL GRAPH'}
                </span>
              </span>
            </div>

            {/* Top-Right Node Count Indicator */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-none">
              <span className="px-3 py-1 rounded-lg bg-[#17221C]/85 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#E9A23B] flex items-center gap-1.5 shadow-md">
                <GitCommit size={12} />
                <span>{GRAPH_NODES.length} NODES • {visibleEdges.length} EDGES</span>
              </span>
            </div>

            {/* Tortuosity Heatmap Floating Legend */}
            {viewMode === 'tortuosity' && (
              <div className="absolute top-14 left-4 z-30 p-2 rounded-xl bg-[#08170F]/90 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white flex flex-col gap-1 shadow-lg pointer-events-none">
                <span className="text-[#8E9E95] font-bold">TORTUOSITY INDEX (τ):</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
                  <span>&lt;0.10: Normal Calibre</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E9A23B]" />
                  <span>0.10-0.20: Elevated Curvature</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E76F51]" />
                  <span>&gt;0.20: High Tortuosity (Ischemia)</span>
                </div>
              </div>
            )}

            {/* 3D Tilting World Space */}
            <div
              className="relative w-[85%] h-[85%] max-w-[500px] aspect-square flex items-center justify-center transition-transform duration-100 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              }}
            >
              {/* LAYER 1: Base Retinal Image */}
              <div
                className="absolute inset-0 rounded-full overflow-hidden transition-opacity duration-700 pointer-events-none shadow-2xl"
                style={{
                  transform: 'translateZ(-20px)',
                  opacity: animStage >= 0 ? (animStage === 0 ? 0.95 : 0.45) : 0,
                }}
              >
                {activeImage ? (
                  <img src={activeImage} alt="Retinal Fundus" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <svg viewBox="0 0 500 500" className="w-full h-full">
                    <defs>
                      <radialGradient id="retina-deep-bg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#4a180f" />
                        <stop offset="45%" stopColor="#350f08" />
                        <stop offset="85%" stopColor="#1e0703" />
                        <stop offset="100%" stopColor="#0a0201" />
                      </radialGradient>
                    </defs>
                    <circle cx="250" cy="250" r="240" fill="url(#retina-deep-bg)" />
                    <circle cx="350" cy="255" r="45" fill="#2d0b06" opacity="0.6" />
                    <circle cx="350" cy="255" r="15" fill="#120402" opacity="0.8" />
                  </svg>
                )}
              </div>

              {/* LAYER 2: Vascular Tree & Anatomical Boundary Geometry */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-700"
                style={{
                  transform: 'translateZ(-5px)',
                  opacity: animStage >= 1 ? (animStage === 1 ? 0.9 : 0.5) : 0,
                }}
              >
                <svg viewBox="0 0 500 500" className="w-full h-full overflow-visible">
                  {/* Superior Temporal Artery */}
                  <path
                    d="M 155 250 Q 200 170 235 165 T 295 155 T 410 120"
                    fill="none"
                    stroke="#1F7A5A"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  {/* Inferior Temporal Artery */}
                  <path
                    d="M 155 250 Q 200 330 240 335 T 305 345 T 420 380"
                    fill="none"
                    stroke="#1F7A5A"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  {/* Superior Temporal Vein */}
                  <path
                    d="M 155 250 Q 220 150 280 135 T 390 100"
                    fill="none"
                    stroke="#124B3A"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  {/* Inferior Temporal Vein */}
                  <path
                    d="M 155 250 Q 220 350 275 370 T 400 395"
                    fill="none"
                    stroke="#124B3A"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  {/* Nasal Arterioles */}
                  <path d="M 155 250 Q 120 190 95 170" fill="none" stroke="#1F7A5A" strokeWidth="2.5" />
                  <path d="M 155 250 Q 120 310 100 330" fill="none" stroke="#1F7A5A" strokeWidth="2.5" />

                  {/* BOUNDARY OVERLAYS: Optic Disc & FAZ Rings (Active in boundary mode) */}
                  {viewMode === 'boundaries' && (
                    <g>
                      {/* Optic Disc Outer Rim Ring */}
                      <ellipse
                        cx="155"
                        cy="250"
                        rx="32"
                        ry="32"
                        fill="none"
                        stroke="#E9A23B"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                        className="animate-pulse"
                      />
                      <text x="155" y="212" textAnchor="middle" fill="#E9A23B" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        OPTIC DISC RIM (1.82 mm)
                      </text>

                      {/* FAZ Macular Exclusion Ring */}
                      <ellipse
                        cx="350"
                        cy="255"
                        rx="26"
                        ry="26"
                        fill="none"
                        stroke="#2A9D8F"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        className="animate-pulse"
                      />
                      <text x="350" y="222" textAnchor="middle" fill="#2A9D8F" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        FAZ BOUNDARY (500 μm)
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* LAYER 3: Graph Edges (Geometric Calibre, Angles & Tortuosity) */}
              <div
                className="absolute inset-0 pointer-events-auto transition-opacity duration-700"
                style={{
                  transform: 'translateZ(15px)',
                  opacity: animStage >= 3 ? 1 : 0,
                }}
              >
                <svg viewBox="0 0 500 500" className="w-full h-full overflow-visible">
                  <defs>
                    <radialGradient id="glow-disc" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFFDF8" />
                      <stop offset="50%" stopColor="#E9A23B" />
                      <stop offset="100%" stopColor="#a35f0f" />
                    </radialGradient>
                  </defs>

                  {/* Render Edges */}
                  {visibleEdges.map(edge => {
                    const source = GRAPH_NODES.find(n => n.id === edge.sourceId);
                    const target = GRAPH_NODES.find(n => n.id === edge.targetId);
                    if (!source || !target) return null;

                    const isConnectedToFocus =
                      edge.sourceId === focusNodeId || edge.targetId === focusNodeId;
                    const isAnyFocus = !!focusNodeId;
                    const isEdgeSelected = selectedEdgeId === edge.id;

                    const edgeColor = isEdgeSelected ? '#FFFDF8' : getTortuosityEdgeColor(edge);
                    const midX = (source.x + target.x) / 2;
                    const midY = (source.y + target.y) / 2;

                    return (
                      <g
                        key={edge.id}
                        className="transition-all duration-300 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEdgeId(edge.id);
                        }}
                      >
                        {/* Outer Glow for Focused / Selected Edges */}
                        {(isConnectedToFocus || isEdgeSelected) && (
                          <line
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={edgeColor}
                            strokeWidth="6"
                            opacity="0.5"
                            className="animate-pulse"
                          />
                        )}

                        {/* Core Edge Line */}
                        <motion.line
                          x1={source.x}
                          y1={source.y}
                          x2={target.x}
                          y2={target.y}
                          stroke={edgeColor}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{
                            pathLength: 1,
                            opacity: isAnyFocus
                              ? isConnectedToFocus || isEdgeSelected
                                ? 1.0
                                : 0.2
                              : 0.8,
                          }}
                          transition={{
                            pathLength: { duration: 0.75, ease: 'easeOut' },
                            opacity: { duration: 0.3 },
                          }}
                          strokeWidth={
                            isEdgeSelected
                              ? 3.5
                              : isConnectedToFocus
                              ? 2.8
                              : edge.type === 'Topology'
                              ? 1.5
                              : 2.0
                          }
                          strokeDasharray={
                            edge.type === 'Topology'
                              ? '5 3'
                              : edge.type === 'Spatial Relationship'
                              ? '3 3'
                              : undefined
                          }
                        />

                        {/* Midpoint Bead / Calibre Label (in Calibre mode) */}
                        {viewMode === 'calibre' && edge.vesselWidthMicrons ? (
                          <g>
                            <rect
                              x={midX - 18}
                              y={midY - 8}
                              width="36"
                              height="14"
                              rx="3"
                              fill="#08170F"
                              stroke={edgeColor}
                              strokeWidth="0.8"
                              opacity="0.9"
                            />
                            <text
                              x={midX}
                              y={midY + 2.5}
                              textAnchor="middle"
                              fill="#FFFDF8"
                              fontSize="7.5"
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              {edge.vesselWidthMicrons}μm
                            </text>
                          </g>
                        ) : (
                          <circle
                            cx={midX}
                            cy={midY}
                            r={isConnectedToFocus || isEdgeSelected ? 4 : 2.5}
                            fill={edgeColor}
                            stroke="#08170F"
                            strokeWidth="1"
                            opacity={isAnyFocus && !isConnectedToFocus ? 0.3 : 0.9}
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* LAYER 4: Graph Nodes (Interactive Vascular, Disc, Cellular & Pathology) */}
              <div
                className="absolute inset-0 pointer-events-auto transition-opacity duration-700"
                style={{
                  transform: 'translateZ(30px)',
                  opacity: animStage >= 2 ? 1 : 0,
                }}
              >
                <svg viewBox="0 0 500 500" className="w-full h-full overflow-visible">
                  {GRAPH_NODES.map((node, idx) => {
                    const isSelected = selectedNodeId === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const isNeighbor = connectedNeighborIds.includes(node.id);

                    return (
                      <motion.g
                        key={node.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 24,
                          delay: Math.min(idx * 0.03, 0.45),
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedNodeId(node.id);
                          setSelectedEdgeId(null);
                        }}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer"
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Connected Neighbor Pulse Halo */}
                        {isNeighbor && !isSelected && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.radius + 6}
                            fill="none"
                            stroke={node.color}
                            strokeWidth="1.2"
                            strokeDasharray="3 2"
                            opacity="0.8"
                            className="animate-pulse"
                          />
                        )}

                        {/* Selected Active Reticle */}
                        {isSelected && (
                          <g>
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={node.radius + 8}
                              fill="none"
                              stroke="#FFFDF8"
                              strokeWidth="1.8"
                              strokeDasharray="4 2"
                              className="animate-spin-slow"
                            />
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={node.radius + 14}
                              fill="none"
                              stroke={node.color}
                              strokeWidth="1"
                              opacity="0.6"
                              className="animate-ping"
                            />
                          </g>
                        )}

                        {/* Hover Halo */}
                        {isHovered && !isSelected && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.radius + 5}
                            fill="none"
                            stroke="#FFFDF8"
                            strokeWidth="1.5"
                            opacity="0.9"
                          />
                        )}

                        {/* Main Node Shape */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isSelected || isHovered ? node.radius + 2 : node.radius}
                          fill={node.type === 'Optic Disc Core' ? 'url(#glow-disc)' : node.color}
                          stroke="#FFFDF8"
                          strokeWidth={isSelected ? 2 : 1}
                          className="transition-all duration-200"
                        />

                        {/* Center Glyphs */}
                        {node.type === 'Optic Disc Core' && (
                          <circle cx={node.x} cy={node.y} r="6" fill="#17221C" />
                        )}
                        {node.type === 'Fovea Centralis' && (
                          <circle cx={node.x} cy={node.y} r="4" fill="#E76F51" />
                        )}

                        {/* Branching Angle Tag (in Calibre/Angle mode) */}
                        {viewMode === 'calibre' && node.type === 'Vessel Junction' && (
                          <g className="pointer-events-none">
                            <text
                              x={node.x}
                              y={node.y + node.radius + 11}
                              textAnchor="middle"
                              fill="#E9A23B"
                              fontSize="8"
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              θ: {node.id.includes('alpha') ? '74.2°' : node.id.includes('beta') ? '68.5°' : '86.4°'}
                            </text>
                          </g>
                        )}

                        {/* Node Label Tooltip on Hover */}
                        {(isSelected || isHovered) && (
                          <g className="pointer-events-none">
                            <rect
                              x={node.x - 55}
                              y={node.y - node.radius - 24}
                              width="110"
                              height="18"
                              rx="5"
                              fill="#17221C"
                              opacity="0.94"
                              stroke={node.color}
                              strokeWidth="1"
                            />
                            <text
                              x={node.x}
                              y={node.y - node.radius - 12}
                              textAnchor="middle"
                              fill="#FFFDF8"
                              fontSize="8.5"
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              {node.name.length > 18 ? node.name.slice(0, 16) + '...' : node.name}
                            </text>
                          </g>
                        )}
                      </motion.g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Bottom-Left Live HUD info */}
            <div className="absolute bottom-4 left-4 right-4 z-30 p-2.5 rounded-xl bg-[#17221C]/90 backdrop-blur-md border border-white/10 text-xs font-mono text-white flex items-center justify-between shadow-lg pointer-events-none">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-[#E9A23B]" />
                <span className="font-bold text-[#FFFDF8]">{activeNode.name}</span>
                <span className="text-[10px] text-[#DDE5DC]">({activeNode.quadrant})</span>
              </div>
              <div className="text-[#1F7A5A] font-bold">
                GNN Attention: {Math.round(activeNode.attentionWeight * 100)}%
              </div>
            </div>
          </div>

          {/* Node Category Legend Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] text-xs">
            {[
              { category: 'Vascular Junctions', color: '#1F7A5A', count: 9, desc: 'Bifurcations & Crossings' },
              { category: 'Disc Boundaries', color: '#E9A23B', count: 4, desc: 'Rim Anchors & Cup Margin' },
              { category: 'Cellular Networks', color: '#2A9D8F', count: 5, desc: 'FAZ Ring & Capillary Mesh' },
              { category: 'Pathology Anchors', color: '#E76F51', count: 6, desc: 'Exudates, MAs & Ischemia' },
            ].map(item => (
              <div
                key={item.category}
                className="p-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-bold text-[#124B3A] text-[11px] truncate">
                    {item.category}
                  </span>
                </div>
                <div className="text-[10px] text-[#65736B] font-mono">
                  {item.count} elements • {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Inspector & Tortuosity Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Selected Edge or Node Detailed Inspector */}
          {activeEdge ? (
            <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
                <div className="flex items-center gap-2">
                  <Network size={16} className="text-[#1F7A5A]" />
                  <h3 className="text-sm font-bold text-[#124B3A] uppercase tracking-wide">
                    Edge Geometry Inspector
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1F7A5A]/10 text-[#1F7A5A]">
                  {activeEdge.type}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                  <span className="text-[#65736B]">Connection Path:</span>
                  <span className="font-bold text-[#124B3A] font-mono">
                    {activeEdge.sourceId} ➔ {activeEdge.targetId}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                  <span className="text-[#65736B]">Vessel Calibre (Width):</span>
                  <span className="font-mono font-bold text-[#124B3A]">
                    {activeEdge.vesselWidthMicrons ? `${activeEdge.vesselWidthMicrons} μm` : 'Non-vascular Vector'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                  <span className="text-[#65736B]">Branching Angle (θ):</span>
                  <span className="font-mono font-bold text-[#E9A23B]">
                    {activeEdge.branchingAngleDeg ? `${activeEdge.branchingAngleDeg}°` : '0.0°'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                  <span className="text-[#65736B]">Geometric Tortuosity (τ):</span>
                  <span className="font-mono font-bold text-[#E76F51]">
                    {activeEdge.tortuosityIndex ? activeEdge.tortuosityIndex.toFixed(3) : '0.010'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#E8F3EE] border border-[#C8D4C7] space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#1F7A5A] uppercase block">
                    BRANCHING PATTERN & HEMODYNAMICS
                  </span>
                  <p className="text-xs text-[#17221C] leading-relaxed">
                    {activeEdge.branchingPattern || activeEdge.label}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
                <div className="flex items-center gap-2">
                  <Crosshair size={16} className="text-[#1F7A5A]" />
                  <h3 className="text-sm font-bold text-[#124B3A] uppercase tracking-wide">
                    Active Node Inspector
                  </h3>
                </div>
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${activeNode.color}20`,
                    color: activeNode.color === '#FFFDF8' ? '#17221C' : activeNode.color,
                  }}
                >
                  {activeNode.type}
                </span>
              </div>

              {/* Attributes Grid */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                  <span className="text-[#65736B]">Node Category:</span>
                  <span className="font-bold text-[#124B3A] font-mono">{activeNode.functionalCategory}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                  <span className="text-[#65736B]">Coordinates (X, Y):</span>
                  <span className="font-mono font-bold text-[#124B3A]">
                    {activeNode.x} μm, {activeNode.y} μm
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F6EF] flex items-center justify-between">
                  <span className="text-[#65736B]">Distance to Fovea:</span>
                  <span className="font-mono font-bold text-[#E76F51]">
                    {activeNode.fovealDistance}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF4ED] border border-[#E9A23B]/30 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#8A5612] uppercase block">
                    STRUCTURAL & GEOMETRIC FEATURE
                  </span>
                  <p className="text-xs text-[#17221C] leading-relaxed">
                    {activeNode.geometricFeature || activeNode.structuralRole}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#E8F3EE] border border-[#C8D4C7] space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#1F7A5A] uppercase block">
                    CLINICAL PATHOLOGY SIGNIFICANCE
                  </span>
                  <p className="text-xs text-[#17221C] leading-relaxed">
                    {activeNode.clinicalSignificance}
                  </p>
                </div>

                {/* Connected Neighbor Nodes list */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-[#124B3A] block mb-2">
                    Connected Elements ({connectedNeighborIds.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {connectedNeighborIds.map(neighborId => {
                      const neighbor = GRAPH_NODES.find(n => n.id === neighborId);
                      if (!neighbor) return null;
                      return (
                        <button
                          key={neighbor.id}
                          onClick={() => setSelectedNodeId(neighbor.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#F8F6EF] hover:bg-[#FAF4ED] border border-[#DDE5DC] text-[11px] font-semibold text-[#124B3A] transition-all flex items-center gap-1.5"
                          data-cursor="button"
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: neighbor.color }}
                          />
                          <span>{neighbor.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Computer Vision Vascular Tortuosity & Calibre Tracking Center */}
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#DDE5DC] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#1F7A5A]" />
                <h4 className="text-xs font-bold text-[#124B3A] uppercase tracking-wide">
                  Computer Vision Vascular Tracking
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E8F3EE] text-[#1F7A5A] border border-[#C8D4C7]">
                LIVE CDSS METRICS
              </span>
            </div>

            {/* Key Metric Rows */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#124B3A]">Arteriolar-to-Venular Ratio (AVR)</div>
                  <div className="text-[10px] text-[#65736B]">Mean Artery (118.4μm) / Vein (146.2μm)</div>
                </div>
                <div className="font-mono font-bold text-sm text-[#1F7A5A]">
                  0.81 <span className="text-[10px] text-[#65736B]">(Normal 0.67-0.85)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#124B3A]">Geometric Tortuosity Index (τ)</div>
                  <div className="text-[10px] text-[#65736B]">Arc-Length to Chord Ratio</div>
                </div>
                <div className="font-mono font-bold text-sm text-[#1F7A5A]">
                  0.114 <span className="text-[10px] text-[#65736B]">(Optimal Curvature)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#124B3A]">Murray Law Concordance</div>
                  <div className="text-[10px] text-[#65736B]">Bifurcation Branching Angle</div>
                </div>
                <div className="font-mono font-bold text-sm text-[#124B3A]">
                  74.2° <span className="text-[10px] text-[#1F7A5A]">(98.9% Conformance)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC]/70 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#124B3A]">FAZ Area & Circularity</div>
                  <div className="text-[10px] text-[#65736B]">Perifoveal Capillary Enclosure</div>
                </div>
                <div className="font-mono font-bold text-sm text-[#124B3A]">
                  0.28 mm² <span className="text-[10px] text-[#65736B]">(Index 0.92)</span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                onClick={() => navigate('/classification')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-white text-xs font-bold shadow-lg shadow-[#124B3A]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                data-cursor="button"
              >
                <span>Proceed to ICDR Grading</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── END-TO-END PIPELINE NAVIGATION ─── */}
      <ModulePipelineNav currentModule={5} />
    </div>
  );
};
