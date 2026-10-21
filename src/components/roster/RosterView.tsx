import React, { useState } from 'react';
import { Operative } from '../../types';
import { 
  Heart, 
  Smile, 
  Wrench, 
  Stethoscope, 
  Compass, 
  UserCheck, 
  Eye, 
  Lock,
  MapPin
} from 'lucide-react';
import { OperativeDossierModal } from './OperativeDossierModal';
import { soundFx } from '../../audio/soundFx';

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
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'UNRECRUITED' | 'ASSIGNED' | 'DEAD'>('ALL');
  const [selectedOperative, setSelectedOperative] = useState<Operative | null>(null);

  const activeCount = roster.filter((op) => op.status === 'ACTIVE').length;
  const unrecruitedCount = roster.filter((op) => op.status === 'UNRECRUITED').length;
  const deadCount = roster.filter((op) => op.status === 'DEAD' || op.status === 'MUTINIED').length;

  const filteredRoster = roster.filter((op) => {
    if (filter === 'ACTIVE') return op.status === 'ACTIVE';
    if (filter === 'UNRECRUITED') return op.status === 'UNRECRUITED';
    if (filter === 'ASSIGNED') return op.status === 'ACTIVE' && !!op.activeAssignment;
    if (filter === 'DEAD') return op.status === 'DEAD' || op.status === 'MUTINIED';
    return true;
  });

  return (
    <div className="space-y-4 font-mono">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-noir-border pb-3">
        <div>
          <h3 className="font-bold text-base text-noir-chalk font-mono">AGENCY ROSTER // 15 OPERATIVES</h3>
          <p className="text-xs text-noir-muted">
            Active: <strong className="text-emerald-400">{activeCount}</strong> | Unrecruited: <strong className="text-zinc-400">{unrecruitedCount}</strong> | Casualties: <strong className="text-crisis">{deadCount}</strong>
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(['ALL', 'ACTIVE', 'UNRECRUITED', 'ASSIGNED', 'DEAD'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                soundFx.playClick();
                setFilter(mode);
              }}
              className={`px-2.5 py-1 rounded border text-[11px] font-bold transition-colors ${
                filter === mode
                  ? 'border-hazard bg-hazard/10 text-hazard'
                  : 'border-noir-border bg-noir-surface text-noir-muted hover:text-noir-chalk'
              }`}
            >
              {mode} {mode === 'ACTIVE' ? `(${activeCount})` : mode === 'UNRECRUITED' ? `(${unrecruitedCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Operatives Grid Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[56vh] overflow-y-auto pr-1">
        {filteredRoster.map((op) => {
          const isDead = op.status === 'DEAD';
          const isMutinied = op.status === 'MUTINIED';
          const isUnrecruited = op.status === 'UNRECRUITED';
          const isCompanion = op.id === activeCompanionId;

          return (
            <div 
              key={op.id}
              onClick={() => setSelectedOperative(op)}
              className={`
                p-3.5 rounded border text-xs space-y-2.5 cursor-pointer transition-all duration-150
                ${isCompanion 
                  ? 'border-hazard bg-hazard/5 shadow-[0_0_12px_rgba(250,204,21,0.15)]' 
                  : isUnrecruited
                  ? 'border-dashed border-zinc-700 bg-noir-surface/40 hover:border-zinc-500'
                  : isDead 
                  ? 'border-crisis/40 bg-crisis/5 opacity-60' 
                  : isMutinied
                  ? 'border-amber-600/40 bg-amber-950/20'
                  : 'border-noir-border bg-noir-ink/70 hover:border-hazard/60 hover:bg-noir-elevated'}
              `}
            >
              {/* Header: Name, Callsign, Status */}
              <div className="flex items-center justify-between">
                <span className={`font-bold ${isDead ? 'line-through text-crisis' : isUnrecruited ? 'text-zinc-400' : 'text-noir-chalk'}`}>
                  {op.name}
                </span>

                <div className="flex items-center gap-1.5">
                  {isCompanion && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-hazard text-noir-ink font-bold flex items-center gap-1">
                      <UserCheck className="w-2.5 h-2.5" />
                      ACTIVE
                    </span>
                  )}
                  {isUnrecruited ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-500 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      LOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-hazard">
                      {op.callsign}
                    </span>
                  )}
                </div>
              </div>

              {/* Role & Vitals Bar */}
              <div className="flex items-center justify-between text-[11px] text-noir-muted">
                <span>{op.role}</span>
                {!isUnrecruited && (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" />
                      {op.hp}/{op.maxHp}
                    </span>
                    <span className="flex items-center gap-1">
                      <Smile className="w-3 h-3 text-hazard" />
                      {op.morale}%
                    </span>
                  </div>
                )}
              </div>

              {/* Recruitment Intel (if unrecruited) */}
              {isUnrecruited && (
                <div className="text-[10px] p-2 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-400 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-hazard shrink-0" />
                  <span className="truncate">Intel: {op.recruitmentLocation ?? 'Somewhere in Metropolis'}</span>
                </div>
              )}

              {/* Workstation Badge */}
              {op.activeAssignment && (
                <div className="text-[10px] p-1.5 rounded bg-noir-surface border border-noir-border flex items-center justify-between text-hazard">
                  <span className="flex items-center gap-1.5 font-bold">
                    {op.activeAssignment.type === 'FORGE' && <Wrench className="w-3 h-3" />}
                    {op.activeAssignment.type === 'INFIRMARY' && <Stethoscope className="w-3 h-3" />}
                    {op.activeAssignment.type === 'SCOUT' && <Compass className="w-3 h-3" />}
                    {op.activeAssignment.type}
                  </span>
                  <span>{op.activeAssignment.progress}/{op.activeAssignment.maxProgress} SHIFTS</span>
                </div>
              )}

              {/* Loyalty Perk Footer */}
              <div className="text-[10px] text-zinc-400 italic truncate pt-1 border-t border-noir-border/40 flex items-center justify-between">
                <span className="truncate">{op.loyaltyPerk}</span>
                <Eye className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-1 hover:text-hazard" />
              </div>
            </div>
          );
        })}
      </div>

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
