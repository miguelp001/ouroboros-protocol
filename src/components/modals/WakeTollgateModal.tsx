// Wake Tollgate Ceremony Modal Component
// Implements the atmospheric 1860s taproom funeral vigil, procedural eulogy recitation,
// bar notch carving, and moral dilemma (Attend vs Blow Off).

import React, { useState } from 'react';
import { 
  Wine, 
  Flame, 
  Skull, 
  AlertOctagon, 
  Award,
  Clock
} from 'lucide-react';
import { useGameStore } from '../../engine/store';
import { generateEulogy, resolveWakeCeremony } from '../../engine/wakeEngine';

interface WakeTollgateModalProps {
  onCeremonyComplete?: () => void;
}

export const WakeTollgateModal: React.FC<WakeTollgateModalProps> = ({
  onCeremonyComplete,
}) => {
  const store = useGameStore();
  const pendingWakes = store.pendingWakes;
  const currentFallenId = pendingWakes[0];
  const fallenOp = store.roster.find((op) => op.id === currentFallenId);

  const [isCarving, setIsCarving] = useState(false);
  const [ceremonyFeedback, setCeremonyFeedback] = useState<string | null>(null);

  if (!fallenOp) return null;

  const eulogy = generateEulogy(fallenOp, store.notchesOnBar);

  const handleAttend = () => {
    setIsCarving(true);
    const res = resolveWakeCeremony(fallenOp.id, true);
    setCeremonyFeedback(res.narrativeReport);

    setTimeout(() => {
      setIsCarving(false);
      setCeremonyFeedback(null);
      if (pendingWakes.length <= 1 && onCeremonyComplete) {
        onCeremonyComplete();
      }
    }, 1400);
  };

  const handleBlowOff = () => {
    const res = resolveWakeCeremony(fallenOp.id, false);
    setCeremonyFeedback(res.narrativeReport);

    setTimeout(() => {
      setCeremonyFeedback(null);
      if (pendingWakes.length <= 1 && onCeremonyComplete) {
        onCeremonyComplete();
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-mono animate-fadeIn">
      {/* 1860s Taproom Candlelit Wooden Bezel */}
      <div className="relative w-full max-w-2xl rounded-lg border-2 border-amber-800/80 bg-stone-950 p-6 md:p-7 shadow-2xl shadow-amber-950/40 space-y-6 overflow-hidden">
        {/* Soft Ambient Candlelight Radial Gradient */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />

        {/* Top Tollgate Banner */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest">
            <Flame className="h-4 w-4 animate-pulse text-amber-400" />
            <span>THE 1860s TAPROOM // TOLLGATE VIGIL</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>PENDING VIGILS: <strong className="text-amber-400">{pendingWakes.length}</strong></span>
          </div>
        </div>

        {/* Fallen Operative Identity */}
        <div className="flex items-start gap-4 p-4 rounded-md bg-stone-900/80 border border-amber-900/40">
          <div className="p-3 rounded bg-amber-950/60 border border-amber-700/50 text-amber-400 shrink-0">
            <Skull className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>FALLEN OPERATIVE:</span>
              <strong className="text-amber-300">[{fallenOp.callsign}]</strong>
            </div>
            <h3 className="text-lg font-bold text-amber-100">{fallenOp.name}</h3>
            <p className="text-xs text-zinc-400">{fallenOp.role}</p>
          </div>
        </div>

        {/* The Bartender's Recitation & Eulogy */}
        <div className="p-4 rounded-md bg-stone-900/60 border border-stone-800 space-y-3">
          <div className="flex items-center gap-2 text-[10px] text-amber-400 uppercase font-bold tracking-wider">
            <Wine className="h-3.5 w-3.5" />
            <span>THE BARTENDER'S RECITATION:</span>
          </div>

          <blockquote className="text-xs text-zinc-300 italic leading-relaxed border-l-2 border-amber-600/60 pl-3">
            "{eulogy.bartenderSpeech}"
          </blockquote>

          <div className="text-xs font-semibold text-amber-200 bg-amber-950/30 p-2.5 rounded border border-amber-900/30">
            "{eulogy.toast}"
          </div>
        </div>

        {/* Cause of Death & Epitaph History */}
        <div className="space-y-2 text-xs">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="h-3 w-3 text-amber-500" />
            <span>EPITAPH LEDGER RECORD:</span>
          </div>

          <div className="p-3 rounded bg-black/50 border border-stone-800 space-y-1 text-xs">
            <div className="text-crisis font-bold">
              FINAL CASUALTY ENTRY:
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              {eulogy.deathCause}
            </p>

            {eulogy.priorDeeds.length > 0 && (
              <div className="mt-2 pt-2 border-t border-stone-800 text-[10px] text-zinc-500 space-y-0.5">
                <span className="font-bold text-zinc-400">PRIOR HONORS:</span>
                {eulogy.priorDeeds.map((deed, i) => (
                  <div key={i}>• {deed}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Feedback Alert or Carving Animation */}
        {ceremonyFeedback && (
          <div className="p-3 rounded border border-amber-500/50 bg-amber-950/40 text-xs text-amber-200 animate-fadeIn">
            {ceremonyFeedback}
          </div>
        )}

        {/* The Choice Actions */}
        <div className="pt-2 border-t border-amber-900/50 flex flex-col sm:flex-row gap-3">
          {/* Attend Wake */}
          <button
            disabled={isCarving || !!ceremonyFeedback}
            onClick={handleAttend}
            className={`flex-1 py-3 px-4 rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
              isCarving
                ? 'bg-amber-600 text-stone-950 border-amber-400 animate-pulse'
                : 'bg-amber-700/40 hover:bg-amber-600 text-amber-100 hover:text-stone-950 border-amber-600/80 shadow-lg shadow-amber-950/50'
            }`}
          >
            <Wine className="h-4 w-4" />
            <span>{isCarving ? 'CARVING NOTCH...' : `ATTEND WAKE & CARVE NOTCH #${eulogy.notchNumber} (+15 MORALE)`}</span>
          </button>

          {/* Blow It Off */}
          <button
            disabled={isCarving || !!ceremonyFeedback}
            onClick={handleBlowOff}
            className="py-3 px-4 rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-stone-700 bg-stone-900 hover:bg-crisis/30 hover:border-crisis text-zinc-400 hover:text-crisis"
            title="Dismiss ceremony. No notch is carved. Morale drops -20 across all active operatives with mutiny risk."
          >
            <AlertOctagon className="h-4 w-4" />
            <span>BLOW OFF (-20 MORALE)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
