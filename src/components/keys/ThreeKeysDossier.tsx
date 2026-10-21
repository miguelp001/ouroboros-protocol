// The Three Keys Dossier & Vault Zero Gate Monitor Component
// Displays the 3 canonical keys, their physical/digital properties, unlocked passives,
// and the status of the Vault Zero Triple-Lock Blast Gate at Terminus Zero (X-03).

import React from 'react';
import { 
  Key, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { useGameStore } from '../../engine/store';
import { 
  THE_THREE_KEYS, 
  getVaultZeroGateStatus, 
  KeyId, 
  discoverKey 
} from '../../engine/keysEngine';
import { soundFx } from '../../audio/soundFx';

interface ThreeKeysDossierProps {
  onDeployToTerminus?: () => void;
}

export const ThreeKeysDossier: React.FC<ThreeKeysDossierProps> = ({
  onDeployToTerminus,
}) => {
  const store = useGameStore();
  const playerKeys = store.agency.keys as KeyId[];
  const gateStatus = getVaultZeroGateStatus(playerKeys);

  const keyList = Object.values(THE_THREE_KEYS);

  const handleTestDiscover = (keyId: KeyId) => {
    discoverKey(keyId);
    soundFx.playKeyUnlock();
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Header & Vault Zero Gate Status */}
      <div className="rounded-lg border-2 border-noir-border bg-noir-surface/90 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-noir-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-noir-ink border border-noir-border text-hazard">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-hazard font-bold">
                CORE PROGRESSION ARTIFACTS
              </div>
              <h3 className="text-base font-bold text-noir-chalk tracking-tight">
                THE THREE KEYS // VAULT ZERO TRIPLE-LOCK
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded border border-hazard/40 bg-hazard/10 text-hazard text-[11px] font-bold">
              AGENCY RANK {store.agency.level}
            </span>
            <span className="px-2.5 py-1 rounded border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 text-[11px] font-bold">
              {gateStatus.unlockedCount} / 3 KEYS SECURED
            </span>
          </div>
        </div>

        {/* Vault Zero Gate Graphic Card */}
        <div className={`p-4 rounded-md border space-y-3 ${
          gateStatus.allUnlocked 
            ? 'border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-950/30'
            : 'border-noir-border bg-noir-ink'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold tracking-wider uppercase text-zinc-300 flex items-center gap-2">
              <Lock className={`h-4 w-4 ${gateStatus.allUnlocked ? 'text-emerald-400' : 'text-hazard'}`} />
              VAULT ZERO TRIPLE-LOCK BLAST GATE [X-03 TERMINUS ZERO]
            </span>
            <span className={`font-bold ${gateStatus.allUnlocked ? 'text-emerald-400' : 'text-zinc-500'}`}>
              {gateStatus.allUnlocked ? 'GATE DISENGAGED // ALL PASSES ACTIVE' : `${gateStatus.unlockedCount}/3 LOCKS OPEN`}
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {gateStatus.summary}
          </p>

          {/* 3 Lock Cylinders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* Lock 1: Threshold Key */}
            <div className={`p-2.5 rounded border text-[11px] space-y-1 ${
              gateStatus.thresholdKey.present 
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                : 'border-zinc-800 bg-noir-surface text-zinc-600'
            }`}>
              <div className="flex items-center justify-between font-bold text-[10px]">
                <span>LOCK 1: DIMENSIONAL</span>
                {gateStatus.thresholdKey.present ? (
                  <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-zinc-600" />
                )}
              </div>
              <div className="font-bold truncate">THRESHOLD KEY</div>
              <div className="text-[9px] text-zinc-400">
                {gateStatus.thresholdKey.present ? 'Substrate Anchor Engaged' : 'Dimensional Anchor Missing'}
              </div>
            </div>

            {/* Lock 2: Skeleton Key */}
            <div className={`p-2.5 rounded border text-[11px] space-y-1 ${
              gateStatus.skeletonKey.present 
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                : 'border-zinc-800 bg-noir-surface text-zinc-600'
            }`}>
              <div className="flex items-center justify-between font-bold text-[10px]">
                <span>LOCK 2: MECHANICAL</span>
                {gateStatus.skeletonKey.present ? (
                  <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-zinc-600" />
                )}
              </div>
              <div className="font-bold truncate">SKELETON KEY</div>
              <div className="text-[9px] text-zinc-400">
                {gateStatus.skeletonKey.present ? 'Blast Tumblers Overridden' : 'Mechanical Master Missing'}
              </div>
            </div>

            {/* Lock 3: Ghost Key */}
            <div className={`p-2.5 rounded border text-[11px] space-y-1 ${
              gateStatus.ghostKey.present 
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                : 'border-zinc-800 bg-noir-surface text-zinc-600'
            }`}>
              <div className="flex items-center justify-between font-bold text-[10px]">
                <span>LOCK 3: QUANTUM ICE</span>
                {gateStatus.ghostKey.present ? (
                  <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-zinc-600" />
                )}
              </div>
              <div className="font-bold truncate">GHOST KEY</div>
              <div className="text-[9px] text-zinc-400">
                {gateStatus.ghostKey.present ? 'Biometric ICE Sliced' : 'Quantum Slicer Missing'}
              </div>
            </div>
          </div>

          {/* Endgame Transit Trigger */}
          {gateStatus.allUnlocked && onDeployToTerminus && (
            <div className="pt-2">
              <button
                onClick={onDeployToTerminus}
                className="w-full py-2.5 px-4 rounded font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-noir-ink flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>ALL KEYS ENGAGED // DEPLOY TO VAULT ZERO (X-03)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* The 3 Individual Key Dossier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {keyList.map((k) => {
          const isOwned = playerKeys.includes(k.id);

          return (
            <div
              key={k.id}
              className={`rounded-lg border p-4 space-y-3 transition-all ${
                isOwned
                  ? 'border-noir-border bg-noir-surface/90 shadow-sm'
                  : 'border-zinc-800 bg-noir-ink/60 opacity-60'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 border-b border-noir-border/60 pb-2">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
                    {k.code}
                  </span>
                  <h4 className="text-sm font-bold text-noir-chalk mt-0.5">{k.name}</h4>
                  <div className="text-[10px] text-zinc-400">{k.material}</div>
                </div>

                <div className={`p-1.5 rounded border text-[10px] font-bold ${
                  isOwned 
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400'
                    : 'border-zinc-700 bg-noir-ink text-zinc-500'
                }`}>
                  {isOwned ? '[SECURED]' : '[MISSING]'}
                </div>
              </div>

              {/* Description & Lore */}
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                {k.description}
              </p>

              {/* Passive Capabilities */}
              <div className="space-y-1.5 text-[10px]">
                <div className="font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-hazard" />
                  PASSIVE CAPABILITIES:
                </div>
                <ul className="space-y-1 text-zinc-300">
                  {k.passivePerks.map((perk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-hazard font-bold shrink-0">•</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vault Gate Role */}
              <div className="p-2.5 rounded bg-noir-ink border border-noir-border/60 text-[10px] space-y-0.5">
                <span className="font-bold text-zinc-400 uppercase text-[9px]">VAULT ROLE:</span>
                <p className="text-zinc-300 leading-tight">{k.vaultLockRole}</p>
              </div>

              {/* Field Discovery Trigger if Missing */}
              {!isOwned && (
                <div className="pt-2 border-t border-noir-border/60">
                  <button
                    onClick={() => handleTestDiscover(k.id)}
                    className="w-full py-1.5 px-3 rounded text-[10px] font-bold border border-hazard/40 bg-hazard/10 hover:bg-hazard hover:text-noir-ink text-hazard transition-colors flex items-center justify-center gap-1.5"
                    title="Recover this key through field infiltration or salvage operation"
                  >
                    <Key className="h-3 w-3" />
                    RECOVER {k.name.toUpperCase()}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
