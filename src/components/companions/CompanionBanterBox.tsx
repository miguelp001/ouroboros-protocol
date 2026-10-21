import React from 'react';
import { Operative } from '../../types';
import { Radio, Zap, Volume2 } from 'lucide-react';
import { BanterLine } from '../../data/companionBanter';
import { getOperativePortrait } from '../../utils/assets';

interface CompanionBanterBoxProps {
  companion: Operative;
  banter: BanterLine | null;
  perkTriggered?: string | null;
}

export const CompanionBanterBox: React.FC<CompanionBanterBoxProps> = ({
  companion,
  banter,
  perkTriggered,
}) => {
  if (!banter && !perkTriggered) return null;

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'triumphant':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
      case 'alarmed':
        return 'text-crisis border-crisis/50 bg-crisis/10';
      case 'strained':
        return 'text-amber-400 border-amber-600/40 bg-amber-950/20';
      case 'confident':
      default:
        return 'text-hazard border-hazard/40 bg-hazard/10';
    }
  };

  return (
    <div className={`p-3.5 rounded-lg border font-mono text-xs space-y-2 shadow-inner transition-all ${getMoodColor(banter?.mood)}`}>
      {/* Radio Channel Header */}
      <div className="flex items-center justify-between text-[11px] border-b border-current/20 pb-1.5">
        <div className="flex items-center gap-2 font-bold">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>FIELD COMM // {companion.name.toUpperCase()} [{companion.callsign}]</span>
        </div>

        <div className="flex items-center gap-1.5 opacity-80 text-[10px]">
          <Volume2 className="w-3 h-3" />
          <span>FREQ: 142.80 MHz // CLEAR</span>
        </div>
      </div>

      {/* Spoken Quote */}
      {banter && (
        <div className="flex items-start gap-3 pt-1">
          <div className="w-10 h-10 rounded-md border border-current/40 bg-noir-ink shrink-0 overflow-hidden relative shadow">
            <img
              src={getOperativePortrait(companion.id)}
              alt={companion.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center -z-10 text-[9px] text-zinc-500 font-bold">
              {companion.callsign.slice(0, 2)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-200 text-xs italic leading-relaxed">
              "{banter.text}"
            </p>
          </div>
        </div>
      )}

      {/* Perk Notification Pill */}
      {perkTriggered && (
        <div className="text-[10px] p-1.5 rounded bg-noir-ink/80 border border-hazard/50 text-hazard flex items-center gap-1.5 font-bold">
          <Zap className="w-3 h-3 animate-bounce shrink-0" />
          <span>{perkTriggered}</span>
        </div>
      )}
    </div>
  );
};
