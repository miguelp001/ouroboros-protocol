// The Three Keys Progression Engine (Master GDD Section 6.2)
// Manages Threshold Key (Prologue/Sanctuary), Skeleton Key (Midgame/Mechanical),
// Ghost Key (Late Game/Cryptographic), checkpoint bypasses, and the Vault Zero Triple-Lock Gate.

import { useGameStore } from './store';
import { soundFx } from '../audio/soundFx';

export type KeyId = 'THRESHOLD_KEY' | 'SKELETON_KEY' | 'GHOST_KEY';

export interface KeyDefinition {
  id: KeyId;
  name: string;
  code: string;
  type: 'DIMENSIONAL' | 'MECHANICAL' | 'CRYPTOGRAPHIC';
  material: string;
  color: string;
  description: string;
  lore: string;
  passivePerks: string[];
  unlockedCapabilities: string[];
  vaultLockRole: string;
}

export const THE_THREE_KEYS: Record<KeyId, KeyDefinition> = {
  THRESHOLD_KEY: {
    id: 'THRESHOLD_KEY',
    name: 'The Threshold Key',
    code: 'KEY-01 // ANOMALOUS',
    type: 'DIMENSIONAL',
    material: 'Forged 1860s Wrought Iron',
    color: '#facc15', // Amber gold
    description: 'Heavy wrought iron skeleton key, cold to the touch. Slips into any lock to tear open an extraction doorway into the 1860s Threshold Bar from anywhere in the world.',
    lore: 'Discovered in flooded Sector Zero clutched by a dead operative. Unlocks impossible dimensional sanctuary.',
    passivePerks: [
      'Universal emergency evacuation to The Threshold Bar from any world node without consuming travel shifts.',
      'Emergency extraction tether: vents Agent 0 on fatal trauma, preventing permanent character death.',
    ],
    unlockedCapabilities: [
      'Off-grid Taproom Sanctuary access',
      'Vault Zero Lock #1: Dimensional Substrate Anchor',
    ],
    vaultLockRole: 'Substrate Anchor: Pierces through non-euclidean spatial distortion to stabilize Vault Zero\'s true coordinate.',
  },
  SKELETON_KEY: {
    id: 'SKELETON_KEY',
    name: 'The Master Skeleton Key',
    code: 'KEY-02 // PHYSICAL',
    type: 'MECHANICAL',
    material: 'Tungsten-Titanium Alloy with Fluid Tumblers',
    color: '#a1a1aa', // Zinc Grey / Steel
    description: 'Precision-milled mechanical master key with adaptive hydraulic tumblers that mirror any physical cylinder, deadbolt, or reinforced blast bulkhead.',
    lore: 'Recovered from the depths of the Dead Iron Yard or Redoubt Armory. Cracks physical locks without triggering alarm circuits.',
    passivePerks: [
      'Bypasses Redoubt Line F military checkpoints without Force/Scrap checks or passage bribes.',
      'Unlocks sealed underground freight containers (+50 Chip Creds / ballistic upgrade caches).',
    ],
    unlockedCapabilities: [
      'Line F armored perimeter bypass',
      'Vault Zero Lock #2: Triple-Hardened Tungsten Blast Tumbler',
    ],
    vaultLockRole: 'Blast Tumbler Override: Depresses the counter-weighted mechanical deadbolts sealing the inner vault gates.',
  },
  GHOST_KEY: {
    id: 'GHOST_KEY',
    name: 'The Quantum Ghost Key',
    code: 'KEY-03 // DIGITAL',
    type: 'CRYPTOGRAPHIC',
    material: 'Superconducting Optical Cryo-Crystal',
    color: '#38bdf8', // Cyan Glow
    description: 'An impossible optical cryo-drive pulsing with superconducting quantum qubits. Slices corporate biometric scanners, Apex ICE megastructures, and encrypted relays like warm wire through cold tallow.',
    lore: 'The holy grail of under-city signal slicers. Slices the apex encryption layers protecting pre-collapse black sites.',
    passivePerks: [
      'Bypasses high-tier Apex Concourse biometric checkpoints (H-01, H-02, H-03) without heat penalties or credit fees.',
      'Decodes locked anomaly data terminals (+40 Digital Creds per terminal).',
    ],
    unlockedCapabilities: [
      'Line A biometric ICE bypass',
      'Vault Zero Lock #3: Cryo-Founder Biometric Quantum ICE Firewall',
    ],
    vaultLockRole: 'Quantum ICE Slicer: Nullifies the biometric cryogenic security handshake guarding the Cryo-Founder.',
  },
};

export interface VaultZeroLockState {
  thresholdKey: { present: boolean; status: 'UNLOCKED' | 'SEALED'; label: string };
  skeletonKey: { present: boolean; status: 'UNLOCKED' | 'SEALED'; label: string };
  ghostKey: { present: boolean; status: 'UNLOCKED' | 'SEALED'; label: string };
  allUnlocked: boolean;
  unlockedCount: number;
  summary: string;
}

/**
 * Returns the live lock status of the Vault Zero Triple-Lock Gate at Terminus Zero (X-03).
 */
export function getVaultZeroGateStatus(playerKeys: string[]): VaultZeroLockState {
  const hasThreshold = playerKeys.includes('THRESHOLD_KEY');
  const hasSkeleton = playerKeys.includes('SKELETON_KEY');
  const hasGhost = playerKeys.includes('GHOST_KEY');

  const unlockedCount = (hasThreshold ? 1 : 0) + (hasSkeleton ? 1 : 0) + (hasGhost ? 1 : 0);
  const allUnlocked = unlockedCount === 3;

  let summary = '';
  if (allUnlocked) {
    summary = 'ALL THREE KEYS SECURED. Vault Zero blast gate unlocked. The Cryo-Founder Sarcophagus is accessible at Terminus Zero (X-03).';
  } else {
    const missing: string[] = [];
    if (!hasThreshold) missing.push('Threshold Key');
    if (!hasSkeleton) missing.push('Skeleton Key');
    if (!hasGhost) missing.push('Ghost Key');
    summary = `Vault Zero remains sealed (${unlockedCount}/3 locks disengaged). Missing: ${missing.join(', ')}.`;
  }

  return {
    thresholdKey: {
      present: hasThreshold,
      status: hasThreshold ? 'UNLOCKED' : 'SEALED',
      label: 'Lock 1 // Dimensional Substrate Anchor',
    },
    skeletonKey: {
      present: hasSkeleton,
      status: hasSkeleton ? 'UNLOCKED' : 'SEALED',
      label: 'Lock 2 // Mechanical Blast Tumbler',
    },
    ghostKey: {
      present: hasGhost,
      status: hasGhost ? 'UNLOCKED' : 'SEALED',
      label: 'Lock 3 // Quantum Cryptographic ICE',
    },
    allUnlocked,
    unlockedCount,
    summary,
  };
}

/**
 * Evaluates whether player keys bypass a specific district or checkpoint impediment.
 */
export function canBypassCheckpoint(
  sectorOrNode: string,
  playerKeys: string[]
): { canBypass: boolean; keyUsed?: KeyId; message?: string } {
  // Line F / Redoubt armored checkpoints
  if (sectorOrNode === 'redoubt' || sectorOrNode.startsWith('R-')) {
    if (playerKeys.includes('SKELETON_KEY')) {
      return {
        canBypass: true,
        keyUsed: 'SKELETON_KEY',
        message: 'The Master Skeleton Key seamlessly depressurized the Redoubt blast barrier. Checkpoint bypassed without force checks.',
      };
    }
  }

  // Line A / Heights biometric checkpoints
  if (sectorOrNode === 'heights' || sectorOrNode.startsWith('H-')) {
    if (playerKeys.includes('GHOST_KEY')) {
      return {
        canBypass: true,
        keyUsed: 'GHOST_KEY',
        message: 'The Quantum Ghost Key spoofed corporate biometric ICE scanners. Concourse entered without heat penalty.',
      };
    }
  }

  return { canBypass: false };
}

/**
 * Discovers and binds one of the Three Keys to the Agency.
 */
export function discoverKey(keyId: KeyId): { success: boolean; message: string; key?: KeyDefinition } {
  const store = useGameStore.getState();
  const currentKeys = store.agency.keys;

  if (currentKeys.includes(keyId)) {
    return { success: false, message: `Key ${keyId} is already secured in Agency inventory.` };
  }

  const keyDef = THE_THREE_KEYS[keyId];
  if (!keyDef) {
    return { success: false, message: 'Unknown key identifier.' };
  }

  // Add key to store and upgrade Agency rank
  const updatedKeys = [...currentKeys, keyId];
  const newLevel = updatedKeys.length >= 3 ? 3 : updatedKeys.length === 2 ? 2 : 1;
  useGameStore.setState({
    agency: {
      level: newLevel as 1 | 2 | 3 | 4,
      keys: updatedKeys,
    },
  });

  soundFx.playKeyUnlock();

  return {
    success: true,
    key: keyDef,
    message: `DISCOVERED ${keyDef.name.toUpperCase()}! ${keyDef.description} Agency elevated to Rank ${newLevel}.`,
  };
}
