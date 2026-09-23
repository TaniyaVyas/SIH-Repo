import React, { useState } from 'react';
import { Network, Info, Zap, Sparkles } from 'lucide-react';

interface GraphNode {
  id: string;
  name: string;
  type: 'Anatomical Landmark' | 'Vascular Trunk' | 'Lesion Cluster';
  x: number;
  y: number;
  radius: number;
  color: string;
  features: {
    morphology: string;
    fovealDistance: string;
    vascularConnection: string;
    attentionWeight: number;
  };
}

export const GraphVisualization: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('fovea');

  const nodes: GraphNode[] = [
    {
      id: 'fovea',
      name: 'Fovea Centralis (FAZ)',
      type: 'Anatomical Landmark',
      x: 320,
      y: 200,
      radius: 20,
      color: '#124B3A',
      features: {
        morphology: '1500μm Avascular Capillary Ring',
        fovealDistance: '0.00 μm (Origin Coordinate)',
        vascularConnection: 'Perifoveal Capillary Arcade',
        attentionWeight: 0.94,
      }
    },
    {
      id: 'disc',
      name: 'Optic Disc (Nerve Head)',
      type: 'Anatomical Landmark',
      x: 120,
      y: 190,
      radius: 24,
      color: '#124B3A',
      features: {
        morphology: '1800μm Neuro-Retinal Rim & Cup',
        fovealDistance: '3450 μm (Temporal Vector)',
        vascularConnection: 'Central Retinal Artery Trunk',
        attentionWeight: 0.76,
      }
    },
    {
      id: 'sup_arcade',
      name: 'Superior Vascular Arcade',
      type: 'Vascular Trunk',
      x: 230,
      y: 90,
      radius: 16,
      color: '#1F7A5A',
      features: {
        morphology: 'Arteriolar Caliber 112μm, AVR 0.68',
        fovealDistance: '1820 μm',
        vascularConnection: 'Main Branch Artery Order-1',
        attentionWeight: 0.82,
      }
    },
    {
      id: 'inf_arcade',
      name: 'Inferior Vascular Arcade',
      type: 'Vascular Trunk',
      x: 250,
      y: 310,
      radius: 16,
      color: '#1F7A5A',
      features: {
        morphology: 'Venular Caliber 148μm',
        fovealDistance: '1940 μm',
        vascularConnection: 'Main Branch Vein Order-1',
        attentionWeight: 0.79,
      }
    },
    {
      id: 'hex_cluster',
      name: 'Hard Exudate Circinate Node (HEX-1)',
      type: 'Lesion Cluster',
      x: 380,
      y: 170,
      radius: 14,
      color: '#E9A23B',
      features: {
        morphology: 'Lipid/Lipoprotein Extravasation (5 plaques)',
        fovealDistance: '420 μm (CRITICAL CSME THREAT)',
        vascularConnection: 'Leaking Deep Capillary Plexus',
        attentionWeight: 0.98,
      }
    },
    {
      id: 'blot_hem',
      name: 'Blot Hemorrhage (HEM-4)',
      type: 'Lesion Cluster',
      x: 360,
      y: 280,
      radius: 15,
      color: '#E76F51',
      features: {
        morphology: 'Intra-retinal Micro-vascular Hemorrhage',
        fovealDistance: '1120 μm',
        vascularConnection: 'Inferior Pre-capillary Venule',
        attentionWeight: 0.88,
      }
    },
    {
      id: 'ma_cluster',
      name: 'Microaneurysms Group (MA-1..4)',
      type: 'Lesion Cluster',
      x: 440,
      y: 250,
      radius: 12,
      color: '#E76F51',
      features: {
        morphology: 'Focal Capillary Wall Out-pouchings (4 MA)',
        fovealDistance: '2100 μm',
        vascularConnection: 'Temporal Terminal Capillaries',
        attentionWeight: 0.72,
      }
    },
  ];

  const edges = [
    { from: 'disc', to: 'sup_arcade', weight: '0.85', label: 'Arterial Feed' },
    { from: 'disc', to: 'inf_arcade', weight: '0.82', label: 'Venous Return' },
    { from: 'disc', to: 'fovea', weight: '0.91', label: 'Primary Anatomical Axis' },
    { from: 'sup_arcade', to: 'fovea', weight: '0.78', label: 'Perifoveal Anastomosis' },
    { from: 'inf_arcade', to: 'fovea', weight: '0.75', label: 'Perifoveal Anastomosis' },
    { from: 'fovea', to: 'hex_cluster', weight: '0.98', label: 'Macular Edema Distance (420μm)' },
    { from: 'fovea', to: 'blot_hem', weight: '0.89', label: 'Proximity Gradient' },
    { from: 'sup_arcade', to: 'hex_cluster', weight: '0.81', label: 'Vascular Leak Origin' },
    { from: 'inf_arcade', to: 'blot_hem', weight: '0.84', label: 'Capillary Dropout' },
    { from: 'blot_hem', to: 'ma_cluster', weight: '0.73', label: 'Quadrant Clustering' },
  ];

  const activeNodeData = nodes.find(n => n.id === selectedNode) || nodes[0];

  return (
    <div className="rounded-2xl border border-[#DDE5DC] bg-[#FFFFFF] overflow-hidden shadow-warm-md">
      {/* Header */}
      <div className="p-6 border-b border-[#DDE5DC] bg-[#FFFDF8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8F3EE] flex items-center justify-center text-[#1F7A5A]">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17221C] font-display">
                Topological Retinal Graph (Heterogeneous GNN)
              </h3>
              <p className="text-xs text-[#65736B]">
                Spatial structure \\mathcal&#123;G&#125; = (\\mathcal&#123;V&#125;, \\mathcal&#123;E&#125;) encoding geodesic vascular distances & lesion risk
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#E8F3EE] text-[#124B3A] border border-[#C8D4C7] px-3 py-1 rounded-full font-mono font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1F7A5A]" />
            Structure-Aware Embedding
          </span>
        </div>
      </div>

      {/* Main Interactive Graph & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* SVG Graph Canvas */}
        <div className="lg:col-span-7 bg-[#F8F6EF] p-4 flex items-center justify-center relative min-h-[380px] border-b lg:border-b-0 lg:border-r border-[#DDE5DC]">
          <svg viewBox="0 0 540 380" className="w-full h-auto max-w-lg">
            <defs>
              <filter id="glowNode" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#124B3A" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Grid Pattern in background */}
            <pattern id="graphGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E7EEE6" strokeWidth="1" />
            </pattern>
            <rect width="540" height="380" fill="url(#graphGrid)" />

            {/* Edges */}
            {edges.map((edge, idx) => {
              const source = nodes.find(n => n.id === edge.from)!;
              const target = nodes.find(n => n.id === edge.to)!;
              const isHighAttention = parseFloat(edge.weight) > 0.85;

              return (
                <g key={idx}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isHighAttention ? "#E76F51" : "#C8D4C7"}
                    strokeWidth={isHighAttention ? "2.5" : "1.5"}
                    strokeDasharray={isHighAttention ? undefined : "4 3"}
                    className="transition-all duration-300"
                  />
                  {/* Weight pill midway */}
                  <circle
                    cx={(source.x + target.x) / 2}
                    cy={(source.y + target.y) / 2}
                    r="4"
                    fill={isHighAttention ? "#E76F51" : "#1F7A5A"}
                    opacity="0.8"
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const isSelected = selectedNode === node.id;

              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-transform duration-200 hover:scale-110"
                  onClick={() => setSelectedNode(node.id)}
                >
                  {/* Outer selection ring */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius + 8}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={node.color}
                    stroke="#FFFDF8"
                    strokeWidth="3"
                    filter="url(#glowNode)"
                  />

                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y + node.radius + 16}
                    textAnchor="middle"
                    className="text-[10px] font-bold font-display fill-[#17221C] pointer-events-none"
                  >
                    {node.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick Helper Note */}
          <div className="absolute bottom-2 left-3 text-[11px] text-[#65736B] flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#1F7A5A]" />
            <span>Click any node to inspect GNN feature embeddings</span>
          </div>
        </div>

        {/* Node Feature Inspector Panel */}
        <div className="lg:col-span-5 p-6 bg-[#FFFFFF] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DC]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#65736B]">
                Node Feature Vector \\mathbf&#123;h&#125;_v
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F8F6EF] text-[#124B3A] border border-[#DDE5DC]">
                ID: {activeNodeData.id}
              </span>
            </div>

            <div className="mt-4">
              <h4 className="text-base font-bold text-[#17221C] font-display">
                {activeNodeData.name}
              </h4>
              <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F3EE] text-[#1F7A5A]">
                {activeNodeData.type}
              </span>
            </div>

            {/* Feature Table */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC]">
                <div className="text-[11px] text-[#65736B] font-mono">Morphological Feature:</div>
                <div className="font-semibold text-[#17221C] mt-0.5">
                  {activeNodeData.features.morphology}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC]">
                <div className="text-[11px] text-[#65736B] font-mono">Geodesic Distance to Fovea:</div>
                <div className="font-semibold text-[#124B3A] mt-0.5">
                  {activeNodeData.features.fovealDistance}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC]">
                <div className="text-[11px] text-[#65736B] font-mono">Vascular Tree Connectivity:</div>
                <div className="font-semibold text-[#17221C] mt-0.5">
                  {activeNodeData.features.vascularConnection}
                </div>
              </div>

              {/* Attention Weight Bar */}
              <div className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC]">
                <div className="flex items-center justify-between text-[11px] text-[#65736B] font-mono">
                  <span>GNN Attention Weight (\\alpha_v):</span>
                  <span className="font-bold text-[#E76F51]">
                    {(activeNodeData.features.attentionWeight * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E7EEE6] rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#E76F51] rounded-full transition-all duration-500"
                    style={{ width: `${activeNodeData.features.attentionWeight * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#DDE5DC] text-[11px] text-[#65736B] flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#E9A23B] shrink-0" />
            <span>
              Topological GNN aggregates neighborhood evidence via message passing over 3 hops.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
