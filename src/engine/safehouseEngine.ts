// Safehouse Workstation Dispatch & Task Execution Engine

import { Operative } from '../types';
import { WorkstationProject, FORGE_PROJECTS, INFIRMARY_PROJECTS, SCOUT_PROJECTS } from '../data/workstationProjects';
import { useGameStore } from './store';
import { soundFx } from '../audio/soundFx';

export interface WorkstationCompletionNotice {
  operativeName: string;
  projectTitle: string;
  workstationType: string;
  summary: string;
}

export function getAllAvailableProjects(): WorkstationProject[] {
  return [...FORGE_PROJECTS, ...INFIRMARY_PROJECTS, ...SCOUT_PROJECTS];
}

export function startWorkstationTask(
  operativeId: string,
  project: WorkstationProject
): { success: boolean; message: string } {
  const store = useGameStore.getState();
  const operative = store.roster.find((op) => op.id === operativeId);

  if (!operative) {
    return { success: false, message: 'Operative not found.' };
  }

  if (operative.status !== 'ACTIVE') {
    return { success: false, message: 'Only ACTIVE operatives can be assigned.' };
  }

  if (operative.id === store.activeCompanionId) {
    return { success: false, message: 'Operative is currently deployed as your field companion.' };
  }

  if (operative.activeAssignment) {
    return { success: false, message: 'Operative is already locked into an active assignment.' };
  }

  // Cost check
  if (project.cost) {
    if (project.cost.chipCred && store.economy.chipCred < project.cost.chipCred) {
      return { success: false, message: `Insufficient Chip Creds (Needs ${project.cost.chipCred}C).` };
    }
    if (project.cost.digitalCred && store.economy.digitalCred < project.cost.digitalCred) {
      return { success: false, message: `Insufficient Digital Creds (Needs ${project.cost.digitalCred}D).` };
    }

    // Deduct cost
    if (project.cost.chipCred) store.modifyCred('chipCred', -project.cost.chipCred);
    if (project.cost.digitalCred) store.modifyCred('digitalCred', -project.cost.digitalCred);
  }

  // Assign operative
  store.assignOperative(operativeId, {
    type: project.type,
    target: project.title,
    progress: 0,
    maxProgress: project.durationShifts,
  });

  soundFx.playClick();
  return { success: true, message: `Dispatched ${operative.name} to ${project.title}.` };
}

export function abortWorkstationTask(operativeId: string): { success: boolean; message: string } {
  const store = useGameStore.getState();
  const operative = store.roster.find((op) => op.id === operativeId);

  if (!operative || !operative.activeAssignment) {
    return { success: false, message: 'No active assignment to abort.' };
  }

  const taskTitle = operative.activeAssignment.target;

  // Clear assignment and apply morale penalty for aborted work
  store.assignOperative(operativeId, null);
  store.modifyOperativeMorale(operativeId, -10);

  return { success: true, message: `Emergency aborted ${taskTitle}. Morale suffered -10.` };
}

export function processWorkstationCompletions(
  operative: Operative,
  projectTitle: string
): WorkstationCompletionNotice {
  const store = useGameStore.getState();
  const allProjects = getAllAvailableProjects();
  const project = allProjects.find((p) => p.title === projectTitle);

  let summary = `Completed safehouse operation: ${projectTitle}.`;

  if (project?.rewards) {
    // Heat reduction
    if (project.rewards.heatReduction) {
      store.modifyHeat(project.rewards.heatReduction.sector, -project.rewards.heatReduction.amount);
      summary += ` Lowered ${project.rewards.heatReduction.sector.toUpperCase()} Heat by ${project.rewards.heatReduction.amount}.`;
    }

    // Cred rewards
    if (project.rewards.credReward) {
      if (project.rewards.credReward.chipCred) {
        store.modifyCred('chipCred', project.rewards.credReward.chipCred);
        summary += ` +${project.rewards.credReward.chipCred} Chip Cred.`;
      }
      if (project.rewards.credReward.digitalCred) {
        store.modifyCred('digitalCred', project.rewards.credReward.digitalCred);
        summary += ` +${project.rewards.credReward.digitalCred} Digital Cred.`;
      }
    }

    // Qualities
    if (project.rewards.qualities) {
      Object.entries(project.rewards.qualities).forEach(([k, v]) => {
        store.modifyQuality(k, v);
      });
      summary += ` Acquired new telemetry quality.`;
    }

    // Infirmary healing
    if (project.type === 'INFIRMARY') {
      store.modifyOperativeHp(operative.id, operative.maxHp);
      store.modifyOperativeMorale(operative.id, 25);
      summary += ` Restored ${operative.name} to full HP and +25 Morale.`;
    }

    // Forge ballistic plating
    if (project.id === 'forge_ballistic_plating') {
      useGameStore.setState({
        roster: store.roster.map((op) => {
          if (op.id !== operative.id) return op;
          return {
            ...op,
            maxHp: op.maxHp + 2,
            hp: op.hp + 2,
          };
        }),
      });
      summary += ` Permanently increased ${operative.name}'s Max HP by +2.`;
    }
  }

  return {
    operativeName: operative.name,
    projectTitle,
    workstationType: operative.activeAssignment?.type ?? 'SAF有り',
    summary,
  };
}
