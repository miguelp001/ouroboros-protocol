import React from 'react';
import { DetailedRollResult } from '../../engine/pbta';
import { DieCube } from './DieCube';
import { Dices, Users, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface DiceTrayProps {
  rollResult: DetailedRollResult | null;
  isRolling?: boolean;
}

export const DiceTray: React.FC<DiceTrayProps> = ({
  rollResult,
  isRolling = false,
}) => {
  if (!rollResult && !isRolling) return null;

  const getTierBannerStyles = (tier?: string) => {
    switch (tier) {
      case 'CLEAN_HIT':
        return 'border-emerald-500/80 bg-emerald-950/30 text-emerald-300';
      case 'COSTLY_ADVANCE':
        return 'border-hazard/80 bg-hazard/15 text-hazard';
      case 'MISS':
        return 'border-crisis/90 bg-crisis/20 text-crisis';
      default:
        return 'border-zinc-700 bg-zinc-900/60 text-zinc-400';
    }
  };

  return (
    <div className="p-4 rounded-lg border border-noir-border bg-noir-ink/90 space-y-4 font-mono shadow-slate-bevel">
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs border-b border-noir-border/80 pb-2">
        <div className="flex items-center gap-2 text-hazard font-bold">
          <Dices className="w-4 h-4 animate-spin-slow" />
          <span>PBTA RESOLUTION TRAY // 2D6 + STAT</span>
        </div>
        <span className="text-[11px] text-zinc-400">
          TEST: <strong className="text-noir-chalk uppercase">{rollResult?.stat ?? 'ROLLING'}</strong>
        </span>
      </div>

      {/* Main Dice Showcase */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Agent 0 Dice */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <DieCube 
              value={rollResult ? rollResult.d1 : 1} 
              isRolling={isRolling} 
              color={rollResult?.tier === 'MISS' ? 'crisis' : 'hazard'} 
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">DIE 1</span>
          </div>
          <span className="text-lg font-bold text-zinc-600">+</span>
          <div className="text-center">
            <DieCube 
              value={rollResult ? rollResult.d2 : 1} 
              isRolling={isRolling} 
              color={rollResult?.tier === 'MISS' ? 'crisis' : 'hazard'} 
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">DIE 2</span>
          </div>
        </div>

        {/* Companion Assist Tray (if Help Out was active) */}
        {rollResult?.helpOutResult && (
          <div className="p-2.5 rounded border border-noir-border bg-noir-surface flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Users className="w-3.5 h-3.5 text-hazard" />
              <div>
                <div className="font-bold text-[11px]">
                  {rollResult.helpOutResult.companion.name} ({rollResult.helpOutResult.companion.callsign})
                </div>
                <div className="text-[10px] text-zinc-400">
                  Help Out [{rollResult.helpOutResult.statName.toUpperCase()}]: [{rollResult.helpOutResult.d1}] + [{rollResult.helpOutResult.d2}] + {rollResult.helpOutResult.statMod} = {rollResult.helpOutResult.total}
                </div>
              </div>
            </div>

            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              rollResult.helpOutResult.success 
                ? 'bg-emerald-950/80 border border-emerald-500/80 text-emerald-400' 
                : 'bg-zinc-800 text-zinc-500'
            }`}>
              {rollResult.helpOutResult.success ? '+1 ASSIST' : 'FAILED (Need 7+)'}
            </span>
          </div>
        )}
      </div>

      {/* Formula Arithmetic Breakdown */}
      {rollResult && (
        <div className="text-xs text-zinc-300 flex flex-wrap items-center gap-1.5 bg-noir-surface/60 p-2.5 rounded border border-noir-border/60">
          <span className="text-zinc-400">Calculation:</span>
          <span>[{rollResult.d1} + {rollResult.d2} = {rollResult.baseDiceTotal}]</span>
          <span>+ [Stat: {rollResult.statMod >= 0 ? `+${rollResult.statMod}` : rollResult.statMod}]</span>
          {rollResult.helpOutResult?.success && (
            <span className="text-emerald-400 font-bold">+ [Help: +1]</span>
          )}
          {rollResult.fatigueMod !== 0 && (
            <span className="text-crisis font-bold">- [Fatigued: -1]</span>
          )}
          {rollResult.forwardMod !== 0 && (
            <span className="text-hazard font-bold">+ [Forward: +{rollResult.forwardMod}]</span>
          )}
          <span className="text-zinc-500">=</span>
          <span className="font-bold text-sm text-hazard">TOTAL: {rollResult.total}</span>
        </div>
      )}

      {/* Final Outcome Banner */}
      {rollResult && (
        <div className={`p-3.5 rounded border ${getTierBannerStyles(rollResult.tier)} space-y-1`}>
          <div className="flex items-center justify-between font-bold text-xs">
            <span className="flex items-center gap-2">
              {rollResult.tier === 'CLEAN_HIT' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              {rollResult.tier === 'COSTLY_ADVANCE' && <AlertTriangle className="w-4 h-4 text-hazard" />}
              {rollResult.tier === 'MISS' && <ShieldAlert className="w-4 h-4 text-crisis animate-pulse" />}
              <strong className="tracking-widest uppercase">{rollResult.label}</strong>
            </span>
            <span className="text-[11px] opacity-80 uppercase">
              {rollResult.tier === 'MISS' ? 'LOCKING IN INTERRUPT CARD' : 'PROGRESS SECURED'}
            </span>
          </div>
          <p className="text-[11px] opacity-90 leading-relaxed">
            {rollResult.narrativeSummary}
          </p>
        </div>
      )}
    </div>
  );
};
