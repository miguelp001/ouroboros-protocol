import React, { useState } from 'react';
import { Operative } from '../../types';
import { 
  Heart, 
  Smile, 
  Wrench, 
  Stethoscope, 
  Compass, 
  UserCheck, 
  Eye
} from 'lucide-react';
import { OperativeDossierModal } from './OperativeDossierModal';
import { soundFx } from '../../audio/soundFx';
import { getOperativePortrait } from '../../utils/assets';

interface RosterViewProps {
  roster: Operative[];
  activeCompanionId: string | null;
  onDeployCompanion: (id: string) => void;
  onAssignWorkstation: (id: string, type: 'FORGE' | 'INFIRMARY' | 'SCOUT') => void;
  onRecruitOperative?: (id: string) => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  roster,
  activeCompanionId,
  onDeployCompanion,
  onAssignWorkstation,
  onRecruitOperative,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'ASSIGNED' | 'FALLEN'>('ALL');
  const [selectedOperative, setSelectedOperative] = useState<Operative | null>(null);

  // Strictly filter to only recruited operatives (hidden if UNRECRUITED)
  const recruitedRoster = roster.filter((op) => op.status !== 'UNRECRUITED');
  const activeCount = recruitedRoster.filter((op) => op.status === 'ACTIVE').length;
  const assignedCount = recruitedRoster.filter((op) => op.status === 'ACTIVE' && !!op.activeAssignment).length;
  const deadCount = recruitedRoster.filter((op) => op.status === 'DEAD' || op.status === 'MUTINIED').length;

  const filteredRoster = recruitedRoster.filter((op) => {
    if (filter === 'ACTIVE') return op.status === 'ACTIVE';
    if (filter === 'ASSIGNED') return op.status === 'ACTIVE' && !!op.activeAssignment;
    if (filter === 'FALLEN') return op.status === 'DEAD' || op.status === 'MUTINIED';
    return true;
  });

  return (
    <div className="space-y-4 font-mono">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-noir-border pb-3">
        <div>
          <h3 className="font-bold text-base text-noir-chalk font-mono tracking-tight">
            AGENCY ROSTER // {recruitedRoster.length} KNOWN {recruitedRoster.length === 1 ? 'OPERATIVE' : 'OPERATIVES'}
          </h3>
          <p className="text-xs text-noir-muted">
            Active: <strong className="text-amber-400">{activeCount}</strong> | On Assignment: <strong className="text-zinc-300">{assignedCount}</strong> | Casualties: <strong className="text-zinc-500">{deadCount}</strong>
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(['ALL', 'ACTIVE', 'ASSIGNED', 'FALLEN'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                soundFx.playClick();
                setFilter(mode);
              }}
              className={`px-2.5 py-1 rounded border text-[11px] font-bold transition-colors ${
                filter === mode
                  ? 'border-amber-400 bg-amber-400/10 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                  : 'border-zinc-800 bg-noir-surface text-noir-muted hover:text-noir-chalk'
              }`}
            >
              {mode} {mode === 'ACTIVE' ? `(${activeCount})` : mode === 'FALLEN' ? `(${deadCount})` : `(${recruitedRoster.length})`}
            </button>
          ))}
        </div>
      </div>

      {recruitedRoster.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-zinc-800 rounded bg-noir-ink/60 text-zinc-500 text-xs">
          No operatives recruited yet. Scour the sectors to locate and recruit survivors.
        </div>
      ) : (
        /* Operatives Grid Showcase */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[56vh] overflow-y-auto pr-1">
          {filteredRoster.map((op) => {
            const isDead = op.status === 'DEAD';
            const isMutinied = op.status === 'MUTINIED';
            const isCompanion = op.id === activeCompanionId;

            return (
              <div 
                key={op.id}
                onClick={() => setSelectedOperative(op)}
                className={`
                  p-3.5 rounded border text-xs space-y-2.5 cursor-pointer transition-all duration-150
                  ${isCompanion 
                    ? 'border-amber-400 bg-amber-400/5 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                    : isDead 
                    ? 'border-zinc-800 bg-zinc-950/40 opacity-60' 
                    : isMutinied
                    ? 'border-amber-900/60 bg-amber-950/20'
                    : 'border-zinc-800 bg-noir-ink/90 hover:border-amber-500/60 hover:bg-zinc-900/60'}
                `}
              >
                {/* Header: Name, Callsign, Status */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded border border-zinc-800 bg-black shrink-0 overflow-hidden relative shadow">
                    <img
                      src={getOperativePortrait(op.id)}
                      alt={op.name}
                      className={`w-full h-full object-cover filter grayscale contrast-125 ${isDead ? 'opacity-30' : ''}`}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center -z-10 text-[10px] text-zinc-500 font-bold">
                      {op.callsign.slice(0, 2)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold truncate ${isDead ? 'line-through text-zinc-500' : 'text-white'}`}>
                        {op.name}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        {isCompanion ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-black font-extrabold flex items-center gap-1">
                            <UserCheck className="w-2.5 h-2.5" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-300 font-bold">
                            {op.callsign}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Role & Vitals Bar */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                      <span className="truncate">{op.role}</span>
                      <div className="flex items-center gap-2.5 shrink-0 ml-1">
                        <span className="flex items-center gap-1 text-zinc-300">
                          <Heart className="w-3 h-3 text-zinc-400" />
                          {op.hp}/{op.maxHp}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <Smile className="w-3 h-3 text-amber-400" />
                          {op.morale}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workstation Badge */}
                {op.activeAssignment && (
                  <div className="text-[10px] p-1.5 rounded bg-black border border-zinc-800 flex items-center justify-between text-amber-400">
                    <span className="flex items-center gap-1.5 font-bold">
                      {op.activeAssignment.type === 'FORGE' && <Wrench className="w-3 h-3" />}
                      {op.activeAssignment.type === 'INFIRMARY' && <Stethoscope className="w-3 h-3" />}
                      {op.activeAssignment.type === 'SCOUT' && <Compass className="w-3 h-3" />}
                      <span>{op.activeAssignment.type}: {op.activeAssignment.target}</span>
                    </span>
                    <span className="font-mono text-[9px] text-zinc-400">
                      [{op.activeAssignment.progress}/{op.activeAssignment.maxProgress}]
                    </span>
                  </div>
                )}

                {/* Loyalty Perk Footer */}
                <div className="text-[10px] text-zinc-400 italic truncate pt-1.5 border-t border-zinc-900 flex items-center justify-between">
                  <span className="truncate">Perk: {op.loyaltyPerk}</span>
                  <Eye className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-1 hover:text-amber-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Operative Detailed Dossier Modal */}
      {selectedOperative && (
        <OperativeDossierModal
          operative={selectedOperative}
          isActiveCompanion={selectedOperative.id === activeCompanionId}
          onClose={() => setSelectedOperative(null)}
          onDeployCompanion={onDeployCompanion}
          onAssignWorkstation={onAssignWorkstation}
          onRecruitOperative={onRecruitOperative}
        />
      )}
    </div>
  );
};
