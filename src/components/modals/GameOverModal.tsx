// True Game Over Modal Component
// Displayed when Agent 0 falls while deployed solo or all 15 operatives are exterminated.
// Features CRT scanline disruption, memorial roll call, and timeline reset options.

import React from 'react';
import { Skull, AlertTriangle, RefreshCw, Key, ShieldX } from 'lucide-react';
import { useGameStore } from '../../engine/store';
import { GameOverReason } from '../../engine/permadeathEngine';
import { soundFx } from '../../audio/soundFx';

interface GameOverModalProps {
  reason: GameOverReason | null;
  onResetGame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  reason,
  onResetGame,
}) => {
  const store = useGameStore();
  const fallenOperatives = store.roster.filter((op) => op.status === 'DEAD');
  const daysSurvived = store.time.day;
  const notches = store.notchesOnBar;
  const keysCount = store.agency.keys.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-mono animate-fadeIn">
      {/* Glitch & Red Emergency CRT Container */}
      <div className="relative w-full max-w-2xl rounded-lg border-2 border-crisis bg-noir-ink p-6 shadow-2xl shadow-crisis/30 overflow-hidden space-y-6">
        {/* Background CRT Flatline scanlines */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

        {/* Header Alert */}
        <div className="flex items-start gap-4 border-b border-crisis/40 pb-4">
          <div className="p-3 rounded-md bg-crisis/20 border border-crisis text-crisis animate-pulse">
            <Skull className="h-8 w-8" />
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-widest text-crisis uppercase flex items-center gap-2">
              <ShieldX className="h-3.5 w-3.5" />
              TERMINAL PROTOCOL BREACH // CATASTROPHIC FAILURE
            </div>
            <h2 className="text-xl md:text-2xl font-black text-noir-chalk tracking-tight mt-1">
              {reason === 'SOLO_AGENT_FALLEN' 
                ? 'AGENT 0 TERMINATED IN ACTION (SOLO DEPLOYMENT)' 
                : 'AGENCY EXTINCTION // COMPLETE ROSTER WIPEOUT'}
            </h2>
          </div>
        </div>

        {/* Narrative Post-Mortem */}
        <div className="p-4 rounded border border-crisis/30 bg-crisis/10 text-xs text-zinc-300 leading-relaxed space-y-2">
          {reason === 'SOLO_AGENT_FALLEN' ? (
            <p>
              Agent 0 sustained fatal trauma with zero field companions deployed to cover emergency extraction.
              With no operative to trigger the Ouroboros relay, the cracked slate remains unbonded on the cold tile.
              The clandestine Agency dissolves into under-city myth.
            </p>
          ) : (
            <p>
              Every operative recruited or designated has been wiped out in the field or abandoned the cause in mutiny.
              The Threshold Bar stands silent; no hand remains to turn the iron key.
              The Ouroboros Protocol is permanently abandoned.
            </p>
          )}
        </div>

        {/* Agency Memorial Dossier */}
        <div className="grid grid-cols-3 gap-3 text-center border-y border-noir-border py-3">
          <div className="p-2 rounded bg-noir-surface border border-noir-border">
            <div className="text-[10px] text-noir-muted uppercase">DAYS SURVIVED</div>
            <div className="text-lg font-bold text-hazard">{daysSurvived}</div>
          </div>
          <div className="p-2 rounded bg-noir-surface border border-noir-border">
            <div className="text-[10px] text-noir-muted uppercase">BAR NOTCHES</div>
            <div className="text-lg font-bold text-noir-chalk">{notches}</div>
          </div>
          <div className="p-2 rounded bg-noir-surface border border-noir-border">
            <div className="text-[10px] text-noir-muted uppercase">KEYS SECURED</div>
            <div className="text-lg font-bold text-cyan-400 flex items-center justify-center gap-1">
              <Key className="h-3.5 w-3.5" />
              {keysCount} / 3
            </div>
          </div>
        </div>

        {/* Fallen Roll Call */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-crisis" />
            EPITAPH ROLL CALL ({fallenOperatives.length} FALLEN):
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {fallenOperatives.length > 0 ? (
              fallenOperatives.map((op) => (
                <div 
                  key={op.id}
                  className="flex items-center justify-between p-2 rounded bg-noir-surface border border-noir-border text-xs"
                >
                  <div>
                    <span className="font-bold text-zinc-200">{op.name}</span>
                    <span className="text-zinc-500 ml-1.5 font-mono text-[10px]">[{op.callsign}]</span>
                  </div>
                  <span className="text-[10px] text-crisis italic max-w-xs truncate text-right">
                    {op.epitaphLedger[op.epitaphLedger.length - 1] ?? 'Fallen in combat.'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 italic p-2 text-center">
                Agent 0 fell before any companions could be sacrificed.
              </div>
            )}
          </div>
        </div>

        {/* Restart Action */}
        <div className="pt-2 flex justify-end gap-3 border-t border-noir-border/60">
          <button
            onClick={() => {
              soundFx.playClick();
              onResetGame();
            }}
            className="w-full py-3 px-4 rounded font-bold text-xs uppercase tracking-wider bg-crisis hover:bg-red-600 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-crisis/40"
          >
            <RefreshCw className="h-4 w-4" />
            REINITIALIZE TIMELINE // RESTART CAMPAIGN
          </button>
        </div>
      </div>
    </div>
  );
};
