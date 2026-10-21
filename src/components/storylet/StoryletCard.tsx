import React from 'react';
import { Storylet, StoryletBranch } from '../../engine/qbn/types';
import { Dices, ArrowRight, AlertTriangle, ShieldAlert } from 'lucide-react';
import { calculatePbtAOdds } from '../../engine/pbta';
import { AgentZeroStats } from '../../types';

interface StoryletCardProps {
  storylet: Storylet;
  agentStats: AgentZeroStats;
  isFatigued: boolean;
  hasHelpOut: boolean;
  isRolling: boolean;
  onSelectBranch: (branch: StoryletBranch) => void;
}

export const StoryletCard: React.FC<StoryletCardProps> = ({
  storylet,
  agentStats,
  isFatigued,
  hasHelpOut,
  isRolling,
  onSelectBranch,
}) => {
  const isInterrupt = storylet.isInterrupt;

  const getOddsForBranch = (branch: StoryletBranch) => {
    if (!branch.statCheck) return null;
    const stat = branch.statCheck.stat;
    const netMod = agentStats[stat] + (isFatigued ? -1 : 0) + (hasHelpOut ? 1 : 0);
    return calculatePbtAOdds(netMod);
  };

  return (
    <article 
      className={`
        p-5 rounded-lg border font-mono space-y-5 transition-all
        ${isInterrupt 
          ? 'border-crisis bg-crisis/10 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse' 
          : 'border-noir-border bg-noir-ink/90'}
      `}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-noir-border/80 pb-3">
        <div className="flex items-center gap-2">
          {isInterrupt ? (
            <ShieldAlert className="w-5 h-5 text-crisis animate-bounce" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-hazard" />
          )}
          <div>
            <span className={`text-[10px] tracking-widest uppercase ${isInterrupt ? 'text-crisis font-bold' : 'text-hazard'}`}>
              {isInterrupt ? 'CRITICAL INTERRUPT CARD' : `NODE ${storylet.nodeId ?? storylet.sector.toUpperCase()}`}
            </span>
            <h3 className={`text-base font-bold tracking-tight ${isInterrupt ? 'text-crisis' : 'text-noir-chalk'}`}>
              {storylet.title}
            </h3>
          </div>
        </div>

        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
          isInterrupt 
            ? 'border-crisis/80 bg-crisis/20 text-crisis' 
            : 'border-hazard/40 bg-hazard/10 text-hazard'
        }`}>
          {isInterrupt ? 'LOCKED CRISIS' : 'STORYLET'}
        </span>
      </div>

      {/* Narrative Prose */}
      <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-line">
        {storylet.narrative}
      </p>

      {/* Action Branches */}
      <div className="space-y-3 pt-2">
        <div className="text-xs tracking-wider text-noir-muted uppercase font-bold flex items-center justify-between">
          <span>Available Approaches:</span>
          {isFatigued && (
            <span className="text-crisis text-[10px] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              FATIGUED (-1 TO ALL ROLLS)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {storylet.branches.map((branch, index) => {
            const odds = getOddsForBranch(branch);
            const isStatCheck = !!branch.statCheck;
            const statKey = branch.statCheck?.stat;
            const statValue = statKey ? agentStats[statKey] : 0;
            const isPrimary = index === 0;

            return (
              <button
                key={branch.id}
                onClick={() => onSelectBranch(branch)}
                disabled={isRolling}
                className={`
                  group text-left p-3.5 rounded transition-all text-xs font-mono
                  ${isInterrupt 
                    ? 'border-2 border-crisis bg-black text-crisis hover:bg-crisis/20' 
                    : isPrimary
                    ? 'action-brush-primary transform -rotate-[0.5deg] hover:scale-[1.01]'
                    : 'action-card-secondary hover:scale-[1.005]'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-center justify-between font-black">
                  <span className={`text-sm tracking-wide ${isInterrupt ? 'text-crisis' : isPrimary ? 'text-black font-black' : 'text-amber-300'}`}>
                    {isStatCheck 
                      ? `[${statKey?.toUpperCase()} ${statValue >= 0 ? `+${statValue}` : statValue}] ${isPrimary ? `(( ${branch.label} ))` : `[ ${branch.label} ]`}`
                      : isPrimary ? `(( ${branch.label} ))` : `[ ${branch.label} ]`}
                  </span>
                  {isStatCheck ? (
                    <Dices className={`w-4 h-4 ml-2 shrink-0 ${isInterrupt ? 'text-crisis' : isPrimary ? 'text-black' : 'text-amber-400'}`} />
                  ) : (
                    <ArrowRight className={`w-4 h-4 ml-2 shrink-0 ${isInterrupt ? 'text-crisis' : isPrimary ? 'text-black' : 'text-amber-400'}`} />
                  )}
                </div>

                <p className={`text-[11px] mt-1.5 ${isPrimary ? 'text-zinc-900 font-semibold' : 'text-zinc-400'}`}>
                  {branch.description}
                </p>

                {odds && (
                  <div className={`text-[10px] font-mono mt-2 flex gap-3 border-t pt-1.5 ${isPrimary ? 'border-black/20 text-zinc-900 font-semibold' : 'border-zinc-800 text-zinc-400'}`}>
                    <span>Clean Hit: {odds.cleanHitPct}%</span>
                    <span>Costly: {odds.costlyAdvancePct}%</span>
                    <span>Miss: {odds.missPct}%</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
};
