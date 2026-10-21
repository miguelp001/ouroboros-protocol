// Faction Fronts Monitor Component
// Diegetic Slate subview displaying the 4 rival factions, their PbtA 6-segment front clocks,
// regional Heat throttle modifiers, suspicion levels, and counter-intel sabotage actions.

import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Eye, 
  Crosshair, 
  CheckCircle2 
} from 'lucide-react';
import { Faction } from '../../types';
import { 
  calculateHeatThrottle, 
  getFactionBestStat, 
  sabotageFactionFront 
} from '../../engine/factionEngine';
import { soundFx } from '../../audio/soundFx';

interface FactionFrontsMonitorProps {
  factions: Record<string, Faction>;
  heatMap: Record<string, number>;
  chipCred: number;
  digitalCred: number;
}

export const FactionFrontsMonitor: React.FC<FactionFrontsMonitorProps> = ({
  factions,
  heatMap,
  chipCred,
  digitalCred,
}) => {
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const factionList = Object.values(factions);

  const handleSabotage = (
    factionId: string,
    frontId: string,
    costType: 'chipCred' | 'digitalCred',
    costAmount: number,
    segments: number
  ) => {
    const res = sabotageFactionFront(factionId, frontId, costType, costAmount, segments);
    setActionFeedback(res.message);
    if (res.success) {
      soundFx.playClick();
    } else {
      soundFx.playGlitch();
    }
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Top Telemetry Header */}
      <div className="rounded border border-noir-border bg-noir-surface/90 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-noir-border pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-hazard" />
            <span className="text-xs font-bold uppercase tracking-wider text-noir-chalk">
              FACTION AGENDAS // PbtA FRONT CLOCKS
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-noir-muted">
            <span>CHIP: <strong className="text-amber-400">{chipCred}C</strong></span>
            <span>DIGITAL: <strong className="text-cyan-400">{digitalCred}D</strong></span>
          </div>
        </div>

        <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
          Enemy factions advance their 6-segment objective clocks every day at <strong>DAWN</strong> via 
          <code className="mx-1 text-hazard bg-noir-ink px-1 rounded">2d6 + Stat</code>. 
          District Heat modulates their roll speed (<strong>-1</strong> in low heat, <strong>+1</strong> in high heat).
          When a clock hits <strong>6/6</strong>, catastrophic district shifts trigger.
        </p>

        {actionFeedback && (
          <div className="mt-3 rounded border border-hazard/40 bg-noir-ink/90 p-2.5 text-xs text-hazard flex items-center justify-between animate-fadeIn">
            <span>{actionFeedback}</span>
            <button 
              onClick={() => setActionFeedback(null)} 
              className="text-zinc-500 hover:text-zinc-300 ml-2 text-[10px]"
            >
              [DISMISS]
            </button>
          </div>
        )}
      </div>

      {/* 4 Factions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {factionList.map((faction) => {
          const territory = faction.territorySector ?? 'sink';
          const sectorHeat = heatMap[territory] ?? 0;
          const heatThrottle = calculateHeatThrottle(sectorHeat);
          const bestStat = getFactionBestStat(faction);
          const activeFront = faction.activeFronts[0];

          if (!activeFront) return null;

          const isCritical = activeFront.progress >= activeFront.max - 1 && !activeFront.completed;
          const isCompleted = activeFront.completed || activeFront.progress >= activeFront.max;

          // Determine sabotage cost type and amount based on faction profile
          const isCyberFaction = faction.id === 'apex_consortium';
          const costType: 'chipCred' | 'digitalCred' = isCyberFaction ? 'digitalCred' : 'chipCred';
          const costAmount = isCyberFaction ? 40 : 25;
          const canAfford = (isCyberFaction ? digitalCred : chipCred) >= costAmount;
          const canDelay = activeFront.progress > 0 && !isCompleted;

          return (
            <div
              key={faction.id}
              className={`rounded border p-4 transition-all duration-200 ${
                isCritical
                  ? 'border-red-500/80 bg-red-950/20 shadow-red-950/30'
                  : 'border-noir-border bg-noir-surface/70 hover:border-zinc-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 border-b border-noir-border/60 pb-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-noir-muted flex items-center gap-1.5">
                    <Crosshair className="h-3 w-3 text-hazard" />
                    SECTOR: {territory.toUpperCase()}
                  </div>
                  <h4 className="text-sm font-bold text-noir-chalk mt-0.5">{faction.name}</h4>
                </div>

                {/* Suspicion Indicator */}
                <div 
                  className="flex items-center gap-1 bg-noir-ink px-2 py-1 rounded border border-noir-border text-[10px]"
                  title={`Suspicion Level: ${faction.suspicionLevel}/4`}
                >
                  <Eye className="h-3 w-3 text-red-400" />
                  <span className="text-zinc-400">SUSP:</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map((dot) => (
                      <div
                        key={dot}
                        className={`w-1.5 h-1.5 rounded-full ${
                          dot <= faction.suspicionLevel ? 'bg-red-500' : 'bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Faction Stats & Heat Throttle */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                <div className="flex items-center gap-1 text-zinc-400">
                  <span>TEST:</span>
                  <span className="text-hazard font-bold uppercase">{bestStat.stat} (+{bestStat.value})</span>
                </div>

                <div 
                  className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${
                    heatThrottle.modifier > 0
                      ? 'border-red-500/50 text-red-400 bg-red-950/30'
                      : heatThrottle.modifier < 0
                      ? 'border-cyan-500/50 text-cyan-400 bg-cyan-950/30'
                      : 'border-zinc-700 text-zinc-400 bg-noir-ink'
                  }`}
                  title={`Heat in ${territory}: ${sectorHeat}/5`}
                >
                  THROTTLE: {heatThrottle.modifier > 0 ? `+${heatThrottle.modifier}` : heatThrottle.modifier}
                </div>
              </div>

              {/* Front Objective Details */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-200">{activeFront.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    STAGE {activeFront.stage ?? 1}
                  </span>
                </div>

                {activeFront.description && (
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    {activeFront.description}
                  </p>
                )}

                {/* 6-Segment Objective Clock Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-3 w-3 text-hazard" />
                      CLOCK PROGRESS
                    </span>
                    <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-hazard'}`}>
                      {activeFront.progress} / {activeFront.max} SEGMENTS
                    </span>
                  </div>

                  {/* 6 Segment Blocks */}
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: activeFront.max }).map((_, idx) => {
                      const isFilled = idx < activeFront.progress;
                      const isFinalSegment = idx === activeFront.max - 1;

                      let blockColor = 'bg-zinc-800 border-zinc-700';
                      if (isFilled) {
                        blockColor = isFinalSegment 
                          ? 'bg-red-500 border-red-400 shadow-sm shadow-red-500/50' 
                          : 'bg-hazard border-amber-300 shadow-sm shadow-amber-500/30';
                      }

                      return (
                        <div
                          key={idx}
                          className={`h-3.5 rounded-sm border transition-all ${blockColor} ${
                            !isFilled && isFinalSegment && isCritical ? 'border-red-500 animate-pulse' : ''
                          }`}
                          title={`Segment ${idx + 1}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Consequence Preview */}
                {activeFront.consequenceText && (
                  <div className={`mt-2 p-2 rounded text-[10px] leading-tight border ${
                    isCompleted 
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                      : isCritical
                      ? 'border-red-500/40 bg-red-950/30 text-red-300'
                      : 'border-noir-border bg-noir-ink text-zinc-400'
                  }`}>
                    <div className="flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider mb-0.5">
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span>CONSEQUENCE ENACTED:</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 text-hazard" />
                          <span>CONSEQUENCE ON 6/6:</span>
                        </>
                      )}
                    </div>
                    <span>{activeFront.consequenceText}</span>
                  </div>
                )}
              </div>

              {/* Sabotage / Counter-Intel Action */}
              <div className="mt-4 pt-2 border-t border-noir-border/60 flex items-center justify-between gap-2">
                <span className="text-[10px] text-zinc-500">
                  SABOTAGE COST: <strong className={isCyberFaction ? 'text-cyan-400' : 'text-amber-400'}>
                    {costAmount}{isCyberFaction ? 'D' : 'C'}
                  </strong>
                </span>

                <button
                  disabled={!canDelay || !canAfford}
                  onClick={() => handleSabotage(faction.id, activeFront.id, costType, costAmount, 1)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors flex items-center gap-1.5 ${
                    canDelay && canAfford
                      ? 'border-hazard/60 bg-hazard/10 text-hazard hover:bg-hazard hover:text-noir-ink'
                      : 'border-zinc-800 bg-noir-ink text-zinc-600 cursor-not-allowed'
                  }`}
                  title={
                    !canDelay 
                      ? 'Cannot delay completed or 0-progress clock' 
                      : !canAfford 
                      ? `Insufficient ${isCyberFaction ? 'Digital' : 'Chip'} Creds` 
                      : 'Spend funds to delay this front clock by -1 segment'
                  }
                >
                  <ShieldAlert className="h-3 w-3" />
                  DELAY FRONT (-1)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
