import React, { useState } from 'react';
import { 
  Coins, 
  Terminal, 
  Skull, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import { 
  getSectorHeatStatus, 
  calculateBribeCost, 
  executeBribePatrol, 
  executePurgeLogs 
} from '../../engine/hostilityEngine';
import { SlateButton } from '../slate/SlateButton';
import { Faction } from '../../types';

interface HostilityMonitorProps {
  heatMap: Record<string, number>;
  factions: Record<string, Faction>;
  chipCred: number;
  digitalCred: number;
  activeCompanionId: string | null;
}

export const HostilityMonitor: React.FC<HostilityMonitorProps> = ({
  heatMap,
  factions,
  chipCred,
  digitalCred,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const sectors = [
    { id: 'sink', name: 'THE SINK (LINE B)' },
    { id: 'heights', name: 'THE HEIGHTS (LINE A)' },
    { id: 'old_town', name: 'OLD TOWN (LINE C)' },
    { id: 'redoubt', name: 'THE REDOUBT (LINE F)' },
    { id: 'scorch', name: 'THE SCORCH (LINE S)' },
  ];

  const handleBribe = (sectorId: string) => {
    const res = executeBribePatrol(sectorId);
    setFeedback(res.message);
  };

  const handlePurge = (sectorId: string) => {
    const res = executePurgeLogs(sectorId);
    setFeedback(res.message);
  };

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-noir-border pb-3">
        <div>
          <h3 className="font-bold text-base text-noir-chalk font-mono flex items-center gap-2">
            <Flame className="w-4 h-4 text-hazard" />
            <span>REGIONAL HOSTILITY & SUSPICION MONITOR</span>
          </h3>
          <p className="text-xs text-noir-muted">
            Track district Heat, Heat Throttle modifiers (-1 to +1), and Faction Kill Squad suspicion.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-noir-surface px-3 py-1.5 rounded border border-noir-border text-zinc-400">
          <span>Available Funds:</span>
          <strong className="text-noir-chalk">{digitalCred}D</strong>
          <span className="text-zinc-600">/</span>
          <strong className="text-hazard">{chipCred}C</strong>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className="p-3 rounded border border-hazard/40 bg-hazard/10 text-hazard flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-xs hover:text-white">✕</button>
        </div>
      )}

      {/* Sector Heat Grid */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-noir-muted uppercase tracking-wider">
          District Heat & Active Patrol Densities:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sectors.map((sec) => {
            const heatVal = heatMap[sec.id] ?? 0;
            const status = getSectorHeatStatus(sec.id, heatVal);
            const bribeCost = calculateBribeCost(sec.id);
            const canBribe = chipCred >= bribeCost && heatVal > 0;
            const canPurge = digitalCred >= 25 && heatVal > 0;

            const isHigh = heatVal >= 4;
            const isMid = heatVal >= 2 && heatVal <= 3;

            return (
              <div 
                key={sec.id}
                className={`p-3.5 rounded-lg border bg-noir-ink/80 space-y-3 transition-colors ${
                  isHigh 
                    ? 'border-crisis/60 bg-crisis/5' 
                    : isMid 
                    ? 'border-hazard/50' 
                    : 'border-noir-border'
                }`}
              >
                {/* Sector Header */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-noir-chalk">{sec.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                    isHigh 
                      ? 'border-crisis bg-crisis/20 text-crisis' 
                      : isMid 
                      ? 'border-hazard/60 bg-hazard/15 text-hazard' 
                      : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400'
                  }`}>
                    {status.tier} ({heatVal}/5)
                  </span>
                </div>

                {/* 5-bar Heat Meter */}
                <div className="space-y-1">
                  <div className="flex gap-1 h-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`flex-1 rounded-sm transition-all ${
                          heatVal >= lvl
                            ? lvl >= 4
                              ? 'bg-crisis'
                              : lvl >= 2
                              ? 'bg-hazard'
                              : 'bg-emerald-400'
                            : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-relaxed pt-0.5">
                    {status.description}
                  </p>
                </div>

                {/* Heat Sinks Buttons */}
                <div className="pt-2 border-t border-noir-border/50 flex flex-wrap gap-2 justify-end text-[11px]">
                  <SlateButton
                    variant="neutral"
                    disabled={!canPurge}
                    onClick={() => handlePurge(sec.id)}
                    className="text-[10px] flex items-center gap-1.5 py-1 px-2.5"
                    title="Upload sensor scrub to lower heat by 1"
                  >
                    <Terminal className="w-3 h-3 text-hazard" />
                    PURGE LOGS (25D)
                  </SlateButton>

                  <SlateButton
                    variant="hazard"
                    disabled={!canBribe}
                    onClick={() => handleBribe(sec.id)}
                    className="text-[10px] flex items-center gap-1.5 py-1 px-2.5"
                    title={`Bribe checkpoint patrols to lower heat by 1 (Cost: ${bribeCost}C)`}
                  >
                    <Coins className="w-3 h-3" />
                    BRIBE ({bribeCost}C)
                  </SlateButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Faction Suspicion Meters */}
      <div className="space-y-2.5 pt-2">
        <div className="text-xs font-bold text-noir-muted uppercase tracking-wider flex items-center justify-between">
          <span>Faction Suspicion (At 4/4 Kill Squads are Dispatched):</span>
          <span className="text-[11px] text-zinc-500 lowercase">Evaluated daily at Dawn</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(factions).map(([id, faction]) => {
            const isHunting = faction.suspicionLevel >= 4;

            return (
              <div 
                key={id}
                className={`p-3.5 rounded-lg border bg-noir-ink/60 space-y-2 ${
                  isHunting ? 'border-crisis bg-crisis/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-noir-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-200">{faction.name.toUpperCase()}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isHunting ? 'bg-crisis text-white animate-pulse' : 'bg-noir-surface text-hazard'
                  }`}>
                    SUSPICION: {faction.suspicionLevel}/4
                  </span>
                </div>

                {/* 4-bar Suspicion Meter */}
                <div className="flex gap-1.5 h-2">
                  {[1, 2, 3, 4].map((sLevel) => (
                    <div
                      key={sLevel}
                      className={`flex-1 rounded-sm transition-all ${
                        faction.suspicionLevel >= sLevel
                          ? sLevel === 4
                            ? 'bg-crisis'
                            : 'bg-hazard'
                          : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>

                {isHunting ? (
                  <div className="text-[10px] text-crisis font-bold flex items-center gap-1.5 pt-1">
                    <Skull className="w-3.5 h-3.5 animate-pulse" />
                    <span>KILL SQUAD ACTIVE // TARGETING AGENT 0 ON SIGHT</span>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-500 pt-0.5">
                    Faction surveillance is tracking Agency activities.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
