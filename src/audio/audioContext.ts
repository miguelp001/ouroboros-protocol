// Centralized Diegetic Web Audio Context and Bus Hierarchy for Ouroboros Protocol
// Audio routing graph:
//   SFX Sources -> sfxGain -------\
//                                 +--> masterGain --> audioContext.destination
//   Ambient Loops -> ambientGain -/

export interface AudioSettings {
  masterVolume: number; // 0.0 - 1.0
  ambientVolume: number; // 0.0 - 1.0
  sfxVolume: number; // 0.0 - 1.0
  isMuted: boolean;
}

const STORAGE_KEY = 'ouroboros_audio_settings';

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.8,
  ambientVolume: 0.6,
  sfxVolume: 0.8,
  isMuted: false,
};

type AudioSettingsListener = (settings: AudioSettings) => void;

class AudioContextManager {
  private ctx: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private ambientGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private settings: AudioSettings = { ...DEFAULT_SETTINGS };
  private listeners: Set<AudioSettingsListener> = new Set();

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.settings = {
            masterVolume: typeof parsed.masterVolume === 'number' ? Math.max(0, Math.min(1, parsed.masterVolume)) : DEFAULT_SETTINGS.masterVolume,
            ambientVolume: typeof parsed.ambientVolume === 'number' ? Math.max(0, Math.min(1, parsed.ambientVolume)) : DEFAULT_SETTINGS.ambientVolume,
            sfxVolume: typeof parsed.sfxVolume === 'number' ? Math.max(0, Math.min(1, parsed.sfxVolume)) : DEFAULT_SETTINGS.sfxVolume,
            isMuted: typeof parsed.isMuted === 'boolean' ? parsed.isMuted : DEFAULT_SETTINGS.isMuted,
          };
        }
      } catch {
        // Fallback to defaults on storage failure
        this.settings = { ...DEFAULT_SETTINGS };
      }
    }
  }

  private saveSettings() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      } catch {
        // Ignore local storage quota errors
      }
    }
  }

  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
          this.setupBuses();
        } catch {
          return null;
        }
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private setupBuses() {
    if (!this.ctx) return;

    // Master bus
    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.setValueAtTime(
      this.settings.isMuted ? 0 : this.settings.masterVolume,
      this.ctx.currentTime
    );
    this.masterGainNode.connect(this.ctx.destination);

    // Ambient bus
    this.ambientGainNode = this.ctx.createGain();
    this.ambientGainNode.gain.setValueAtTime(this.settings.ambientVolume, this.ctx.currentTime);
    this.ambientGainNode.connect(this.masterGainNode);

    // SFX bus
    this.sfxGainNode = this.ctx.createGain();
    this.sfxGainNode.gain.setValueAtTime(this.settings.sfxVolume, this.ctx.currentTime);
    this.sfxGainNode.connect(this.masterGainNode);
  }

  public getMasterBus(): GainNode | null {
    this.getContext();
    return this.masterGainNode;
  }

  public getAmbientBus(): GainNode | null {
    this.getContext();
    return this.ambientGainNode;
  }

  public getSfxBus(): GainNode | null {
    this.getContext();
    return this.sfxGainNode;
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public setMasterVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.settings.masterVolume = clamped;
    this.saveSettings();
    if (this.ctx && this.masterGainNode) {
      const target = this.settings.isMuted ? 0 : clamped;
      this.masterGainNode.gain.setValueAtTime(target, this.ctx.currentTime);
    }
    this.notify();
  }

  public setAmbientVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.settings.ambientVolume = clamped;
    this.saveSettings();
    if (this.ctx && this.ambientGainNode) {
      this.ambientGainNode.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
    this.notify();
  }

  public setSfxVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.settings.sfxVolume = clamped;
    this.saveSettings();
    if (this.ctx && this.sfxGainNode) {
      this.sfxGainNode.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
    this.notify();
  }

  public setMuted(muted: boolean) {
    this.settings.isMuted = muted;
    this.saveSettings();
    if (this.ctx && this.masterGainNode) {
      const target = muted ? 0 : this.settings.masterVolume;
      this.masterGainNode.gain.setValueAtTime(target, this.ctx.currentTime);
    }
    this.notify();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.settings.isMuted);
    return this.settings.isMuted;
  }

  public subscribe(listener: AudioSettingsListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const copy = { ...this.settings };
    this.listeners.forEach((listener) => {
      try {
        listener(copy);
      } catch {
        // Suppress listener errors
      }
    });
  }

  // Used for unit test injection
  public setContextForTesting(ctx: AudioContext | null) {
    this.ctx = ctx;
    if (ctx) {
      this.setupBuses();
    } else {
      this.masterGainNode = null;
      this.ambientGainNode = null;
      this.sfxGainNode = null;
    }
  }
}

export const audioContextManager = new AudioContextManager();
