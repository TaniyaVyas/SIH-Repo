import React from 'react';

interface RiskMeterProps {
  score: number; // 0 to 100
  size?: number;
  label?: string;
  sublabel?: string;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  size = 180,
  label = "Sight Threat Index",
  sublabel = "Risk Stratification"
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc spans 240 degrees (leaving bottom 120 open)
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * Math.min(score, 100)) / 100;

  // Determine color based strictly on approved palette
  const getColor = () => {
    if (score < 25) return { stroke: '#1F7A5A', text: 'text-[#1F7A5A]', bg: 'bg-[#E8F3EE]', tier: 'Low / Normal' };
    if (score < 60) return { stroke: '#E9A23B', text: 'text-[#E9A23B]', bg: 'bg-[#FCF5E9]', tier: 'Moderate NPDR' };
    return { stroke: '#E76F51', text: 'text-[#E76F51]', bg: 'bg-[#FDF0EC]', tier: 'Sight-Threatening' };
  };

  const current = getColor();

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform rotate-[150deg]"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E7EEE6"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Animated Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={current.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
          <span className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-[#17221C]">
            {score}%
          </span>
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${current.text} ${current.bg}`}>
            {current.tier}
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div className="text-xs font-semibold text-[#17221C] uppercase tracking-wider font-display">
          {label}
        </div>
        <div className="text-[11px] text-[#65736B]">
          {sublabel}
        </div>
      </div>
    </div>
  );
};
