import React from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { Cpu, WifiOff, HardDrive, Zap, CheckCircle2 } from 'lucide-react';

export const InfrastructurePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10 pb-16">
      <SectionHeading
        badge="System Architecture Pillar 2"
        title="Deployment & Edge Infrastructure"
        subtitle="Zero internet dependency in remote villages. Optimized for sub-2-second inference on low-power edge hardware with encrypted local SQLite caching."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: 'NVIDIA Jetson Nano / Orin',
            specs: 'INT8 TensorRT • 5W–15W Power',
            latency: '1.64s per fundus scan',
            memory: '4GB Unified Memory footprint',
            role: 'Sub-Centre Fixed Workstation',
          },
          {
            title: 'Raspberry Pi 5 + Hailo-8 AI Hat',
            specs: 'ONNX Runtime INT8 • 26 TOPS',
            latency: '1.82s per fundus scan',
            memory: '28MB quantized model size',
            role: 'Ultra-low-cost PHC Kit',
          },
          {
            title: 'Android PWA Offline Tablet',
            specs: 'WebAssembly + WebGPU acceleration',
            latency: '2.10s per fundus scan',
            memory: 'Encrypted SQLite local store',
            role: 'ASHA Worker Mobile Field Bag',
          },
        ].map((item, idx) => (
          <div key={idx} className="bg-[#FFFDF8] rounded-2xl border border-[#DDE5DC] p-6 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#124B3A] text-white flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <h3 className="font-bold text-sm text-[#124B3A]">{item.title}</h3>
            <div className="text-xs text-[#65736B] font-mono">{item.specs}</div>
            <div className="p-3 rounded-xl bg-[#F8F6EF] space-y-1 text-xs font-mono">
              <div className="text-[#1F7A5A] font-bold">Latency: {item.latency}</div>
              <div className="text-[#65736B]">RAM: {item.memory}</div>
            </div>
            <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF4ED] text-[#8A5612] border border-[#E9A23B]/30">
              {item.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
