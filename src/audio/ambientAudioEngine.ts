// Diegetic Ambient Audio Engine for Ouroboros Protocol
// Procedural soundscapes for each sector & sanctuary bar via Web Audio API.
// Features smooth exponential cross-fades (0.8s - 1.2s) and zero external dependencies.

import { audioContextManager } from './audioContext';

export type AmbientSector = 'sink' | 'heights' | 'old_town' | 'redoubt' | 'scorch' | 'bar' | 'silence';

export interface SectorSoundscapeInfo {
  id: AmbientSector;
  name: string;
  tagline: string;
  frequencyRange: string;
}

export const SECTOR_SOUNDSCAPES: Record<AmbientSector, SectorSoundscapeInfo> = {
  sink: {
    id: 'sink',
    name: 'The Sink (Submerged Spur)',
    tagline: 'Hollow synths, tidal water sloshing & distant 65 Hz foghorns',
    frequencyRange: '65 Hz - 650 Hz',
  },
  heights: {
    id: 'heights',
    name: 'The Heights (Tower Artery)',
    tagline: 'Oppressive 55 Hz power grid sub-bass, choral hum & HVAC hiss',
    frequencyRange: '55 Hz - 2.8 kHz',
  },
  old_town: {
    id: 'old_town',
    name: 'Old Town (The Cut)',
    tagline: 'Frantic scrap-metal percussion, steam pipe venting & boiler drone',
    frequencyRange: '76 Hz - 3.5 kHz',
  },
  redoubt: {
    id: 'redoubt',
    name: 'The Redoubt (Bastion Line)',
    tagline: 'Militaristic 4/4 marching snare, radar sweep pings & encrypted radio static',
    frequencyRange: '108 BPM / 1850 Hz Ping',
  },
  scorch: {
    id: 'scorch',
    name: 'The Scorch (Contagion Corridor)',
    tagline: 'Desolate howling radioactive wind, distorted analog drone & Geiger clicks',
    frequencyRange: '68 Hz Drone / Poisson Clicks',
  },
  bar: {
    id: 'bar',
    name: 'The Threshold Bar (Sanctuary)',
    tagline: 'Acoustic isolation, 1860s grandfather clock tick-tock & hearth crackle',
    frequencyRange: '1.0s Pendulum / 2.4 kHz Hearth',
  },
  silence: {
    id: 'silence',
    name: 'Muted Acoustic Field',
    tagline: 'Zero signal reception / Slate powered down',
    frequencyRange: '0 Hz',
  },
};

interface ActiveSoundscapeInstance {
  sector: AmbientSector;
  sectorGain: GainNode;
  cleanup: () => void;
}

type SectorChangeListener = (sector: AmbientSector) => void;

class DiegeticAmbientAudioEngine {
  private activeInstance: ActiveSoundscapeInstance | null = null;
  private currentSector: AmbientSector = 'silence';
  private sectorListeners: Set<SectorChangeListener> = new Set();
  private isAutoEngaged: boolean = false;

  public getCurrentSector(): AmbientSector {
    return this.currentSector;
  }

  public subscribeSector(listener: SectorChangeListener): () => void {
    this.sectorListeners.add(listener);
    return () => {
      this.sectorListeners.delete(listener);
    };
  }

  private notifySectorChange(sector: AmbientSector) {
    this.sectorListeners.forEach((l) => {
      try {
        l(sector);
      } catch {
        // Suppress subscriber errors
      }
    });
  }

  // Set active sector with smooth cross-fade (default 1.0s)
  public setSector(targetSector: AmbientSector, fadeDuration: number = 1.0): void {
    if (this.currentSector === targetSector && this.activeInstance) {
      return;
    }

    const previousInstance = this.activeInstance;
    this.currentSector = targetSector;
    this.notifySectorChange(targetSector);

    const ctx = audioContextManager.getContext();
    const ambientBus = audioContextManager.getAmbientBus();

    if (!ctx || !ambientBus) {
      if (previousInstance) {
        previousInstance.cleanup();
        this.activeInstance = null;
      }
      return;
    }

    const now = ctx.currentTime;
    const duration = Math.max(0.2, Math.min(3.0, fadeDuration));

    // 1. Cross-fade OUT previous soundscape
    if (previousInstance) {
      try {
        const gain = previousInstance.sectorGain.gain;
        gain.cancelScheduledValues(now);
        gain.setValueAtTime(gain.value, now);
        gain.linearRampToValueAtTime(0.0001, now + duration);

        setTimeout(() => {
          previousInstance.cleanup();
        }, duration * 1000 + 60);
      } catch {
        previousInstance.cleanup();
      }
    }

    // 2. Cross-fade IN target soundscape (if not silence)
    if (targetSector === 'silence') {
      this.activeInstance = null;
      return;
    }

    const sectorGain = ctx.createGain();
    sectorGain.gain.setValueAtTime(0.0001, now);
    sectorGain.gain.linearRampToValueAtTime(1.0, now + duration);
    sectorGain.connect(ambientBus);

    const cleanup = this.instantiateSectorAudio(ctx, sectorGain, targetSector);

    this.activeInstance = {
      sector: targetSector,
      sectorGain,
      cleanup: () => {
        try {
          cleanup();
          sectorGain.disconnect();
        } catch {
          // Suppress disconnection errors
        }
      },
    };
  }

  // Ensure audio is initialized after user gesture
  public ensureAudioStarted(initialSector: AmbientSector = 'sink'): void {
    if (!this.isAutoEngaged) {
      this.isAutoEngaged = true;
      if (this.currentSector === 'silence') {
        this.setSector(initialSector, 0.8);
      }
    }
  }

  // Instantiates the procedural synthesis graph for the specified sector
  private instantiateSectorAudio(
    ctx: AudioContext,
    destination: GainNode,
    sector: AmbientSector
  ): () => void {
    switch (sector) {
      case 'sink':
        return this.createSinkSoundscape(ctx, destination);
      case 'heights':
        return this.createHeightsSoundscape(ctx, destination);
      case 'old_town':
        return this.createOldTownSoundscape(ctx, destination);
      case 'redoubt':
        return this.createRedoubtSoundscape(ctx, destination);
      case 'scorch':
        return this.createScorchSoundscape(ctx, destination);
      case 'bar':
        return this.createBarSoundscape(ctx, destination);
      case 'silence':
      default:
        return () => {};
    }
  }

  // --- SECTOR 1: THE SINK (Submerged Sluice, Water Slosh, Foghorns) ---
  private createSinkSoundscape(ctx: AudioContext, dest: GainNode): () => void {
    const activeNodes: AudioNode[] = [];
    const timers: number[] = [];

    // Layer A: Low Submerged Pad (Detuned Sine/Triangle @ 130 Hz)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const padFilter = ctx.createBiquadFilter();
    const padGain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(130, ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(130.8, ctx.currentTime);

    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(320, ctx.currentTime);

    padGain.gain.setValueAtTime(0.12, ctx.currentTime);

    osc1.connect(padFilter);
    osc2.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(dest);

    osc1.start();
    osc2.start();
    activeNodes.push(osc1, osc2, padFilter, padGain);

    // Layer B: Water Slosh / Drips (Pink noise swept through modulated bandpass)
    const pinkBuffer = this.generatePinkNoiseBuffer(ctx, 3);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = pinkBuffer;
    noiseSource.loop = true;

    const waterFilter = ctx.createBiquadFilter();
    waterFilter.type = 'bandpass';
    waterFilter.frequency.setValueAtTime(450, ctx.currentTime);
    waterFilter.Q.setValueAtTime(2.5, ctx.currentTime);

    // LFO for water sloshing swell
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // 5s swell
    lfoGain.gain.setValueAtTime(180, ctx.currentTime);
    lfo.connect(waterFilter.frequency);
    lfo.start();

    const waterGain = ctx.createGain();
    waterGain.gain.setValueAtTime(0.14, ctx.currentTime);

    noiseSource.connect(waterFilter);
    waterFilter.connect(waterGain);
    waterGain.connect(dest);
    noiseSource.start();

    activeNodes.push(noiseSource, waterFilter, lfo, lfoGain, waterGain);

    // Layer C: Periodic Distant Foghorn (65 Hz fundamental swell every 9s)
    const triggerFoghorn = () => {
      if (ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const hornOsc = ctx.createOscillator();
      const hornGain = ctx.createGain();

      hornOsc.type = 'sawtooth';
      hornOsc.frequency.setValueAtTime(65, now);
      hornOsc.frequency.exponentialRampToValueAtTime(63.5, now + 2.5);

      const hornFilter = ctx.createBiquadFilter();
      hornFilter.type = 'lowpass';
      hornFilter.frequency.setValueAtTime(220, now);

      hornGain.gain.setValueAtTime(0.0001, now);
      hornGain.gain.linearRampToValueAtTime(0.15, now + 0.8);
      hornGain.gain.setValueAtTime(0.15, now + 1.8);
      hornGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      hornOsc.connect(hornFilter);
      hornFilter.connect(hornGain);
      hornGain.connect(dest);

      hornOsc.start(now);
      hornOsc.stop(now + 2.9);
    };

    triggerFoghorn();
    const foghornTimer = window.setInterval(triggerFoghorn, 9500);
    timers.push(foghornTimer);

    return () => {
      timers.forEach((t) => clearInterval(t));
      activeNodes.forEach((n) => {
        try {
          if ('stop' in n && typeof (n as AudioScheduledSourceNode).stop === 'function') {
            (n as AudioScheduledSourceNode).stop();
          }
          n.disconnect();
        } catch {
          // Suppress node teardown errors
        }
      });
    };
  }

  // --- SECTOR 2: THE HEIGHTS (Pulsing 55 Hz Sub-bass, Choral Hum, Corporate HVAC) ---
  private createHeightsSoundscape(ctx: AudioContext, dest: GainNode): () => void {
    const activeNodes: AudioNode[] = [];

    // Layer A: Oppressive 55 Hz Power Grid Sub-bass with LFO Amplitude Pulse
    const bassOsc1 = ctx.createOscillator();
    const bassOsc2 = ctx.createOscillator();
    const bassGain = ctx.createGain();

    bassOsc1.type = 'sine';
    bassOsc1.frequency.setValueAtTime(55, ctx.currentTime);
    bassOsc2.type = 'sine';
    bassOsc2.frequency.setValueAtTime(110, ctx.currentTime);

    const bassLfo = ctx.createOscillator();
    const bassLfoGain = ctx.createGain();
    bassLfo.frequency.setValueAtTime(0.45, ctx.currentTime); // ~2.2s pulse
    bassLfoGain.gain.setValueAtTime(0.08, ctx.currentTime);

    bassGain.gain.setValueAtTime(0.16, ctx.currentTime);
    bassLfo.connect(bassLfoGain);
    bassLfoGain.connect(bassGain.gain);

    bassOsc1.connect(bassGain);
    bassOsc2.connect(bassGain);
    bassGain.connect(dest);

    bassOsc1.start();
    bassOsc2.start();
    bassLfo.start();
    activeNodes.push(bassOsc1, bassOsc2, bassLfo, bassLfoGain, bassGain);

    // Layer B: Synthetic Choral Hum (Ethereal Triad: 220 Hz & 330 Hz with vibrato)
    const choir1 = ctx.createOscillator();
    const choir2 = ctx.createOscillator();
    const choirFilter = ctx.createBiquadFilter();
    const choirGain = ctx.createGain();

    choir1.type = 'triangle';
    choir1.frequency.setValueAtTime(220, ctx.currentTime);
    choir2.type = 'sine';
    choir2.frequency.setValueAtTime(330, ctx.currentTime);

    choirFilter.type = 'bandpass';
    choirFilter.frequency.setValueAtTime(600, ctx.currentTime);
    choirFilter.Q.setValueAtTime(3.0, ctx.currentTime);

    choirGain.gain.setValueAtTime(0.08, ctx.currentTime);

    choir1.connect(choirFilter);
    choir2.connect(choirFilter);
    choirFilter.connect(choirGain);
    choirGain.connect(dest);

    choir1.start();
    choir2.start();
    activeNodes.push(choir1, choir2, choirFilter, choirGain);

    // Layer C: Corporate HVAC Clean Hiss (Highpass filtered white noise)
    const hvacBuffer = this.generatePinkNoiseBuffer(ctx, 2);
    const hvacSource = ctx.createBufferSource();
    hvacSource.buffer = hvacBuffer;
    hvacSource.loop = true;

    const hvacFilter = ctx.createBiquadFilter();
    hvacFilter.type = 'highpass';
    hvacFilter.frequency.setValueAtTime(2400, ctx.currentTime);

    const hvacGain = ctx.createGain();
    hvacGain.gain.setValueAtTime(0.06, ctx.currentTime);

    hvacSource.connect(hvacFilter);
    hvacFilter.connect(hvacGain);
    hvacGain.connect(dest);
    hvacSource.start();

    activeNodes.push(hvacSource, hvacFilter, hvacGain);

    return () => {
      activeNodes.forEach((n) => {
        try {
          if ('stop' in n && typeof (n as AudioScheduledSourceNode).stop === 'function') {
            (n as AudioScheduledSourceNode).stop();
          }
          n.disconnect();
        } catch {
          // Suppress teardown errors
        }
      });
    };
  }

  // --- SECTOR 3: OLD TOWN (Boiler Drone, Scrap-Metal Percussion, Steam Venting) ---
  private createOldTownSoundscape(ctx: AudioContext, dest: GainNode): () => void {
    const activeNodes: AudioNode[] = [];
    const timers: number[] = [];

    // Layer A: Low Tenement Boiler Drone (76 Hz Sawtooth -> Lowpass)
    const boilerOsc = ctx.createOscillator();
    const boilerFilter = ctx.createBiquadFilter();
    const boilerGain = ctx.createGain();

    boilerOsc.type = 'sawtooth';
    boilerOsc.frequency.setValueAtTime(76, ctx.currentTime);
    boilerFilter.type = 'lowpass';
    boilerFilter.frequency.setValueAtTime(150, ctx.currentTime);

    boilerGain.gain.setValueAtTime(0.12, ctx.currentTime);

    boilerOsc.connect(boilerFilter);
    boilerFilter.connect(boilerGain);
    boilerGain.connect(dest);
    boilerOsc.start();

    activeNodes.push(boilerOsc, boilerFilter, boilerGain);

    // Layer B: Irregular Broken Scrap-Metal Clangs
    const playScrapClang = () => {
      if (ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const freqs = [720, 1180, 1640];
      const selectedFreq = freqs[Math.floor(Math.random() * freqs.length)];

      const clangOsc = ctx.createOscillator();
      const clangGain = ctx.createGain();

      clangOsc.type = 'triangle';
      clangOsc.frequency.setValueAtTime(selectedFreq, now);
      clangOsc.frequency.exponentialRampToValueAtTime(selectedFreq * 0.7, now + 0.25);

      clangGain.gain.setValueAtTime(0.09, now);
      clangGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      clangOsc.connect(clangGain);
      clangGain.connect(dest);

      clangOsc.start(now);
      clangOsc.stop(now + 0.26);
    };

    playScrapClang();
    const clangTimer = window.setInterval(playScrapClang, 2800);
    timers.push(clangTimer);

    // Layer C: Steam Pipe Hiss Venting
    const playSteamHiss = () => {
      if (ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const steamBuffer = this.generatePinkNoiseBuffer(ctx, 0.6);
      const steamSource = ctx.createBufferSource();
      steamSource.buffer = steamBuffer;

      const steamFilter = ctx.createBiquadFilter();
      steamFilter.type = 'bandpass';
      steamFilter.frequency.setValueAtTime(3200, now);
      steamFilter.Q.setValueAtTime(1.5, now);

      const steamGain = ctx.createGain();
      steamGain.gain.setValueAtTime(0.001, now);
      steamGain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      steamGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      steamSource.connect(steamFilter);
      steamFilter.connect(steamGain);
      steamGain.connect(dest);

      steamSource.start(now);
      steamSource.stop(now + 0.6);
    };

    const steamTimer = window.setInterval(playSteamHiss, 5200);
    timers.push(steamTimer);

    return () => {
      timers.forEach((t) => clearInterval(t));
      activeNodes.forEach((n) => {
        try {
          if ('stop' in n && typeof (n as AudioScheduledSourceNode).stop === 'function') {
            (n as AudioScheduledSourceNode).stop();
          }
          n.disconnect();
        } catch {
          // Suppress teardown errors
        }
      });
    };
  }

  // --- SECTOR 4: THE REDOUBT (Militaristic Snare, Radio Static, Radar Sweep) ---
  private createRedoubtSoundscape(ctx: AudioContext, dest: GainNode): () => void {
    const activeNodes: AudioNode[] = [];
    const timers: number[] = [];

    // Layer A: Encrypted Radio Static Crackle (Low level background)
    const staticBuffer = this.generatePinkNoiseBuffer(ctx, 2);
    const staticSource = ctx.createBufferSource();
    staticSource.buffer = staticBuffer;
    staticSource.loop = true;

    const staticFilter = ctx.createBiquadFilter();
    staticFilter.type = 'bandpass';
    staticFilter.frequency.setValueAtTime(1800, ctx.currentTime);
    staticFilter.Q.setValueAtTime(1.2, ctx.currentTime);

    const staticGain = ctx.createGain();
    staticGain.gain.setValueAtTime(0.05, ctx.currentTime);

    staticSource.connect(staticFilter);
    staticFilter.connect(staticGain);
    staticGain.connect(dest);
    staticSource.start();

    activeNodes.push(staticSource, staticFilter, staticGain);

    // Layer B: 4/4 Marching Snare Cadence (108 BPM = ~555ms per beat)
    let beatCount = 0;
    const playMarchBeat = () => {
      if (ctx.state === 'closed') return;
      const now = ctx.currentTime;
      beatCount = (beatCount + 1) % 4;

      // Snare hit (White noise burst + low skin thump)
      const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
      }

      const snareNoise = ctx.createBufferSource();
      snareNoise.buffer = noiseBuffer;

      const snareFilter = ctx.createBiquadFilter();
      snareFilter.type = 'highpass';
      snareFilter.frequency.setValueAtTime(900, now);

      const snareGain = ctx.createGain();
      const isAccent = beatCount === 1 || beatCount === 3;
      snareGain.gain.setValueAtTime(isAccent ? 0.12 : 0.07, now);
      snareGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      snareNoise.connect(snareFilter);
      snareFilter.connect(snareGain);
      snareGain.connect(dest);

      snareNoise.start(now);
      snareNoise.stop(now + 0.08);

      // Low drum body thump
      const drumOsc = ctx.createOscillator();
      const drumGain = ctx.createGain();
      drumOsc.type = 'sine';
      drumOsc.frequency.setValueAtTime(160, now);
      drumOsc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

      drumGain.gain.setValueAtTime(isAccent ? 0.15 : 0.08, now);
      drumGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      drumOsc.connect(drumGain);
      drumGain.connect(dest);
      drumOsc.start(now);
      drumOsc.stop(now + 0.06);

      // Layer C: Radar Sweep Ping on beat 0
      if (beatCount === 0) {
        const pingOsc = ctx.createOscillator();
        const pingGain = ctx.createGain();
        pingOsc.type = 'sine';
        pingOsc.frequency.setValueAtTime(1850, now);

        pingGain.gain.setValueAtTime(0.08, now);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        pingOsc.connect(pingGain);
        pingGain.connect(dest);
        pingOsc.start(now);
        pingOsc.stop(now + 0.41);
      }
    };

    const snareTimer = window.setInterval(playMarchBeat, 555);
    timers.push(snareTimer);

    return () => {
      timers.forEach((t) => clearInterval(t));
      activeNodes.forEach((n) => {
        try {
          if ('stop' in n && typeof (n as AudioScheduledSourceNode).stop === 'function') {
            (n as AudioScheduledSourceNode).stop();
          }
          n.disconnect();
        } catch {
          // Suppress teardown errors
        }
      });
    };
  }

  // --- SECTOR 5: THE SCORCH (Howling Desert Wind, Distorted Drone, Geiger Clicks) ---
  private createScorchSoundscape(ctx: AudioContext, dest: GainNode): () => void {
    const activeNodes: AudioNode[] = [];
    const timers: number[] = [];

    // Layer A: Howling Radioactive Wind (Swept Bandpass Noise with 0.12 Hz LFO)
    const windBuffer = this.generatePinkNoiseBuffer(ctx, 4);
    const windSource = ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(450, ctx.currentTime);
    windFilter.Q.setValueAtTime(3.5, ctx.currentTime);

    const windLfo = ctx.createOscillator();
    const windLfoGain = ctx.createGain();
    windLfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8s sweep
    windLfoGain.gain.setValueAtTime(280, ctx.currentTime);
    windLfo.connect(windFilter.frequency);
    windLfo.start();

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.18, ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(dest);
    windSource.start();

    activeNodes.push(windSource, windFilter, windLfo, windLfoGain, windGain);

    // Layer B: Distorted Analog Drone (Dual detuned sawtooth waves @ 68 Hz)
    const drone1 = ctx.createOscillator();
    const drone2 = ctx.createOscillator();
    const droneFilter = ctx.createBiquadFilter();
    const droneGain = ctx.createGain();

    drone1.type = 'sawtooth';
    drone1.frequency.setValueAtTime(68, ctx.currentTime);
    drone2.type = 'sawtooth';
    drone2.frequency.setValueAtTime(69.2, ctx.currentTime);

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(210, ctx.currentTime);

    droneGain.gain.setValueAtTime(0.1, ctx.currentTime);

    drone1.connect(droneFilter);
    drone2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(dest);

    drone1.start();
    drone2.start();
    activeNodes.push(drone1, drone2, droneFilter, droneGain);

    // Layer C: Geiger Counter Stochastic Clicks
    const triggerGeigerClick = () => {
      if (ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.005);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.005);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.006);

      // Random Poisson-like delay for next radiation click
      const nextDelay = 80 + Math.random() * 650;
      const geigerTimer = window.setTimeout(triggerGeigerClick, nextDelay);
      timers.push(geigerTimer);
    };

    triggerGeigerClick();

    return () => {
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      activeNodes.forEach((n) => {
        try {
          if ('stop' in n && typeof (n as AudioScheduledSourceNode).stop === 'function') {
            (n as AudioScheduledSourceNode).stop();
          }
          n.disconnect();
        } catch {
          // Suppress teardown errors
        }
      });
    };
  }

  // --- SECTOR 6: THE THRESHOLD BAR (Absolute Isolation, Grandfather Clock, Hearth Crackle) ---
  private createBarSoundscape(ctx: AudioContext, dest: GainNode): () => void {
    const activeNodes: AudioNode[] = [];
    const timers: number[] = [];

    // Layer A: Gentle Room Presence Warmth (48 Hz Low Sine)
    const roomOsc = ctx.createOscillator();
    const roomGain = ctx.createGain();

    roomOsc.type = 'sine';
    roomOsc.frequency.setValueAtTime(48, ctx.currentTime);
    roomGain.gain.setValueAtTime(0.04, ctx.currentTime);

    roomOsc.connect(roomGain);
    roomGain.connect(dest);
    roomOsc.start();
    activeNodes.push(roomOsc, roomGain);

    // Layer B: 1860s Grandfather Clock Rhythmic Tick-Tock (1.0s Period)
    // Tick at 0.0s, Tock at 0.5s
    let isTick = true;
    const playClockPendulum = () => {
      if (ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();

      clickOsc.type = 'triangle';
      const startFreq = isTick ? 850 : 560;
      const endFreq = isTick ? 240 : 160;

      clickOsc.frequency.setValueAtTime(startFreq, now);
      clickOsc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.035);

      clickGain.gain.setValueAtTime(0.14, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      clickOsc.connect(clickGain);
      clickGain.connect(dest);

      clickOsc.start(now);
      clickOsc.stop(now + 0.036);

      isTick = !isTick;
    };

    playClockPendulum();
    const clockTimer = window.setInterval(playClockPendulum, 500); // 500ms between tick and tock
    timers.push(clockTimer);

    // Layer C: Gentle Fireplace Hearth Crackle (Sporadic micro-bursts of high noise)
    const playHearthCrackle = () => {
      if (ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const crackleBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.015), ctx.sampleRate);
      const data = crackleBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.2));
      }

      const crackleSource = ctx.createBufferSource();
      crackleSource.buffer = crackleBuffer;

      const crackleFilter = ctx.createBiquadFilter();
      crackleFilter.type = 'highpass';
      crackleFilter.frequency.setValueAtTime(2200, now);

      const crackleGain = ctx.createGain();
      crackleGain.gain.setValueAtTime(0.04 + Math.random() * 0.06, now);
      crackleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      crackleSource.connect(crackleFilter);
      crackleFilter.connect(crackleGain);
      crackleGain.connect(dest);

      crackleSource.start(now);
      crackleSource.stop(now + 0.016);

      const nextCrackle = 90 + Math.random() * 280;
      const hearthTimer = window.setTimeout(playHearthCrackle, nextCrackle);
      timers.push(hearthTimer);
    };

    playHearthCrackle();

    return () => {
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      activeNodes.forEach((n) => {
        try {
          if ('stop' in n && typeof (n as AudioScheduledSourceNode).stop === 'function') {
            (n as AudioScheduledSourceNode).stop();
          }
          n.disconnect();
        } catch {
          // Suppress teardown errors
        }
      });
    };
  }

  // --- Helper: Pure Pink Noise Generator (Kellet filter approximation) ---
  private generatePinkNoiseBuffer(ctx: AudioContext, durationSeconds: number): AudioBuffer {
    const bufferSize = Math.floor(ctx.sampleRate * durationSeconds);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.11; // scale to safe range
    }

    return buffer;
  }
}

export const ambientAudioEngine = new DiegeticAmbientAudioEngine();
