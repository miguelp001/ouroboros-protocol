import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './store';
import { 
  getNodeAnomaly, 
  canContainAnomaly, 
  deployRealityAnchor, 
  performSpecialistPurge, 
  harvestAnomalyResidue, 
  processDailyAnomalyEcology 
} from './anomalyEngine';

describe('Anomaly Ecology & Containment Engine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('retrieves live node anomaly data correctly', () => {
    const s01 = getNodeAnomaly('S-01');
    expect(s01.tier).toBe(3);
    expect(s01.entityName).toContain('Shifting Hound');
    expect(s01.isMobile).toBe(true);
    expect(s01.contained).toBe(false);
  });

  it('evaluates containment capability correctly for anchors and specialists', () => {
    const checkStandard = canContainAnomaly('S-01', null);
    expect(checkStandard.canAnchor).toBe(true);
    expect(checkStandard.canPurge).toBe(false);

    const checkSpecialist = canContainAnomaly('S-01', 'sister_maren');
    expect(checkSpecialist.canPurge).toBe(true);
    expect(checkSpecialist.specialistName).toContain('Sister Maren');
  });

  it('deploys reality anchor: spends 30 chip creds, awards +25 digital creds, and reduces tier by 2', () => {
    const store = useGameStore.getState();
    const initialChip = store.economy.chipCred; // 40
    const initialDigital = store.economy.digitalCred; // 150

    // Deploy anchor at S-01 (Tier 3)
    const result = deployRealityAnchor('S-01');
    expect(result.success).toBe(true);

    const updated = getNodeAnomaly('S-01');
    expect(updated.tier).toBe(1); // 3 - 2 = 1
    expect(updated.contained).toBe(true);
    expect(updated.isMobile).toBe(false);

    const updatedStore = useGameStore.getState();
    expect(updatedStore.economy.chipCred).toBe(initialChip - 30);
    expect(updatedStore.economy.digitalCred).toBe(initialDigital + 25);
  });

  it('rejects reality anchor deployment if insufficient chip creds', () => {
    useGameStore.setState({
      economy: {
        ...useGameStore.getState().economy,
        chipCred: 10,
      },
    });

    const result = deployRealityAnchor('S-01');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Insufficient');
  });

  it('performs specialist purge with Sister Maren: cleanses anomaly completely (Tier 0) and grants core sample', () => {
    const result = performSpecialistPurge('S-01', 'sister_maren');
    expect(result.success).toBe(true);
    expect(result.message).toContain('Sister Maren');

    const updated = getNodeAnomaly('S-01');
    expect(updated.tier).toBe(0);
    expect(updated.contained).toBe(true);

    expect(useGameStore.getState().qualities['anomalous_core_sample']).toBe(true);
  });

  it('performs specialist purge with Dr. Aris Voss: extracts neuro telemetry and reduces tier by 2', () => {
    const result = performSpecialistPurge('S-01', 'dr_aris_voss');
    expect(result.success).toBe(true);
    expect(result.message).toContain('Dr. Aris Voss');

    const updated = getNodeAnomaly('S-01');
    expect(updated.tier).toBe(1); // 3 - 2 = 1
    expect(useGameStore.getState().qualities['neuro_anomaly_telemetry']).toBe(true);
  });

  it('harvests anomaly residue on Tier 1-3 nodes: awards +40D and spikes sector heat +1', () => {
    const initialDigital = useGameStore.getState().economy.digitalCred;
    const initialSinkHeat = useGameStore.getState().economy.heat['sink'] ?? 1;

    const result = harvestAnomalyResidue('S-01');
    expect(result.success).toBe(true);

    const updatedStore = useGameStore.getState();
    expect(updatedStore.economy.digitalCred).toBe(initialDigital + 40);
    expect(updatedStore.economy.heat['sink']).toBe(initialSinkHeat + 1);
  });

  it('migrates mobile entities (Tier 3-4) to adjacent transit nodes at DAWN', () => {
    // S-01 has a Tier 3 Shifting Hound. Adjacent nodes: S-02, OT-01
    const report = processDailyAnomalyEcology({
      seedMigrations: {
        'S-01': 'S-02',
      },
    });

    expect(report.migrations.length).toBeGreaterThanOrEqual(1);
    const houndMigration = report.migrations.find((m) => m.previousNodeId === 'S-01');
    expect(houndMigration).toBeDefined();
    expect(houndMigration?.newNodeId).toBe('S-02');

    // S-02 now has the mobile hound
    const s02Anomaly = getNodeAnomaly('S-02');
    expect(s02Anomaly.isMobile).toBe(true);
    expect(s02Anomaly.entityName).toContain('Shifting Hound');
  });

  it('spreads reality tear contagion from Tier 5 node on day % 3 === 0', () => {
    // Set day to 3
    useGameStore.setState({
      time: {
        ...useGameStore.getState().time,
        day: 3,
      },
    });

    // X-03 is Tier 5. Adjacent node: X-02
    const report = processDailyAnomalyEcology();
    expect(report.contagions.length).toBeGreaterThanOrEqual(1);

    const tearContagion = report.contagions.find((c) => c.sourceNodeId === 'X-03');
    expect(tearContagion).toBeDefined();
    expect(tearContagion?.spreadNodeId).toBe('X-02');
  });
});
