import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { INTEGRITY_STATUS, getIntegrityLabel, getIntegrityColor } from '../utils/integrity';

export default function IntegrityBadge({ status, compact = false }) {
  const color = getIntegrityColor(status);
  const label = getIntegrityLabel(status);
  const Icon  = status === INTEGRITY_STATUS.CLEAN ? ShieldCheck : ShieldAlert;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" title={label}>
        <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
         style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40`, color }}>
      <Icon className="w-4 h-4" />
      <span className="hidden lg:inline">{label}</span>
    </div>
  );
}
