import React from 'react';
import { MapNode } from '../../data/transitMapData';
import { 
  Compass, 
  ShieldAlert, 
  Radio, 
  MapPin, 
  FastForward, 
  Key, 
  AlertTriangle 
} from 'lucide-react';
import { SlateButton } from '../slate/SlateButton';
import { TravelCheckResult } from '../../engine/transitEngine';

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
  const getAnomalyBadge = (tier: number) => {
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

  const anomaly = getAnomalyBadge(node.anomalyTier);

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
