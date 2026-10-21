import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './store';
import { 
  THE_THREE_KEYS, 
  getVaultZeroGateStatus, 
  canBypassCheckpoint, 
  discoverKey 
} from './keysEngine';

describe('The Three Keys Progression System Engine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('contains canonical definitions for all Three Keys (Threshold, Skeleton, Ghost)', () => {
    expect(THE_THREE_KEYS.THRESHOLD_KEY).toBeDefined();
    expect(THE_THREE_KEYS.THRESHOLD_KEY.type).toBe('DIMENSIONAL');

    expect(THE_THREE_KEYS.SKELETON_KEY).toBeDefined();
    expect(THE_THREE_KEYS.SKELETON_KEY.type).toBe('MECHANICAL');

    expect(THE_THREE_KEYS.GHOST_KEY).toBeDefined();
    expect(THE_THREE_KEYS.GHOST_KEY.type).toBe('CRYPTOGRAPHIC');
  });

  it('evaluates Vault Zero gate status accurately across key acquisition progression', () => {
    // Initial state: only THRESHOLD_KEY
    const initialStatus = getVaultZeroGateStatus(['THRESHOLD_KEY']);
    expect(initialStatus.unlockedCount).toBe(1);
    expect(initialStatus.allUnlocked).toBe(false);
    expect(initialStatus.thresholdKey.status).toBe('UNLOCKED');
    expect(initialStatus.skeletonKey.status).toBe('SEALED');
    expect(initialStatus.ghostKey.status).toBe('SEALED');
    expect(initialStatus.summary).toContain('Missing: Skeleton Key, Ghost Key');

    // Acquire Skeleton Key
    const midgameStatus = getVaultZeroGateStatus(['THRESHOLD_KEY', 'SKELETON_KEY']);
    expect(midgameStatus.unlockedCount).toBe(2);
    expect(midgameStatus.allUnlocked).toBe(false);
    expect(midgameStatus.skeletonKey.status).toBe('UNLOCKED');

    // All three keys acquired
    const endgameStatus = getVaultZeroGateStatus(['THRESHOLD_KEY', 'SKELETON_KEY', 'GHOST_KEY']);
    expect(endgameStatus.unlockedCount).toBe(3);
    expect(endgameStatus.allUnlocked).toBe(true);
    expect(endgameStatus.summary).toContain('ALL THREE KEYS SECURED');
  });

  it('bypasses Redoubt military checkpoints with Skeleton Key', () => {
    const withoutKey = canBypassCheckpoint('redoubt', ['THRESHOLD_KEY']);
    expect(withoutKey.canBypass).toBe(false);

    const withKey = canBypassCheckpoint('R-01', ['THRESHOLD_KEY', 'SKELETON_KEY']);
    expect(withKey.canBypass).toBe(true);
    expect(withKey.keyUsed).toBe('SKELETON_KEY');
    expect(withKey.message).toContain('Master Skeleton Key');
  });

  it('bypasses Heights corporate biometric ICE checkpoints with Ghost Key', () => {
    const withoutKey = canBypassCheckpoint('heights', ['THRESHOLD_KEY']);
    expect(withoutKey.canBypass).toBe(false);

    const withKey = canBypassCheckpoint('H-01', ['THRESHOLD_KEY', 'GHOST_KEY']);
    expect(withKey.canBypass).toBe(true);
    expect(withKey.keyUsed).toBe('GHOST_KEY');
    expect(withKey.message).toContain('Quantum Ghost Key');
  });

  it('discovers new key, adds to agency inventory, and upgrades agency rank', () => {
    const initialKeys = useGameStore.getState().agency.keys;
    expect(initialKeys).toEqual(['THRESHOLD_KEY']);
    expect(useGameStore.getState().agency.level).toBe(1);

    // Discover Skeleton Key
    const result1 = discoverKey('SKELETON_KEY');
    expect(result1.success).toBe(true);
    expect(result1.message).toContain('MASTER SKELETON KEY');

    const state1 = useGameStore.getState();
    expect(state1.agency.keys).toContain('SKELETON_KEY');
    expect(state1.agency.level).toBe(2);

    // Discover Ghost Key
    const result2 = discoverKey('GHOST_KEY');
    expect(result2.success).toBe(true);

    const state2 = useGameStore.getState();
    expect(state2.agency.keys).toContain('GHOST_KEY');
    expect(state2.agency.level).toBe(3);

    // Duplicate discovery rejected
    const dup = discoverKey('GHOST_KEY');
    expect(dup.success).toBe(false);
  });
});
