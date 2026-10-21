// Diegetic Web Audio Synthesizer for Ouroboros Protocol
// Generates authentic CRT hums, tactile relay clicks, static bursts, card draws,
// terminal keystrokes, and dice clatters without external mp3 dependencies.

import { audioContextManager } from './audioContext';

class SlateAudioEngine {
  private getContext(): AudioContext | null {
    return audioContextManager.getContext();
  }

  private getDestination(ctx: AudioContext): AudioNode {
    return audioContextManager.getSfxBus() ?? ctx.destination;
  }

  public setMuted(muted: boolean) {
    audioContextManager.setMuted(muted);
  }

  public getMuted(): boolean {
    return audioContextManager.getSettings().isMuted;
  }

  // Tactile Slate Mechanical Click (Physical Relay Switch)
  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  // Tactile Paper Card Slide / Draw from Deck
  public playCardDraw() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);
    const now = ctx.currentTime;

    // Layer 1: Friction noise slide
    const bufferSize = Math.floor(ctx.sampleRate * 0.09);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(650, now + 0.09);
    filter.Q.setValueAtTime(2.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now);

    // Layer 2: Subtle paper snap
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(540, now + 0.04);
    snapOsc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

    snapGain.gain.setValueAtTime(0.1, now + 0.04);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    snapOsc.connect(snapGain);
    snapGain.connect(dest);
    snapOsc.start(now + 0.04);
    snapOsc.stop(now + 0.08);
  }

  // Industrial Vintage Mechanical Keyboard Keystroke (Cherry MX Black / IBM Beam Spring style)
  public playTerminalKeystroke() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);
    const now = ctx.currentTime;

    // 1. High tactile strike click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(2400, now);
    clickOsc.frequency.exponentialRampToValueAtTime(400, now + 0.015);

    clickGain.gain.setValueAtTime(0.15, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    clickOsc.connect(clickGain);
    clickGain.connect(dest);
    clickOsc.start(now);
    clickOsc.stop(now + 0.015);

    // 2. Plastic bottom-out body resonance
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(320, now + 0.005);
    thudOsc.frequency.exponentialRampToValueAtTime(80, now + 0.035);

    thudGain.gain.setValueAtTime(0.12, now + 0.005);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    thudOsc.connect(thudGain);
    thudGain.connect(dest);
    thudOsc.start(now + 0.005);
    thudOsc.stop(now + 0.035);
  }

  // CRT Screen Boot / Channel Switch Chime
  public playBoot() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  // Miss / Interrupt Glitch Burst (Dial-up & Radio Static)
  public playGlitch() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);

    const bufferSize = Math.floor(ctx.sampleRate * 0.18);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start();
  }

  // Physical Dice Clatter on Oak Table followed by Impact
  public playDiceRoll() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);

    const now = ctx.currentTime;
    // Series of 3 quick wood clatters
    [0, 0.06, 0.13].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(180 + idx * 45, now + offset);
      osc.frequency.exponentialRampToValueAtTime(40, now + offset + 0.05);

      gain.gain.setValueAtTime(0.15 - idx * 0.03, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now + offset);
      osc.stop(now + offset + 0.05);
    });

    // Final heavy table impact
    const finalOsc = ctx.createOscillator();
    const finalGain = ctx.createGain();

    finalOsc.type = 'triangle';
    finalOsc.frequency.setValueAtTime(95, now + 0.22);
    finalOsc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

    finalGain.gain.setValueAtTime(0.3, now + 0.22);
    finalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    finalOsc.connect(finalGain);
    finalGain.connect(dest);

    finalOsc.start(now + 0.22);
    finalOsc.stop(now + 0.35);
  }

  // Warning Siren / Klaxon Pulse when a Faction Front or Crisis triggers
  public playWarningAlarm() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);

    const now = ctx.currentTime;
    [0, 0.22].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now + offset);
      osc.frequency.exponentialRampToValueAtTime(260, now + offset + 0.18);

      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.18);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now + offset);
      osc.stop(now + offset + 0.18);
    });
  }

  // Emergency Extraction Protocol Audio: High-frequency telemetry burst followed by deep dimensional snap
  public playEmergencyExtraction() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);
    const now = ctx.currentTime;
    
    // Telemetry ping surge
    const chirp = ctx.createOscillator();
    const chirpGain = ctx.createGain();
    chirp.type = 'sawtooth';
    chirp.frequency.setValueAtTime(2200, now);
    chirp.frequency.exponentialRampToValueAtTime(110, now + 0.25);

    chirpGain.gain.setValueAtTime(0.3, now);
    chirpGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    chirp.connect(chirpGain);
    chirpGain.connect(dest);
    chirp.start(now);
    chirp.stop(now + 0.25);

    // Deep sub-bass dimensional implosion
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(90, now + 0.08);
    sub.frequency.exponentialRampToValueAtTime(25, now + 0.5);

    subGain.gain.setValueAtTime(0.4, now + 0.08);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    sub.connect(subGain);
    subGain.connect(dest);
    sub.start(now + 0.08);
    sub.stop(now + 0.5);
  }

  // Flatline & Game Over Tone: Long eerie sine flatline with low dissonance
  public playFlatline() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.setValueAtTime(740, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(120, now + 1.8);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.setValueAtTime(0.25, now + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 1.8);
  }

  // Resonant Crystal Glass Clink for Taproom Toasts
  public playGlassClink() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2450, now);
    osc.frequency.exponentialRampToValueAtTime(2280, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Blade Carving into Aged Mahogany Wood
  public playWoodCarving() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);
    const now = ctx.currentTime;

    [0, 0.08, 0.16].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260 + offset * 80, now + offset);
      osc.frequency.exponentialRampToValueAtTime(110, now + offset + 0.07);

      gain.gain.setValueAtTime(0.12, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now + offset);
      osc.stop(now + offset + 0.07);
    });
  }

  // Grandfather Clock Pendulum Tick / Tock
  public playClockTick(isTock: boolean = false) {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const startFreq = isTock ? 240 : 340;
    const endFreq = isTock ? 90 : 130;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Pouring Amber Rye Whiskey into Heavy Cut Glass
  public playPourWhiskey() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);
    const now = ctx.currentTime;

    // Trickle drops
    [0, 0.05, 0.11, 0.17, 0.23].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650 + idx * 80, now + offset);
      osc.frequency.exponentialRampToValueAtTime(320, now + offset + 0.04);

      gain.gain.setValueAtTime(0.09, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now + offset);
      osc.stop(now + offset + 0.04);
    });

    // Glass clink finish
    setTimeout(() => {
      this.playGlassClink();
    }, 280);
  }

  // Anomaly Hum: Dissonant vibrating sub-space frequency
  public playAnomalyHum() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.linearRampToValueAtTime(560, now + 0.15);
    osc.frequency.linearRampToValueAtTime(520, now + 0.3);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Key Unlock Chime: Heavy metallic tumbler rotation followed by harmonic chime
  public playKeyUnlock() {
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getDestination(ctx);
    const now = ctx.currentTime;
    
    // Mechanical tumbler click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(620, now);
    clickOsc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

    clickGain.gain.setValueAtTime(0.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    clickOsc.connect(clickGain);
    clickGain.connect(dest);
    clickOsc.start(now);
    clickOsc.stop(now + 0.06);

    // Harmonic chime (fundamental + fifth)
    [880, 1320].forEach((freq) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, now + 0.07);
      chimeOsc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.6);

      chimeGain.gain.setValueAtTime(0.15, now + 0.07);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(dest);

      chimeOsc.start(now + 0.07);
      chimeOsc.stop(now + 0.6);
    });
  }
}

export const soundFx = new SlateAudioEngine();
