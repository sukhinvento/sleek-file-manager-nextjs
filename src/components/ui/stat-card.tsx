import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const PRIMARY   = 'hsl(220,48%,42%)';
const TEXT_MAIN = 'hsl(215,28%,14%)';

const INACTIVE_BG: Record<string, string> = {
  'hsl(220,48%,42%)': 'linear-gradient(135deg, hsl(220,80%,97%) 0%, #fff 100%)',
  'hsl(195,70%,42%)': 'linear-gradient(135deg, hsl(195,80%,96%) 0%, #fff 100%)',
  'hsl(33,92%,48%)':  'linear-gradient(135deg, hsl(33,100%,97%) 0%, #fff 100%)',
  'hsl(158,70%,36%)': 'linear-gradient(135deg, hsl(158,70%,96%) 0%, #fff 100%)',
  'hsl(354,70%,50%)': 'linear-gradient(135deg, hsl(354,80%,97%) 0%, #fff 100%)',
  'hsl(270,60%,50%)': 'linear-gradient(135deg, hsl(270,60%,97%) 0%, #fff 100%)',
};

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  active?: boolean;
  onClick?: () => void;
}

export const StatCard = ({ label, value, icon: Icon, accent, active, onClick }: StatCardProps) => (
  <Card
    className="flex-shrink-0 w-32 sm:w-36 md:w-40 border-0 shadow-sm cursor-pointer transition-all hover:shadow-md relative overflow-hidden"
    style={{
      background: active ? accent : (INACTIVE_BG[accent] ?? 'hsl(0,0%,100%)'),
      outline: active ? `2px solid ${accent}` : 'none',
    }}
    onClick={onClick}
  >
    <CardContent className="p-3 relative z-10">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: active ? 'rgba(255,255,255,0.8)' : accent }}>
            {label}
          </p>
          <p className="text-xl font-bold mt-0.5" style={{ color: active ? '#fff' : TEXT_MAIN }}>
            {value}
          </p>
        </div>
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: active ? 'rgba(255,255,255,0.2)' : `${accent}18` }}>
          <Icon size={14} style={{ color: active ? '#fff' : accent }} />
        </div>
      </div>
    </CardContent>
    <Icon size={40} className="absolute bottom-0 right-0 translate-x-3 translate-y-2 opacity-[0.05]" style={{ color: active ? '#fff' : accent }} />
  </Card>
);

// Accent color tokens for consistent use across pages
export const STAT_ACCENTS = {
  PRIMARY:  'hsl(220,48%,42%)',
  CYAN:     'hsl(195,70%,42%)',
  WARNING:  'hsl(33,92%,48%)',
  SUCCESS:  'hsl(158,70%,36%)',
  DANGER:   'hsl(354,70%,50%)',
  PURPLE:   'hsl(270,60%,50%)',
} as const;
