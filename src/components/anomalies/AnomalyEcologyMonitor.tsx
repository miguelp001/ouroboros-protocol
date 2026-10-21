// Anomaly Ecology & Containment Monitor Component
// Displays active anomaly tiers across all map sectors, tracks mobile entity migrations,
// alerts for Tier 5 reality tears, and provides direct containment operations.

import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  Crosshair, 
  Sparkles, 
  Flame, 
  Radio 
} from 'lucide-react';
import { useGameStore } from '../../engine/store';
import { 
  canContainAnomaly, 
  deployRealityAnchor, 
  performSpecialistPurge, 
  harvestAnomalyResidue 
} from '../../engine/anomalyEngine';
import { soundFx } from '../../audio/soundFx';

export const AnomalyEcologyMonitor: React.FC = () => {
  const store = useGameStore();
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeCompanionId = store.activeCompanionId;
  const companion = store.roster.find((op) => op.id === activeCompanionId);

  const anomalies = store.nodeAnomalies ?? {};
  const anomalyList = Object.values(anomalies).filter((a) => a.tier > 0);

  // Mobile and high-threat entities
  const mobileEntities = anomalyList.filter((a) => a.isMobile && !a.contained);
  const realityTears = anomalyList.filter((a) => a.tier === 5);

  const handleAnchor = (nodeId: string) => {
    const res = deployRealityAnchor(nodeId);
    setFeedback(res.message);
    if (!res.success) soundFx.playGlitch();
  };

  const handlePurge = (nodeId: string) => {
    if (!activeCompanionId) return;
    const res = performSpecialistPurge(nodeId, activeCompanionId);
    setFeedback(res.message);
    if (!res.success) soundFx.playGlitch();
  };

  const handleHarvest = (nodeId: string) => {
    const res = harvestAnomalyResidue(nodeId);
    setFeedback(res.message);
    if (!res.success) soundFx.playGlitch();
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
      case 2:
        return 'border-hazard/60 text-hazard bg-hazard/10';
      case 3:
      case 4:
        return 'border-orange-500/60 text-orange-400 bg-orange-950/20';
      case 5:
        return 'border-crisis text-crisis bg-crisis/20 animate-pulse';
      default:
        return 'border-zinc-700 text-zinc-400 bg-noir-ink';
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Telemetry Header */}
      <div className="rounded border border-noir-border bg-noir-surface/90 p-4 shadow-sm space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-noir-border pb-2.5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-noir-chalk">
              ANOMALY ECOLOGY // CONTAINMENT & RESEARCH
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-noir-muted">
            <span>ACTIVE CLUSTERS: <strong className="text-purple-400">{anomalyList.length}</strong></span>
            <span>MOBILE STALKERS: <strong className="text-orange-400">{mobileEntities.length}</strong></span>
          </div>
        </div>

        <p className="text-zinc-400 leading-relaxed text-[11px]">
          Anomalous entities permeate the under-city transit arteries. Tiers 1–2 manifest as spatial distortions, 
          Tiers 3–4 are mobile predators migrating along subway lines at <strong>DAWN</strong>, and Tier 5 represents uncontained systemic reality tears.
        </p>

        {feedback && (
          <div className="mt-2 p-2.5 rounded border border-purple-500/50 bg-noir-ink text-purple-200 text-xs flex items-center justify-between animate-fadeIn">
            <span>{feedback}</span>
            <button onClick={() => setFeedback(null)} className="text-zinc-500 hover:text-zinc-300 text-[10px]">
              [DISMISS]
            </button>
          </div>
        )}
      </div>

      {/* Critical Entity Alerts (Mobile Stalkers & Reality Tears) */}
      {(mobileEntities.length > 0 || realityTears.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mobileEntities.map((ent) => (
            <div key={ent.nodeId} className="p-3 rounded border border-orange-500/60 bg-orange-950/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-orange-400 uppercase flex items-center gap-1.5">
                  <Flame className="h-3 w-3 animate-pulse" />
                  MOBILE ENTITY LOCATED
                </span>
                <span className="text-[10px] font-bold text-orange-300">STATION: {ent.nodeId}</span>
              </div>
              <h5 className="font-bold text-zinc-100 text-xs">{ent.entityName ?? 'Unidentified Sapient Entity'}</h5>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Entity actively stalks the transit line. Migrates to connected adjacent stations every day at DAWN.
              </p>
            </div>
          ))}

          {realityTears.map((tear) => (
            <div key={tear.nodeId} className="p-3 rounded border border-crisis bg-crisis/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-crisis uppercase flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 animate-bounce" />
                  TIER 5 SYSTEMIC REALITY TEAR
                </span>
                <span className="text-[10px] font-bold text-crisis">TERMINUS: {tear.nodeId}</span>
              </div>
              <h5 className="font-bold text-zinc-100 text-xs">{tear.entityName ?? 'Abyssal Reality Rupture'}</h5>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Uncontained reality tear. Propagates dimensional contagion along connected subway spurs every 3 days.
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Anomaly Stations Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {anomalyList.map((a) => {
          const check = canContainAnomaly(a.nodeId, activeCompanionId);
          const isAtCurrentLocation = a.nodeId === store.activeLocation;

          return (
            <div
              key={a.nodeId}
              className={`rounded border p-3 bg-noir-surface/80 space-y-2 transition-all ${
                isAtCurrentLocation ? 'border-hazard ring-1 ring-hazard/50' : 'border-noir-border'
              }`}
            >
              <div className="flex items-start justify-between gap-1 border-b border-noir-border/50 pb-1.5">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    {a.nodeId}
                  </span>
                  <h5 className="text-xs font-bold text-zinc-200">
                    {a.entityName ?? `Station ${a.nodeId} Distortion`}
                  </h5>
                </div>

                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getTierColor(a.tier)}`}>
                  TIER {a.tier}
                </span>
              </div>

              <div className="text-[10px] text-zinc-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>STATUS:</span>
                  <strong className={a.contained ? 'text-emerald-400' : 'text-amber-400'}>
                    {a.contained ? 'CONTAINED / ANCHORED' : 'ACTIVE / UNCONTAINED'}
                  </strong>
                </div>
                {a.isMobile && (
                  <div className="text-orange-400 flex items-center gap-1 font-bold text-[9px]">
                    <Radio className="h-2.5 w-2.5 animate-pulse" />
                    AUTONOMOUS MIGRATION ACTIVE
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-noir-border/50 flex flex-wrap gap-1.5">
                {check.canAnchor && (
                  <button
                    onClick={() => handleAnchor(a.nodeId)}
                    className="px-2 py-1 rounded text-[10px] font-bold border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-600 hover:text-black text-cyan-300 transition-colors flex items-center gap-1"
                    title="Cost: 30 Chip Creds. Reduces tier by 2 and recovers +25 Digital Creds."
                  >
                    <ShieldCheck className="h-3 w-3" />
                    ANCHOR (-30C)
                  </button>
                )}

                {check.canPurge && (
                  <button
                    onClick={() => handlePurge(a.nodeId)}
                    className="px-2 py-1 rounded text-[10px] font-bold border border-purple-500/40 bg-purple-950/30 hover:bg-purple-600 hover:text-white text-purple-300 transition-colors flex items-center gap-1"
                    title={`Specialist Purge with ${check.specialistName}`}
                  >
                    <Sparkles className="h-3 w-3" />
                    PURGE ({companion?.callsign})
                  </button>
                )}

                {check.canHarvest && (
                  <button
                    onClick={() => handleHarvest(a.nodeId)}
                    className="px-2 py-1 rounded text-[10px] font-bold border border-amber-500/40 bg-amber-950/30 hover:bg-amber-600 hover:text-black text-amber-300 transition-colors flex items-center gap-1"
                    title="Harvest anomaly residue: +40 Digital Creds, +1 Sector Heat."
                  >
                    <Crosshair className="h-3 w-3" />
                    HARVEST (+40D)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
