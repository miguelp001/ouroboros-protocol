// Taproom Seating & Empty Stools Component
// Physical diegetic representation of the 15 bar stools along the 1860s mahogany counter.
// Permanently empty stools for fallen companions embody the game's core permadeath philosophy.

import React from 'react';
import { 
  Wine, 
  Flame, 
  AlertOctagon, 
  UserCheck 
} from 'lucide-react';
import { Operative } from '../../types';
import { soundFx } from '../../audio/soundFx';

interface TaproomSeatingProps {
  roster: Operative[];
  onSelectOperative?: (operative: Operative) => void;
}

export const TaproomSeating: React.FC<TaproomSeatingProps> = ({
  roster,
  onSelectOperative,
}) => {
  return (
    <div className="space-y-4 font-mono">
      {/* Wooden Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/40 pb-2.5">
        <div>
          <h4 className="text-sm font-bold text-amber-200 tracking-wide flex items-center gap-2">
            <Wine className="h-4 w-4 text-amber-500" />
            THE MAHOGANY COUNTER // 15 STOOLS OF THE AGENCY
          </h4>
          <p className="text-[11px] text-zinc-400">
            Fallen operatives leave permanent empty seats at the taproom. No replacements.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ACTIVE ({roster.filter(o => o.status === 'ACTIVE').length})
          </span>
          <span className="flex items-center gap-1 text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            UNRECRUITED ({roster.filter(o => o.status === 'UNRECRUITED').length})
          </span>
          <span className="flex items-center gap-1 text-crisis">
            <span className="w-2 h-2 rounded-full bg-crisis" />
            K.I.A. ({roster.filter(o => o.status === 'DEAD').length})
          </span>
        </div>
      </div>

      {/* 15 Bar Stools Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {roster.map((op, idx) => {
          const isDead = op.status === 'DEAD';
          const isActive = op.status === 'ACTIVE';
          const isUnrecruited = op.status === 'UNRECRUITED';
          const isMutinied = op.status === 'MUTINIED';

          return (
            <div
              key={op.id}
              onClick={() => {
                soundFx.playClick();
                if (onSelectOperative) onSelectOperative(op);
              }}
              className={`relative rounded-md border p-3 transition-all duration-200 cursor-pointer overflow-hidden ${
                isDead
                  ? 'border-crisis/50 bg-crisis/5 hover:border-crisis hover:bg-crisis/10'
                  : isActive
                  ? 'border-amber-700/60 bg-noir-surface/90 hover:border-amber-500 shadow-sm'
                  : isMutinied
                  ? 'border-red-900 bg-red-950/20 opacity-70'
                  : 'border-noir-border/70 bg-noir-ink/60 opacity-50 hover:opacity-80'
              }`}
            >
              {/* Stool Number & Status Icon */}
              <div className="flex items-start justify-between gap-1 border-b border-noir-border/50 pb-1.5">
                <span className="text-[10px] text-zinc-500 font-bold">
                  STOOL {String(idx + 1).padStart(2, '0')}
                </span>

                {isDead ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-crisis bg-crisis/20 px-1.5 py-0.5 rounded border border-crisis/40">
                    <Flame className="h-3 w-3 text-amber-500 animate-pulse" />
                    EMPTY // K.I.A.
                  </span>
                ) : isActive ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    <UserCheck className="h-3 w-3" />
                    SEATED
                  </span>
                ) : isMutinied ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-red-500 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/40">
                    <AlertOctagon className="h-3 w-3" />
                    MUTINIED
                  </span>
                ) : (
                  <span className="text-[9px] text-zinc-600 uppercase">
                    UNRECRUITED
                  </span>
                )}
              </div>

              {/* Stool Occupant Content */}
              <div className="mt-2 space-y-1">
                <div className="flex items-baseline justify-between">
                  <h5 className={`text-xs font-bold ${isDead ? 'text-zinc-500 line-through' : isActive ? 'text-amber-100' : 'text-zinc-400'}`}>
                    {op.name}
                  </h5>
                  <span className="text-[10px] text-zinc-500">[{op.callsign}]</span>
                </div>

                <div className="text-[10px] text-zinc-400 truncate">
                  {op.role}
                </div>

                {/* Dead Stool Epitaph Plaque */}
                {isDead && (
                  <div className="mt-2 pt-1 border-t border-crisis/30 space-y-1">
                    <div className="flex items-center gap-1 text-[9px] text-amber-500 font-bold">
                      <Wine className="h-3 w-3 rotate-180 opacity-70" />
                      BRASS MEMORIAL PLAQUE
                    </div>
                    <p className="text-[10px] text-crisis italic line-clamp-2 leading-tight">
                      {op.epitaphLedger[op.epitaphLedger.length - 1] ?? 'Fallen in service to the Agency.'}
                    </p>
                  </div>
                )}

                {/* Active Stool Morale & Assignment */}
                {isActive && (
                  <div className="mt-2 pt-1 border-t border-noir-border/50 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400">
                      MORALE: <strong className="text-amber-400">{op.morale}%</strong>
                    </span>
                    {op.activeAssignment ? (
                      <span className="text-cyan-400 truncate max-w-[100px]" title={op.activeAssignment.target}>
                        {op.activeAssignment.type}
                      </span>
                    ) : (
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Wine className="h-2.5 w-2.5 text-amber-500" />
                        In Taproom
                      </span>
                    )}
                  </div>
                )}

                {/* Unrecruited Stool Hint */}
                {isUnrecruited && (
                  <div className="text-[9px] text-zinc-600 italic pt-1">
                    Location: {op.recruitmentLocation ?? 'Sub-surface sectors'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
