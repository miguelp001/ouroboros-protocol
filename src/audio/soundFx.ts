// Diegetic Web Audio Synthesizer for Ouroboros Protocol
// Generates authentic CRT hums, tactile relay clicks, static bursts, and dice clatters without external mp3 dependencies.

class SlateAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Tactile Slate Mechanical Click (Physical Relay Switch)
  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  // CRT Screen Boot / Channel Switch Chime
  public playBoot() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  // Miss / Interrupt Glitch Burst (Dial-up & Radio Static)
  public playGlitch() {
    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.18;
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
    gain.connect(ctx.destination);

    noise.start();
  }

  // Physical Dice Clatter on Oak Table followed by Impact
  public playDiceRoll() {
    const ctx = this.getContext();
    if (!ctx) return;

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
      gain.connect(ctx.destination);

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
    finalGain.connect(ctx.destination);

    finalOsc.start(now + 0.22);
    finalOsc.stop(now + 0.35);
  }

  // Warning Siren / Klaxon Pulse when a Faction Front or Crisis triggers
  public playWarningAlarm() {
    const ctx = this.getContext();
    if (!ctx) return;

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
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.18);
    });
  }

  // Emergency Extraction Protocol Audio: High-frequency telemetry burst followed by deep dimensional snap
  public playEmergencyExtraction() {
    const ctx = this.getContext();
    if (!ctx) return;

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
    chirpGain.connect(ctx.destination);
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
    subGain.connect(ctx.destination);
    sub.start(now + 0.08);
    sub.stop(now + 0.5);
  }

  // Flatline & Game Over Tone: Long eerie sine flatline with low dissonance
  public playFlatline() {
    const ctx = this.getContext();
    if (!ctx) return;

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
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.8);
  }

  // Resonant Crystal Glass Clink for Taproom Toasts
  public playGlassClink() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2450, now);
    osc.frequency.exponentialRampToValueAtTime(2280, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Blade Carving into Aged Mahogany Wood
  public playWoodCarving() {
    const ctx = this.getContext();
    if (!ctx) return;

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
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.07);
    });
  }

  // Grandfather Clock Pendulum Tick / Tock
  public playClockTick(isTock: boolean = false) {
    const ctx = this.getContext();
    if (!ctx) return;

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
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Pouring Amber Rye Whiskey into Heavy Cut Glass
  public playPourWhiskey() {
    const ctx = this.getContext();
    if (!ctx) return;

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
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.04);
    });

    // Glass clink finish
    setTimeout(() => {
      this.playGlassClink();
    }, 280);
  }
}

export const soundFx = new SlateAudioEngine();
