import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

interface AIStatusBadgeProps {
  type: 'verified' | 'autonomous' | 'referral' | 'rejected' | 'uncertain' | 'offline';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AIStatusBadge: React.FC<AIStatusBadgeProps> = ({
  type,
  label,
  size = 'md',
}) => {
  const getStyles = () => {
    switch (type) {
      case 'autonomous':
      case 'verified':
        return {
          bg: 'bg-[#E8F3EE]',
          text: 'text-[#124B3A]',
          border: 'border-[#C8D4C7]',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-[#1F7A5A]" />,
          defaultLabel: 'ETDRS Verified • Autonomous Clearance',
        };
      case 'referral':
        return {
          bg: 'bg-[#FCF5E9]',
          text: 'text-[#8A5612]',
          border: 'border-[#F3B964]',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-[#E9A23B]" />,
          defaultLabel: 'Tele-Referral Required',
        };
      case 'rejected':
      case 'uncertain':
        return {
          bg: 'bg-[#FDF0EC]',
          text: 'text-[#9A3B24]',
          border: 'border-[#F48C71]',
          icon: <XCircle className="w-3.5 h-3.5 text-[#E76F51]" />,
          defaultLabel: 'Self-Aware Rejection (Recapture)',
        };
      case 'offline':
        return {
          bg: 'bg-[#FFFDF8]',
          text: 'text-[#124B3A]',
          border: 'border-[#DDE5DC]',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A5A]" />,
          defaultLabel: 'Edge Offline Engine Active',
        };
    }
  };

  const config = getStyles();
  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2',
    lg: 'text-sm px-4 py-1.5 gap-2.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border shadow-warm-sm font-mono tracking-tight ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {config.icon}
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};
