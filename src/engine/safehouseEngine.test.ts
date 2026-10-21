import { describe, it, expect, beforeEach } from 'vitest';
import { 
  startWorkstationTask, 
  abortWorkstationTask, 
  processWorkstationCompletions,
  getAllAvailableProjects 
} from './safehouseEngine';
import { FORGE_PROJECTS, SCOUT_PROJECTS } from '../data/workstationProjects';
import { useGameStore } from './store';

describe('Safehouse Workstations & Persistent Dispatch Engine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('retrieves all available projects for Forge, Infirmary, and Scout', () => {
    const projects = getAllAvailableProjects();
    expect(projects.length).toBeGreaterThanOrEqual(7);
  });

  it('starts a Forge workstation task, deducting cred cost and setting lock-in', () => {
    // Recruit Jax Tinker
    useGameStore.getState().recruitOperative('jax_tinker');
    const initialChipCred = useGameStore.getState().economy.chipCred;

    const project = FORGE_PROJECTS[0]; // Tungsten frame, 30 chip creds
    const res = startWorkstationTask('jax_tinker', project);

    expect(res.success).toBe(true);
    expect(useGameStore.getState().economy.chipCred).toBe(initialChipCred - (project.cost?.chipCred ?? 0));

    const jax = useGameStore.getState().roster.find((op) => op.id === 'jax_tinker');
    expect(jax?.activeAssignment?.type).toBe('FORGE');
    expect(jax?.activeAssignment?.target).toBe(project.title);
    expect(jax?.activeAssignment?.progress).toBe(0);
    expect(jax?.activeAssignment?.maxProgress).toBe(project.durationShifts);
  });

  it('prevents assigning active field companion to a workstation', () => {
    useGameStore.getState().setActiveCompanion('silas_vance');
    const project = FORGE_PROJECTS[0];
    const res = startWorkstationTask('silas_vance', project);

    expect(res.success).toBe(false);
    expect(res.message).toContain('currently deployed as your field companion');
  });

  it('aborts an active workstation task and inflicts morale penalty', () => {
    useGameStore.getState().recruitOperative('cora_ramos');
    startWorkstationTask('cora_ramos', SCOUT_PROJECTS[0]);

    const initialMorale = useGameStore.getState().roster.find((op) => op.id === 'cora_ramos')?.morale ?? 85;

    const abortRes = abortWorkstationTask('cora_ramos');
    expect(abortRes.success).toBe(true);

    const cora = useGameStore.getState().roster.find((op) => op.id === 'cora_ramos');
    expect(cora?.activeAssignment).toBeNull();
    expect(cora?.morale).toBe(initialMorale - 10);
  });

  it('processes workstation completions and awards rewards', () => {
    useGameStore.getState().recruitOperative('cora_ramos');
    useGameStore.getState().modifyHeat('sink', 2);
    const initialHeat = useGameStore.getState().economy.heat.sink;

    const scoutProject = SCOUT_PROJECTS[0]; // reduces sink heat by 1
    const cora = useGameStore.getState().roster.find((op) => op.id === 'cora_ramos')!;

    const notice = processWorkstationCompletions(cora, scoutProject.title);

    expect(notice.summary).toContain('Lowered SINK Heat by 1');
    expect(useGameStore.getState().economy.heat.sink).toBe(initialHeat - 1);
  });
});
