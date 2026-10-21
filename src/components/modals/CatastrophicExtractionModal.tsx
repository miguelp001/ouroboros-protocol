// Catastrophic Extraction Protocol Modal Component
// Triggered when Agent 0 vitals flatline in combat with an active companion.
// Diegetically conveys emergency Ouroboros dimensional extraction and companion sacrifice.

import React from 'react';
import { ShieldAlert, Zap, Skull, ArrowRight } from 'lucide-react';
import { Operative } from '../../types';
import { soundFx } from '../../audio/soundFx';

interface CatastrophicExtractionModalProps {
  fallenCompanion: Operative | null;
  locationTag: string;
  onAcknowledge: () => void;
}

export const CatastrophicExtractionModal: React.FC<CatastrophicExtractionModalProps> = ({
  fallenCompanion,
  locationTag,
  onAcknowledge,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-lg border-2 border-amber-500 bg-noir-ink p-6 shadow-2xl shadow-amber-500/20 space-y-5">
        {/* Amber & Red Flashing Beacon */}
        <div className="flex items-start gap-3.5 border-b border-amber-500/40 pb-4">
          <div className="p-3 rounded bg-amber-500/20 border border-amber-500 text-amber-400 animate-pulse">
            <Zap className="h-7 w-7" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
              <ShieldAlert className="h-3 w-3" />
              OUROBOROS FAIL-SAFE TRIGGERED
            </div>
            <h3 className="text-lg font-bold text-noir-chalk tracking-tight mt-0.5">
              CATASTROPHIC EXTRACTION PROTOCOL
            </h3>
            <p className="text-xs text-zinc-400">Agent 0 vitals reached 0 HP at {locationTag}.</p>
          </div>
        </div>

        {/* Sacrifice Narrative Tribute */}
        <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
          <div className="p-3 rounded bg-noir-surface border border-noir-border space-y-1.5">
            <div className="text-[10px] font-bold text-hazard uppercase">EMERGENCY TELEMETRY:</div>
            <p className="text-zinc-300">
              The Ouroboros slate burned an emergency Heat surge (+2 Heat) to rip open a dimensional vector, 
              evacuating your bleeding body back to the Threshold Bar with <strong>1 HP</strong>.
            </p>
          </div>

          {fallenCompanion && (
            <div className="p-3.5 rounded border border-crisis/40 bg-crisis/10 flex items-start gap-3">
              <Skull className="h-5 w-5 text-crisis shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-crisis">
                  COMPANION CASUALTY: {fallenCompanion.name} [{fallenCompanion.callsign}]
                </div>
                <p className="text-[11px] text-zinc-300">
                  Refused extraction. Held the mechanical bulkhead against overwhelming hostiles until your signature vanished into the void. 
                  Confirmed <strong>K.I.A.</strong>
                </p>
                <div className="text-[10px] text-zinc-400 italic">
                  Surviving operatives suffered -15 Morale shock. Wake vigil queued at the Bar.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-noir-border/60 flex justify-end">
          <button
            onClick={() => {
              soundFx.playClick();
              onAcknowledge();
            }}
            className="w-full py-2.5 px-4 rounded text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-noir-ink flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/30"
          >
            <span>AWAKEN IN TAPROOM SANCTUARY (1 HP)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
