// Post-Game Director Mode Engine (Master GDD Phase 24)
// Provides sandbox controls, multi-cell autonomous squad deployments across subway nodes,
// live parameter tuning (hostility, faction escalation, anomaly density), and quality debugging.

import { useGameStore } from './store';
import { soundFx } from '../audio/soundFx';

export type CellMissionType = 'IDLE' | 'PATROL' | 'SALVAGE' | 'SUPPRESS_HEAT' | 'COUNTER_INTEL';

export interface AutonomousCell {
  id: string;
  name: string;
  code: string;
  leaderOperativeId: string | null;
  wingOperativeId: string | null;
  assignedNodeId: string | null;
  missionType: CellMissionType;
  status: 'STANDBY' | 'DEPLOYED' | 'ENGAGED';
  efficiencyRating: number; // 0 to 100%
  lastTelemetryLog: string;
}

export interface DirectorSandboxConfig {
  factionClockMultiplier: number; // 1x, 2x, 3x
  crisisFrequencyModifier: number; // -1 (low), 0 (normal), +1 (high)
  unlimitedReserves: boolean;
  godModeOperatives: boolean;
}

export interface CellExecutionOutcome {
  cellId: string;
  cellName: string;
  missionType: CellMissionType;
  credsEarned: { chip: number; digital: number };
  heatReduced: number;
  factionDelayed: string | null;
  telemetryLog: string;
}

export const INITIAL_CELLS: AutonomousCell[] = [
  {
    id: 'cell_alpha',
    name: 'Cell Alpha',
    code: 'CELL-α // VANGUARD',
    leaderOperativeId: null,
    wingOperativeId: null,
    assignedNodeId: null,
    missionType: 'IDLE',
    status: 'STANDBY',
    efficiencyRating: 100,
    lastTelemetryLog: 'Awaiting deployment coordinates and operative assignments.',
  },
  {
    id: 'cell_bravo',
    name: 'Cell Bravo',
    code: 'CELL-β // GHOST-SWEEP',
    leaderOperativeId: null,
    wingOperativeId: null,
    assignedNodeId: null,
    missionType: 'IDLE',
    status: 'STANDBY',
    efficiencyRating: 100,
    lastTelemetryLog: 'Awaiting deployment coordinates and operative assignments.',
  },
  {
    id: 'cell_charlie',
    name: 'Cell Charlie',
    code: 'CELL-γ // HEAVY-SALVAGE',
    leaderOperativeId: null,
    wingOperativeId: null,
    assignedNodeId: null,
    missionType: 'IDLE',
    status: 'STANDBY',
    efficiencyRating: 100,
    lastTelemetryLog: 'Awaiting deployment coordinates and operative assignments.',
  },
];

class DirectorEngine {
  private cells: AutonomousCell[] = INITIAL_CELLS.map((c) => ({ ...c }));
  private sandboxConfig: DirectorSandboxConfig = {
    factionClockMultiplier: 1,
    crisisFrequencyModifier: 0,
    unlimitedReserves: false,
    godModeOperatives: false,
  };

  public getCells(): AutonomousCell[] {
    return [...this.cells];
  }

  public getSandboxConfig(): DirectorSandboxConfig {
    return { ...this.sandboxConfig };
  }

  public updateSandboxConfig(partial: Partial<DirectorSandboxConfig>): void {
    this.sandboxConfig = { ...this.sandboxConfig, ...partial };
  }

  /**
   * Assigns operatives and a mission to an autonomous cell.
   */
  public configureCell(
    cellId: string,
    params: {
      leaderId?: string | null;
      wingId?: string | null;
      nodeId?: string | null;
      missionType?: CellMissionType;
    }
  ): AutonomousCell | null {
    const cell = this.cells.find((c) => c.id === cellId);
    if (!cell) return null;

    if (params.leaderId !== undefined) cell.leaderOperativeId = params.leaderId;
    if (params.wingId !== undefined) cell.wingOperativeId = params.wingId;
    if (params.nodeId !== undefined) cell.assignedNodeId = params.nodeId;
    if (params.missionType !== undefined) cell.missionType = params.missionType;

    const hasCrew = !!cell.leaderOperativeId || !!cell.wingOperativeId;
    const isStationed = !!cell.assignedNodeId && cell.missionType !== 'IDLE';

    if (hasCrew && isStationed) {
      cell.status = 'DEPLOYED';
      cell.lastTelemetryLog = `Stationed at node ${cell.assignedNodeId} on ${cell.missionType} protocol.`;
    } else {
      cell.status = 'STANDBY';
      cell.lastTelemetryLog = 'Holding in Taproom reserve status.';
    }

    // Calculate baseline synergy/efficiency
    cell.efficiencyRating = hasCrew ? (cell.leaderOperativeId && cell.wingOperativeId ? 100 : 65) : 0;
    return { ...cell };
  }

  /**
   * Resolves autonomous operations across all deployed cells during shift transition.
   */
  public executeShiftForCells(): CellExecutionOutcome[] {
    const outcomes: CellExecutionOutcome[] = [];
    const store = useGameStore.getState();

    for (const cell of this.cells) {
      if (cell.status !== 'DEPLOYED' || cell.missionType === 'IDLE' || !cell.assignedNodeId) {
        continue;
      }

      let chip = 0;
      let digi = 0;
      let heatReduced = 0;
      let delayedFaction: string | null = null;
      let log = '';

      switch (cell.missionType) {
        case 'SALVAGE': {
          chip = Math.floor(35 * (cell.efficiencyRating / 100));
          digi = Math.floor(25 * (cell.efficiencyRating / 100));
          store.modifyCred('chipCred', chip);
          store.modifyCred('digitalCred', digi);
          log = `Salvaged sealed electronics and pre-collapse copper wiring (+${chip}C, +${digi}D).`;
          break;
        }

        case 'PATROL': {
          heatReduced = 1;
          const sector = cell.assignedNodeId.startsWith('S') ? 'sink'
            : cell.assignedNodeId.startsWith('H') ? 'heights'
            : cell.assignedNodeId.startsWith('OT') ? 'old_town'
            : cell.assignedNodeId.startsWith('R') ? 'redoubt'
            : 'scorch';
          store.modifyHeat(sector, -1);
          log = `Dispersed corporate spotter drones and syndicate informants in ${sector.toUpperCase()} (-1 Heat).`;
          break;
        }

        case 'SUPPRESS_HEAT': {
          heatReduced = 2;
          const sector = cell.assignedNodeId.startsWith('S') ? 'sink'
            : cell.assignedNodeId.startsWith('H') ? 'heights'
            : cell.assignedNodeId.startsWith('OT') ? 'old_town'
            : cell.assignedNodeId.startsWith('R') ? 'redoubt'
            : 'scorch';
          store.modifyHeat(sector, -2);
          log = `Executed counter-surveillance electronic sweep in ${sector.toUpperCase()} (-2 Heat).`;
          break;
        }

        case 'COUNTER_INTEL': {
          const factionTarget = cell.assignedNodeId.startsWith('H') ? 'apex_consortium'
            : cell.assignedNodeId.startsWith('R') ? 'redoubt_syndicate'
            : cell.assignedNodeId.startsWith('S') ? 'drowned_covenant'
            : 'iron_guild';
          delayedFaction = factionTarget;
          const faction = store.factions[factionTarget];
          if (faction && faction.activeFronts && faction.activeFronts.length > 0) {
            const currentSeg = faction.activeFronts[0].progress;
            this.setFactionClock(factionTarget, currentSeg - 1);
            log = `Sabotaged forward communication relays for ${faction.name} (-1 clock segment).`;
          } else {
            log = `Counter-intel sweep executed in ${cell.assignedNodeId}.`;
          }
          break;
        }

        default:
          log = 'Standby cycle completed.';
      }

      cell.lastTelemetryLog = log;
      outcomes.push({
        cellId: cell.id,
        cellName: cell.name,
        missionType: cell.missionType,
        credsEarned: { chip, digital: digi },
        heatReduced,
        factionDelayed: delayedFaction,
        telemetryLog: log,
      });
    }

    return outcomes;
  }

  /**
   * Sandbox Tool: Direct Heat adjustment.
   */
  public setSectorHeat(sector: string, heat: number): void {
    const store = useGameStore.getState();
    const currentHeat = store.economy.heat[sector] ?? 0;
    const delta = Math.max(0, Math.min(5, heat)) - currentHeat;
    store.modifyHeat(sector, delta);
    soundFx.playTerminalKeystroke();
  }

  /**
   * Sandbox Tool: Direct Faction Clock adjustment.
   */
  public setFactionClock(factionKey: string, segments: number): void {
    const store = useGameStore.getState();
    const faction = store.factions[factionKey];
    if (!faction || !faction.activeFronts || faction.activeFronts.length === 0) return;
    const clamped = Math.max(0, Math.min(faction.activeFronts[0].max, segments));
    const updatedFronts = faction.activeFronts.map((f, idx) => 
      idx === 0 ? { ...f, progress: clamped } : f
    );
    useGameStore.setState({
      factions: {
        ...store.factions,
        [factionKey]: {
          ...faction,
          activeFronts: updatedFronts,
        },
      },
    });
    soundFx.playTerminalKeystroke();
  }

  /**
   * Sandbox Tool: Inject resources into Agency economy.
   */
  public injectReserves(chip: number, digi: number): void {
    const store = useGameStore.getState();
    store.modifyCred('chipCred', chip);
    store.modifyCred('digitalCred', digi);
    soundFx.playClick();
  }

  /**
   * Sandbox Tool: Heal all operatives to max HP and restore morale.
   */
  public restoreAllOperatives(): void {
    const store = useGameStore.getState();
    store.roster.forEach((op) => {
      if (op.status === 'ACTIVE') {
        store.modifyOperativeHp(op.id, op.maxHp);
      }
    });
    soundFx.playTerminalKeystroke();
  }

  /**
   * Sandbox Tool: Direct Quality Inspection and Override.
   */
  public setQuality(qualityKey: string, value: any): void {
    useGameStore.getState().modifyQuality(qualityKey, value);
    soundFx.playTerminalKeystroke();
  }

  /**
   * Resets all cells back to default initial state.
   */
  public resetCells(): void {
    this.cells = INITIAL_CELLS.map((c) => ({ ...c }));
  }
}

export const directorEngine = new DirectorEngine();
