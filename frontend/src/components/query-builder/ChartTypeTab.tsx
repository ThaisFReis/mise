'use client';

import { LucideIcon } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';

interface ChartTypeTabProps {
  icon: LucideIcon;
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

export function ChartTypeTab({ icon: Icon, label, description, isActive, onClick }: ChartTypeTabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 flex items-center gap-2 text-sm transition-all duration-300 ${
        isActive
          ? 'text-primary border-b-2 border-primary font-medium'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      <HelpTooltip content={description} />
    </button>
  );
}
