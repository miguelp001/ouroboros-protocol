import { GameEngineState } from '../../types';
import { Storylet, QualityCondition, StateMutations } from './types';
import { useGameStore } from '../store';

export function isStoryletEligible(storylet: Storylet, state: GameEngineState): boolean {
  const req = storylet.requirements;

  // 1. Node requirement check
  if (req.nodeId && req.nodeId !== state.activeLocation) {
    return false;
  }

  // 2. Shift requirement check
  if (req.shift && req.shift.length > 0 && !req.shift.includes(state.time.shift)) {
    return false;
  }

  // 3. Stat minimum check
  if (req.statMin) {
    const agentStat = state.agentZero.stats[req.statMin.stat];
    if (agentStat < req.statMin.min) {
      return false;
    }
  }

  // 4. Key requirement check
  if (req.hasKey && !state.agency.keys.includes(req.hasKey)) {
    return false;
  }

  // 5. Heat range check
  if (req.heatMin !== undefined || req.heatMax !== undefined) {
    const sector = storylet.sector.toLowerCase();
    const currentHeat = state.economy.heat[sector] ?? 0;
    if (req.heatMin !== undefined && currentHeat < req.heatMin) {
      return false;
    }
    if (req.heatMax !== undefined && currentHeat > req.heatMax) {
      return false;
    }
  }

  // 6. Quality requirements check
  if (req.qualities) {
    for (const [key, expected] of Object.entries(req.qualities)) {
      const actual = state.qualities[key];

      if (typeof expected === 'object' && expected !== null && 'value' in expected) {
        const condition = expected as QualityCondition;
        const op = condition.op ?? '==';
        const expectedVal = condition.value;

        const effectiveActual = actual ?? (typeof expectedVal === 'boolean' ? false : undefined);
        if (effectiveActual === undefined) return false;

        switch (op) {
          case '==':
            if (effectiveActual !== expectedVal) return false;
            break;
          case '!=':
            if (effectiveActual === expectedVal) return false;
            break;
          case '>':
            if (Number(effectiveActual) <= Number(expectedVal)) return false;
            break;
          case '<':
            if (Number(effectiveActual) >= Number(expectedVal)) return false;
            break;
          case '>=':
            if (Number(effectiveActual) < Number(expectedVal)) return false;
            break;
          case '<=':
            if (Number(effectiveActual) > Number(expectedVal)) return false;
            break;
        }
      } else {
        // Direct equality comparison (treat undefined as false for boolean checks)
        const effectiveActual = actual ?? (typeof expected === 'boolean' ? false : undefined);
        if (effectiveActual !== expected) {
          return false;
        }
      }
    }
  }

  return true;
}

export function filterActiveStoryletDeck(
  storylets: Storylet[],
  state: GameEngineState,
  handLimit = 4
): Storylet[] {
  // If in an interrupt state, return only the interrupt storylet
  if (state.isInterrupt && state.activeInterruptStorylet) {
    return [state.activeInterruptStorylet as any];
  }

  const eligible = storylets.filter((storylet) => {
    // Normal dealing does not deal standalone interrupt cards unless triggered
    if (storylet.isInterrupt) return false;
    return isStoryletEligible(storylet, state);
  });

  // Sort by priority (higher priority first)
  eligible.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  return eligible.slice(0, handLimit);
}

export function executeStateMutations(mutations: StateMutations): void {
  const store = useGameStore.getState();

  // 1. Set Qualities
  if (mutations.setQualities) {
    Object.entries(mutations.setQualities).forEach(([k, v]) => {
      store.modifyQuality(k, v);
    });
  }

  // 2. Modify Creds
  if (mutations.modifyCred) {
    if (mutations.modifyCred.digitalCred) {
      store.modifyCred('digitalCred', mutations.modifyCred.digitalCred);
    }
    if (mutations.modifyCred.chipCred) {
      store.modifyCred('chipCred', mutations.modifyCred.chipCred);
    }
  }

  // 3. Modify Heat
  if (mutations.modifyHeat) {
    store.modifyHeat(mutations.modifyHeat.sector, mutations.modifyHeat.delta);
  }

  // 4. Modify Agent HP
  if (mutations.modifyAgentHp) {
    store.modifyAgentZeroHp(mutations.modifyAgentHp);
  }

  // 5. Add Keys
  if (mutations.addKeys) {
    mutations.addKeys.forEach((key) => {
      store.addKey(key);
    });
  }

  // 6. Advance Shift
  if (mutations.advanceShift) {
    store.advanceShift();
  }
}
