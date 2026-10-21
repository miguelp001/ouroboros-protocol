import React, { useState } from 'react';
import { MapNode } from '../../data/transitMapData';
import { 
  Compass, 
  ShieldAlert, 
  Radio, 
  MapPin, 
  FastForward, 
  Key, 
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Crosshair
} from 'lucide-react';
import { SlateButton } from '../slate/SlateButton';
import { TravelCheckResult } from '../../engine/transitEngine';
import { 
  getNodeAnomaly, 
  canContainAnomaly, 
  deployRealityAnchor, 
  performSpecialistPurge, 
  harvestAnomalyResidue 
} from '../../engine/anomalyEngine';
import { useGameStore } from '../../engine/store';
import { soundFx } from '../../audio/soundFx';

interface NodeTelemetryCardProps {
  node: MapNode;
  isCurrentLocation: boolean;
  travelCheck: TravelCheckResult;
  currentSectorHeat: number;
  onInitiateTravel: (nodeId: string) => void;
}

export const NodeTelemetryCard: React.FC<NodeTelemetryCardProps> = ({
  node,
  isCurrentLocation,
  travelCheck,
  currentSectorHeat,
  onInitiateTravel,
}) => {
  const store = useGameStore();
  const [containmentNotice, setContainmentNotice] = useState<string | null>(null);

  const activeCompanionId = store.activeCompanionId;
  const companion = store.roster.find((op) => op.id === activeCompanionId);

  // Live Anomaly Telemetry
  const liveAnomaly = getNodeAnomaly(node.id);
  const containmentCheck = canContainAnomaly(node.id, activeCompanionId);

  const getAnomalyBadge = (tier: number, isContained?: boolean, isMobile?: boolean) => {
    if (isContained && tier === 0) {
      return { label: 'CLEAN // ANCHORED REALITY', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20' };
    }
    if (isContained) {
      return { label: `TIER ${tier} // ANCHORED STABILIZATION`, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20' };
    }
    if (isMobile) {
      return { label: `TIER ${tier} // MOBILE STALKER PRESENT`, color: 'text-orange-400 border-orange-500/40 bg-orange-950/20 animate-pulse' };
    }
    switch (tier) {
      case 0:
        return { label: 'CLEAN // NO RESIDUAL TEAR', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20' };
      case 1:
      case 2:
        return { label: `TIER ${tier} // SPATIAL LOOP`, color: 'text-hazard border-hazard/40 bg-hazard/10' };
      case 3:
      case 4:
        return { label: `TIER ${tier} // MOBILE SAPIENT ENTITY`, color: 'text-orange-400 border-orange-500/40 bg-orange-950/20' };
      case 5:
      default:
        return { label: 'TIER 5 // SYSTEMIC REALITY TEAR', color: 'text-crisis border-crisis bg-crisis/20 animate-pulse' };
    }
  };

  const anomaly = getAnomalyBadge(liveAnomaly.tier, liveAnomaly.contained, liveAnomaly.isMobile);

  const handleAnchor = () => {
    const res = deployRealityAnchor(node.id);
    setContainmentNotice(res.message);
    if (!res.success) soundFx.playGlitch();
  };

  const handlePurge = () => {
    if (!activeCompanionId) return;
    const res = performSpecialistPurge(node.id, activeCompanionId);
    setContainmentNotice(res.message);
    if (!res.success) soundFx.playGlitch();
  };

  const handleHarvest = () => {
    const res = harvestAnomalyResidue(node.id);
    setContainmentNotice(res.message);
    if (!res.success) soundFx.playGlitch();
  };

  return (
    <div className="p-4 rounded-lg border border-noir-border bg-noir-ink/90 font-mono text-xs space-y-4 shadow-slate-bevel">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-noir-border pb-2.5">
        <div className="flex items-center gap-2">
          <MapPin className={`w-4 h-4 ${isCurrentLocation ? 'text-hazard animate-bounce' : 'text-zinc-400'}`} />
          <div>
            <div className="text-[10px] text-hazard uppercase tracking-wider">{node.code} TELEMETRY</div>
            <h4 className="text-sm font-bold text-noir-chalk">{node.name}</h4>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${anomaly.color}`}>
          {anomaly.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-[11px] text-zinc-300 leading-relaxed">
        {node.description}
      </p>

      {/* Telemetry Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
        <div className="p-2.5 rounded bg-noir-surface border border-noir-border space-y-0.5">
          <div className="text-[10px] text-noir-muted flex items-center gap-1">
            <Radio className="w-3 h-3 text-hazard" />
            <span>CONTROLLING FACTION:</span>
          </div>
          <div className="font-bold text-zinc-200 truncate">{node.controllingFaction}</div>
        </div>

        <div className="p-2.5 rounded bg-noir-surface border border-noir-border space-y-0.5">
          <div className="text-[10px] text-noir-muted flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-hazard" />
            <span>DISTRICT HEAT:</span>
          </div>
          <div className="font-bold text-hazard">
            {node.sector === 'bar' ? '0/5 (SANCTUARY)' : `${currentSectorHeat}/5 HOSTILITY`}
          </div>
        </div>

        <div className="p-2.5 rounded bg-noir-surface border border-noir-border space-y-0.5">
          <div className="text-[10px] text-noir-muted flex items-center gap-1">
            <Compass className="w-3 h-3 text-hazard" />
            <span>TRANSIT LINES:</span>
          </div>
          <div className="font-bold text-zinc-300">
            {node.lines.length > 0 ? node.lines.map(l => l.replace('line_', 'LINE ').toUpperCase()).join(', ') : 'OFF-GRID'}
          </div>
        </div>
      </div>

      {/* Containment & Anomaly Field Operations */}
      {isCurrentLocation && liveAnomaly.tier > 0 && (
        <div className="p-3 rounded bg-purple-950/20 border border-purple-500/40 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-purple-300 uppercase flex items-center gap-1.5">
              <ShieldAlert className="h-3 w-3 text-purple-400" />
              FIELD ANOMALY OPERATIONS // {liveAnomaly.entityName ?? `TIER ${liveAnomaly.tier}`}
            </span>
            <span className="text-zinc-400">CHIP: <strong className="text-amber-400">{store.economy.chipCred}C</strong></span>
          </div>

          {containmentNotice && (
            <div className="p-2 rounded bg-noir-ink border border-purple-500/30 text-[10px] text-purple-200">
              {containmentNotice}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {containmentCheck.canAnchor && (
              <button
                onClick={handleAnchor}
                className="px-2.5 py-1 rounded text-[10px] font-bold border border-cyan-500/50 bg-cyan-950/40 hover:bg-cyan-600 hover:text-black text-cyan-300 flex items-center gap-1 transition-colors"
                title="Deploy reality anchor: -30 Chip Creds, +25 Digital Creds, Tier -2."
              >
                <ShieldCheck className="h-3 w-3" />
                DEPLOY REALITY ANCHOR (-30C)
              </button>
            )}

            {containmentCheck.canPurge && (
              <button
                onClick={handlePurge}
                className="px-2.5 py-1 rounded text-[10px] font-bold border border-purple-500/50 bg-purple-950/40 hover:bg-purple-600 hover:text-white text-purple-200 flex items-center gap-1 transition-colors"
                title={`Specialist Purge with ${containmentCheck.specialistName}`}
              >
                <Sparkles className="h-3 w-3" />
                PURGE ANOMALY ({companion?.callsign})
              </button>
            )}

            {containmentCheck.canHarvest && (
              <button
                onClick={handleHarvest}
                className="px-2.5 py-1 rounded text-[10px] font-bold border border-amber-500/50 bg-amber-950/40 hover:bg-amber-600 hover:text-black text-amber-300 flex items-center gap-1 transition-colors"
                title="Harvest anomaly residue: +40 Digital Creds, +1 Sector Heat."
              >
                <Crosshair className="h-3 w-3" />
                HARVEST RESIDUE (+40D)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Travel Actions & Diagnostics */}
      <div className="pt-2 border-t border-noir-border flex flex-wrap items-center justify-between gap-3">
        <div>
          {isCurrentLocation ? (
            <span className="text-hazard font-bold flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-hazard animate-pulse" />
              CURRENT LOCATION NODE
            </span>
          ) : !travelCheck.canTravel ? (
            <span className="text-zinc-500 flex items-center gap-1 text-[11px]">
              <AlertTriangle className="w-3 h-3 text-zinc-600" />
              {travelCheck.reason}
            </span>
          ) : (
            <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
              <span>DIRECT TRANSIT SPUR CLEAR // COST: {travelCheck.shiftCost} SHIFT</span>
            </span>
          )}
        </div>

        {!isCurrentLocation && (
          <div>
            {node.id === 'THRESHOLD_BAR' ? (
              <SlateButton
                variant="hazard"
                onClick={() => onInitiateTravel(node.id)}
                disabled={!travelCheck.canTravel}
                className="text-xs flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                EVACUATE TO BAR (THRESHOLD KEY)
              </SlateButton>
            ) : (
              <SlateButton
                variant="hazard"
                onClick={() => onInitiateTravel(node.id)}
                disabled={!travelCheck.canTravel}
                className="text-xs flex items-center gap-1.5"
              >
                <FastForward className="w-3.5 h-3.5" />
                TRANSIT TO STATION (1 SHIFT)
              </SlateButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
