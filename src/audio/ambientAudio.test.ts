import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { audioContextManager } from './audioContext';
import { ambientAudioEngine, AmbientSector, SECTOR_SOUNDSCAPES } from './ambientAudioEngine';
import { soundFx } from './soundFx';

// Lightweight Web Audio API mock for Vitest / Node environment
class MockAudioNode {
  public connect = vi.fn().mockReturnValue(this);
  public disconnect = vi.fn();
}

class MockAudioParam {
  public value: number = 1.0;
  public setValueAtTime = vi.fn((val: number) => { this.value = val; });
  public linearRampToValueAtTime = vi.fn((val: number) => { this.value = val; });
  public exponentialRampToValueAtTime = vi.fn((val: number) => { this.value = val; });
  public cancelScheduledValues = vi.fn();
}

class MockGainNode extends MockAudioNode {
  public gain = new MockAudioParam();
}

class MockOscillatorNode extends MockAudioNode {
  public type: string = 'sine';
  public frequency = new MockAudioParam();
  public start = vi.fn();
  public stop = vi.fn();
}

class MockBiquadFilterNode extends MockAudioNode {
  public type: string = 'lowpass';
  public frequency = new MockAudioParam();
  public Q = new MockAudioParam();
}

class MockBufferSourceNode extends MockAudioNode {
  public buffer: unknown = null;
  public loop: boolean = false;
  public start = vi.fn();
  public stop = vi.fn();
}

class MockAudioBuffer {
  public duration: number;
  public sampleRate: number;
  public numberOfChannels: number;
  private channelData: Float32Array;

  constructor(numberOfChannels: number, length: number, sampleRate: number) {
    this.numberOfChannels = numberOfChannels;
    this.duration = length / sampleRate;
    this.sampleRate = sampleRate;
    this.channelData = new Float32Array(length);
  }

  public getChannelData() {
    return this.channelData;
  }
}

class MockAudioContext {
  public currentTime: number = 10.0;
  public state: string = 'running';
  public sampleRate: number = 44100;
  public destination = new MockAudioNode();

  public resume = vi.fn().mockResolvedValue(undefined);
  public close = vi.fn().mockResolvedValue(undefined);

  public createGain = vi.fn(() => new MockGainNode());
  public createOscillator = vi.fn(() => new MockOscillatorNode());
  public createBiquadFilter = vi.fn(() => new MockBiquadFilterNode());
  public createBufferSource = vi.fn(() => new MockBufferSourceNode());
  public createBuffer = vi.fn((channels: number, length: number, sampleRate: number) => 
    new MockAudioBuffer(channels, length, sampleRate)
  );
}

describe('Audio Context Manager & Bus Architecture', () => {
  let mockCtx: MockAudioContext;

  beforeEach(() => {
    mockCtx = new MockAudioContext();
    audioContextManager.setContextForTesting(mockCtx as unknown as AudioContext);
    audioContextManager.setMuted(false);
    audioContextManager.setMasterVolume(0.8);
    audioContextManager.setAmbientVolume(0.6);
    audioContextManager.setSfxVolume(0.8);
  });

  afterEach(() => {
    audioContextManager.setContextForTesting(null);
  });

  it('initializes with default audio volume levels', () => {
    const settings = audioContextManager.getSettings();
    expect(settings.masterVolume).toBe(0.8);
    expect(settings.ambientVolume).toBe(0.6);
    expect(settings.sfxVolume).toBe(0.8);
    expect(settings.isMuted).toBe(false);
  });

  it('sets and clamps master volume between 0.0 and 1.0', () => {
    audioContextManager.setMasterVolume(1.5);
    expect(audioContextManager.getSettings().masterVolume).toBe(1.0);

    audioContextManager.setMasterVolume(-0.5);
    expect(audioContextManager.getSettings().masterVolume).toBe(0.0);

    audioContextManager.setMasterVolume(0.45);
    expect(audioContextManager.getSettings().masterVolume).toBe(0.45);
  });

  it('sets and clamps ambient and sfx volumes', () => {
    audioContextManager.setAmbientVolume(0.35);
    expect(audioContextManager.getSettings().ambientVolume).toBe(0.35);

    audioContextManager.setSfxVolume(0.9);
    expect(audioContextManager.getSettings().sfxVolume).toBe(0.9);
  });

  it('toggles mute and notifies subscribers', () => {
    const listener = vi.fn();
    const unsub = audioContextManager.subscribe(listener);

    const isMutedNow = audioContextManager.toggleMute();
    expect(isMutedNow).toBe(true);
    expect(audioContextManager.getSettings().isMuted).toBe(true);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ isMuted: true }));

    audioContextManager.toggleMute();
    expect(audioContextManager.getSettings().isMuted).toBe(false);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ isMuted: false }));

    unsub();
  });
});

describe('Diegetic Ambient Audio Engine & Cross-fading', () => {
  let mockCtx: MockAudioContext;

  beforeEach(() => {
    mockCtx = new MockAudioContext();
    audioContextManager.setContextForTesting(mockCtx as unknown as AudioContext);
  });

  afterEach(() => {
    ambientAudioEngine.setSector('silence', 0.1);
    audioContextManager.setContextForTesting(null);
  });

  it('starts at silence or changes to target sector', () => {
    const listener = vi.fn();
    const unsub = ambientAudioEngine.subscribeSector(listener);

    ambientAudioEngine.setSector('sink', 0.8);
    expect(ambientAudioEngine.getCurrentSector()).toBe('sink');
    expect(listener).toHaveBeenCalledWith('sink');

    unsub();
  });

  it('contains soundscape metadata for all 6 sectors', () => {
    const sectors: AmbientSector[] = ['sink', 'heights', 'old_town', 'redoubt', 'scorch', 'bar'];
    sectors.forEach((sec) => {
      const meta = SECTOR_SOUNDSCAPES[sec];
      expect(meta).toBeDefined();
      expect(meta.name.length).toBeGreaterThan(0);
      expect(meta.tagline.length).toBeGreaterThan(0);
    });
  });

  it('cross-fades smoothly between sectors and creates audio nodes', () => {
    ambientAudioEngine.setSector('sink', 0.5);
    expect(mockCtx.createGain).toHaveBeenCalled();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
    expect(mockCtx.createBiquadFilter).toHaveBeenCalled();

    // Crossfade to The Heights
    ambientAudioEngine.setSector('heights', 0.5);
    expect(ambientAudioEngine.getCurrentSector()).toBe('heights');

    // Crossfade to Old Town
    ambientAudioEngine.setSector('old_town', 0.5);
    expect(ambientAudioEngine.getCurrentSector()).toBe('old_town');

    // Crossfade to The Redoubt
    ambientAudioEngine.setSector('redoubt', 0.5);
    expect(ambientAudioEngine.getCurrentSector()).toBe('redoubt');

    // Crossfade to The Scorch
    ambientAudioEngine.setSector('scorch', 0.5);
    expect(ambientAudioEngine.getCurrentSector()).toBe('scorch');

    // Crossfade to The Threshold Bar (Sanctuary Isolation)
    ambientAudioEngine.setSector('bar', 0.5);
    expect(ambientAudioEngine.getCurrentSector()).toBe('bar');
  });

  it('does not re-instantiate if transitioning to the exact same active sector', () => {
    ambientAudioEngine.setSector('bar', 0.5);
    const callCount = mockCtx.createGain.mock.calls.length;

    // Call again with same sector
    ambientAudioEngine.setSector('bar', 0.5);
    expect(mockCtx.createGain.mock.calls.length).toBe(callCount);
  });

  it('transitions to silence and clears active soundscape', () => {
    ambientAudioEngine.setSector('sink', 0.5);
    expect(ambientAudioEngine.getCurrentSector()).toBe('sink');

    ambientAudioEngine.setSector('silence', 0.5);
    expect(ambientAudioEngine.getCurrentSector()).toBe('silence');
  });
});

describe('Tactile Foley Sound Effects Engine', () => {
  let mockCtx: MockAudioContext;

  beforeEach(() => {
    mockCtx = new MockAudioContext();
    audioContextManager.setContextForTesting(mockCtx as unknown as AudioContext);
  });

  afterEach(() => {
    audioContextManager.setContextForTesting(null);
  });

  it('plays tactile paper card draw without error', () => {
    expect(() => soundFx.playCardDraw()).not.toThrow();
    expect(mockCtx.createBufferSource).toHaveBeenCalled();
    expect(mockCtx.createBiquadFilter).toHaveBeenCalled();
  });

  it('plays vintage mechanical keystroke clack without error', () => {
    expect(() => soundFx.playTerminalKeystroke()).not.toThrow();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
    expect(mockCtx.createGain).toHaveBeenCalled();
  });

  it('plays existing sound effects (relay click, dice roll, boot, glitch)', () => {
    expect(() => soundFx.playClick()).not.toThrow();
    expect(() => soundFx.playDiceRoll()).not.toThrow();
    expect(() => soundFx.playBoot()).not.toThrow();
    expect(() => soundFx.playGlitch()).not.toThrow();
    expect(() => soundFx.playKeyUnlock()).not.toThrow();
    expect(() => soundFx.playPourWhiskey()).not.toThrow();
    expect(() => soundFx.playWoodCarving()).not.toThrow();
  });

  it('synchronizes muting between soundFx and audioContextManager', () => {
    soundFx.setMuted(true);
    expect(soundFx.getMuted()).toBe(true);
    expect(audioContextManager.getSettings().isMuted).toBe(true);

    soundFx.setMuted(false);
    expect(soundFx.getMuted()).toBe(false);
    expect(audioContextManager.getSettings().isMuted).toBe(false);
  });
});
