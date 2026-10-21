import React, { useState } from 'react';
import { 
  Clock, 
  ShieldAlert, 
  Activity, 
  Coins, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  Sliders
} from 'lucide-react';
import { useGameStore } from '../../engine/store';
import { soundFx } from '../../audio/soundFx';
import { AudioSettingsModal } from '../audio/AudioSettingsModal';

interface SlateHeaderProps {
  isTilted: boolean;
  onToggleTilt: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SlateHeader: React.FC<SlateHeaderProps> = ({
  isTilted,
  onToggleTilt,
  isMuted,
  onToggleMute,
}) => {
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const time = useGameStore((state) => state.time);
  const agentZero = useGameStore((state) => state.agentZero);
  const economy = useGameStore((state) => state.economy);
  const activeLocation = useGameStore((state) => state.activeLocation);

  const getHeatValue = () => {
    return economy.heat.sink ?? 1;
  };

  return (
    <>
      <header className="relative z-30 px-4 py-2.5 border-b border-noir-border bg-noir-ink/95 flex flex-wrap items-center justify-between gap-3 text-xs tracking-wider">
        {/* Left Hardware Rivet & Model Brand */}
        <div className="flex items-center gap-3">
          {/* Hardware Bezel Rivet */}
          <div className="w-2 h-2 rounded-full border border-zinc-700 bg-zinc-900 shadow-inner hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-hazard animate-pulse shadow-hazard-glow" />
            <span className="font-bold text-hazard tracking-widest text-hazard-glow font-mono">
              OUROBOROS SLATE-4B
            </span>
            <span className="text-zinc-600 font-mono text-[10px] hidden md:inline">
              // SN: 809-VAULT-0
            </span>
          </div>

          <span className="text-noir-border font-bold hidden sm:inline">|</span>
          <span className="text-zinc-300 font-mono text-[11px] bg-noir-surface px-2 py-0.5 rounded border border-noir-border">
            LOC: <strong className="text-hazard">{activeLocation}</strong>
          </span>
        </div>

        {/* Right Telemetry Cluster */}
        <div className="flex items-center gap-4 text-xs font-mono">
          {/* Shift & Day */}
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-hazard" />
            <span>
              SHIFT: <strong className="text-hazard font-bold">{time.shift}</strong> (D{time.day})
            </span>
            {time.fatigued && (
              <span className="text-[9px] bg-crisis/20 border border-crisis text-crisis px-1 py-0.2 rounded font-bold uppercase">
                FATIGUED
              </span>
            )}
          </div>

          {/* Heat Gauge */}
          <div className="flex items-center gap-1.5 text-zinc-300 hidden sm:flex">
            <ShieldAlert className="w-3.5 h-3.5 text-hazard" />
            <span>
              HEAT: <strong className="text-hazard font-bold">{getHeatValue()}/5</strong>
            </span>
          </div>

          {/* Economy Display */}
          <div className="flex items-center gap-1.5 text-zinc-300 hidden md:flex">
            <Coins className="w-3.5 h-3.5 text-hazard" />
            <span title="Digital Cred / Chip Cred">
              D:<strong className="text-noir-chalk">{economy.digitalCred}</strong> | C:<strong className="text-hazard">{economy.chipCred}</strong>
            </span>
          </div>

          {/* HP Bar */}
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <div className="flex items-center gap-1">
              <span className="text-noir-chalk font-bold">{agentZero.hp}/{agentZero.maxHp}</span>
              <div className="w-12 bg-zinc-800 h-2 rounded overflow-hidden border border-zinc-700">
                <div 
                  className={`h-full transition-all duration-300 ${
                    agentZero.hp <= 3 ? 'bg-crisis' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${(agentZero.hp / agentZero.maxHp) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Controls: Audio & Perspective Tilt Toggle */}
          <div className="flex items-center gap-1.5 border-l border-noir-border pl-3">
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleMute();
              }}
              title={isMuted ? 'Unmute Diegetic SFX' : 'Mute Diegetic SFX'}
              className="p-1 rounded text-noir-muted hover:text-hazard transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-hazard" />}
            </button>

            <button
              onClick={() => {
                soundFx.playTerminalKeystroke();
                setIsAudioModalOpen(true);
              }}
              title="Open Acoustic Soundscape Telemetry & Audio Settings"
              className="p-1 rounded text-noir-muted hover:text-hazard transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onToggleTilt();
              }}
              title={isTilted ? 'Flatten Perspective View (Accessibility)' : 'Enable Diegetic 3D Slate Perspective'}
              className="p-1 rounded text-noir-muted hover:text-hazard transition-colors"
            >
              {isTilted ? <Minimize2 className="w-3.5 h-3.5 text-hazard" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      <AudioSettingsModal 
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
      />
    </>
  );
};
