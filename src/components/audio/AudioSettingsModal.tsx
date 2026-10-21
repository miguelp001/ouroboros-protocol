import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  X, 
  Radio, 
  Sliders, 
  Sparkles, 
  Layers, 
  Activity 
} from 'lucide-react';
import { audioContextManager, AudioSettings } from '../../audio/audioContext';
import { 
  ambientAudioEngine, 
  AmbientSector, 
  SECTOR_SOUNDSCAPES 
} from '../../audio/ambientAudioEngine';
import { soundFx } from '../../audio/soundFx';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<AudioSettings>(audioContextManager.getSettings());
  const [currentSector, setCurrentSector] = useState<AmbientSector>(
    ambientAudioEngine.getCurrentSector()
  );

  useEffect(() => {
    const unsubSettings = audioContextManager.subscribe((next) => {
      setSettings(next);
    });
    const unsubSector = ambientAudioEngine.subscribeSector((nextSec) => {
      setCurrentSector(nextSec);
    });

    return () => {
      unsubSettings();
      unsubSector();
    };
  }, []);

  if (!isOpen) return null;

  const currentInfo = SECTOR_SOUNDSCAPES[currentSector] ?? SECTOR_SOUNDSCAPES.sink;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-ink/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-noir-surface border-2 border-noir-border rounded-xl shadow-2xl p-6 relative overflow-hidden flex flex-col gap-5 text-noir-chalk font-mono"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audio-settings-title"
      >
        {/* Diegetic CRT header line */}
        <div className="flex items-center justify-between border-b border-noir-border pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-hazard animate-pulse" />
            <div>
              <h2 id="audio-settings-title" className="text-sm font-bold text-hazard uppercase tracking-wider">
                Acoustic Bus Telemetry // Audio Processor
              </h2>
              <p className="text-[10px] text-zinc-500">
                Diegetic procedural synthesizer & environmental soundscape
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 rounded text-zinc-400 hover:text-hazard transition-colors"
            title="Close Audio Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Acoustic Zone Card */}
        <div className="bg-noir-ink/90 border border-noir-border/70 rounded-lg p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-hazard" />
              Active Acoustic Resonance
            </span>
            <span className="text-[10px] bg-hazard/10 border border-hazard/40 text-hazard px-2 py-0.5 rounded font-bold">
              {currentInfo.frequencyRange}
            </span>
          </div>
          <div className="text-sm font-bold text-noir-chalk flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-hazard animate-ping" />
            {currentInfo.name}
          </div>
          <p className="text-xs text-zinc-400 italic">
            "{currentInfo.tagline}"
          </p>
        </div>

        {/* Sliders Cluster */}
        <div className="flex flex-col gap-4 bg-noir-ink/50 border border-noir-border/50 rounded-lg p-4">
          {/* Master Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-hazard" />
                Master Level Bus
              </span>
              <span className="text-hazard font-bold">
                {Math.round(settings.masterVolume * 100)}%
              </span>
            </div>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.masterVolume}
              onChange={(e) => {
                audioContextManager.setMasterVolume(parseFloat(e.target.value));
              }}
              className="w-full accent-hazard h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Ambient Soundscape Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-hazard" />
                Environmental Ambience
              </span>
              <span className="text-hazard font-bold">
                {Math.round(settings.ambientVolume * 100)}%
              </span>
            </div>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.ambientVolume}
              onChange={(e) => {
                audioContextManager.setAmbientVolume(parseFloat(e.target.value));
              }}
              className="w-full accent-hazard h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* SFX / Foley Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-hazard" />
                Tactile Foley & Relays
              </span>
              <span className="text-hazard font-bold">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.sfxVolume}
              onChange={(e) => {
                audioContextManager.setSfxVolume(parseFloat(e.target.value));
              }}
              className="w-full accent-hazard h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Manual Sector Acoustic Audition Palette */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
            Acoustic Chamber Crossfade Audition:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[10px]">
            {(['sink', 'heights', 'old_town', 'redoubt', 'scorch', 'bar'] as AmbientSector[]).map((sec) => {
              const isSelected = currentSector === sec;
              return (
                <button
                  key={sec}
                  onClick={() => {
                    soundFx.playTerminalKeystroke();
                    ambientAudioEngine.setSector(sec, 1.0);
                  }}
                  className={`px-2 py-1.5 rounded border transition-colors text-center uppercase font-bold truncate ${
                    isSelected 
                      ? 'bg-hazard text-noir-ink border-hazard' 
                      : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-hazard hover:text-hazard'
                  }`}
                  title={`Crossfade to ${SECTOR_SOUNDSCAPES[sec].name}`}
                >
                  {sec.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Foley Diagnostics & Mute Toggle Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-noir-border pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                audioContextManager.toggleMute();
              }}
              className={`px-3 py-1.5 rounded border flex items-center gap-1.5 text-xs font-bold transition-colors ${
                settings.isMuted
                  ? 'bg-crisis/20 border-crisis text-crisis'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:border-hazard hover:text-hazard'
              }`}
            >
              {settings.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-hazard" />}
              {settings.isMuted ? 'UNMUTE MASTER' : 'MUTE MASTER'}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[10px]">
            <button
              onClick={() => soundFx.playTerminalKeystroke()}
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-hazard hover:text-hazard transition-colors"
              title="Test vintage mechanical key clack"
            >
              TEST KEYSTROKE
            </button>
            <button
              onClick={() => soundFx.playCardDraw()}
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-hazard hover:text-hazard transition-colors"
              title="Test tactile card slide"
            >
              TEST CARD
            </button>
            <button
              onClick={() => soundFx.playDiceRoll()}
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-hazard hover:text-hazard transition-colors"
              title="Test wood dice roll"
            >
              TEST DICE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
