import React, { useState } from 'react';
import { 
  Sliders, 
  Users, 
  Terminal, 
  ShieldAlert, 
  Zap, 
  Coins, 
  Activity, 
  RefreshCw, 
  Play, 
  XSquare,
  Database,
  Crosshair
} from 'lucide-react';
import { 
  directorEngine, 
  AutonomousCell, 
  CellMissionType,
  CellExecutionOutcome 
} from '../../engine/directorEngine';
import { useGameStore } from '../../engine/store';
import { soundFx } from '../../audio/soundFx';
import { MAP_NODES } from '../../data/transitMapData';

interface DirectorModeViewProps {
  onClose: () => void;
}

export const DirectorModeView: React.FC<DirectorModeViewProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'cells' | 'tuning' | 'qualities'>('cells');
  const [cells, setCells] = useState<AutonomousCell[]>(directorEngine.getCells());
  const [sandboxConfig, setSandboxConfig] = useState(directorEngine.getSandboxConfig());
  const [recentOutcomes, setRecentOutcomes] = useState<CellExecutionOutcome[]>([]);
  const [newQualityKey, setNewQualityKey] = useState('');
  const [newQualityVal, setNewQualityVal] = useState('');

  const store = useGameStore();
  const activeOperatives = store.roster.filter((op) => op.status === 'ACTIVE');
  const mapNodesList = Object.values(MAP_NODES);
  const factionsList = Object.values(store.factions);

  // Handle cell configuration
  const handleUpdateCell = (
    cellId: string,
    params: {
      leaderId?: string | null;
      wingId?: string | null;
      nodeId?: string | null;
      missionType?: CellMissionType;
    }
  ) => {
    soundFx.playTerminalKeystroke();
    directorEngine.configureCell(cellId, params);
    setCells(directorEngine.getCells());
  };

  // Run autonomous shift for cells
  const handleExecuteShift = () => {
    soundFx.playCardDraw();
    const outcomes = directorEngine.executeShiftForCells();
    setRecentOutcomes(outcomes);
    setCells(directorEngine.getCells());
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-noir-ink text-noir-chalk font-mono select-none overflow-y-auto p-4 sm:p-6 md:p-8 animate-fade-in">
      {/* Top Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-noir-border pb-3 mb-5 gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-hazard animate-pulse" />
          <div>
            <h1 className="text-sm font-bold text-hazard tracking-widest uppercase">
              DIRECTOR COMMAND CONSOLE // POST-GAME SANDBOX
            </h1>
            <p className="text-[10px] text-zinc-500">
              MULTI-CELL AUTONOMOUS DISPATCH & QUANTUM QUALITY DEBUGGER
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-3 py-1.5 rounded border border-noir-border hover:border-crisis hover:text-crisis text-xs text-zinc-400 transition-colors flex items-center gap-1.5"
          >
            <XSquare className="w-3.5 h-3.5" />
            EXIT DIRECTOR MODE
          </button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-noir-border/60 pb-2 mb-4 text-xs">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('cells');
          }}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
            activeTab === 'cells'
              ? 'bg-hazard text-noir-ink font-bold'
              : 'text-zinc-400 hover:text-noir-chalk hover:bg-noir-surface'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          AUTONOMOUS CELLS ({cells.filter((c) => c.status === 'DEPLOYED').length}/3)
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('tuning');
          }}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
            activeTab === 'tuning'
              ? 'bg-hazard text-noir-ink font-bold'
              : 'text-zinc-400 hover:text-noir-chalk hover:bg-noir-surface'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          THREAT & HEAT TUNER
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('qualities');
          }}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
            activeTab === 'qualities'
              ? 'bg-hazard text-noir-ink font-bold'
              : 'text-zinc-400 hover:text-noir-chalk hover:bg-noir-surface'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          QUALITIES & RESERVES
        </button>
      </div>

      {/* TAB 1: AUTONOMOUS SQUAD CELLS */}
      {activeTab === 'cells' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Configure 2-agent autonomous cells to execute background operations on subway nodes.
            </span>
            <button
              onClick={handleExecuteShift}
              className="px-3.5 py-1.5 rounded bg-hazard text-noir-ink font-bold text-xs hover:bg-yellow-400 transition-colors flex items-center gap-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5" />
              CYCLE CELL SHIFT
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cells.map((cell) => {
              const isDeployed = cell.status === 'DEPLOYED';
              return (
                <div
                  key={cell.id}
                  className={`p-4 rounded-lg border flex flex-col justify-between gap-3 ${
                    isDeployed 
                      ? 'border-hazard/60 bg-hazard/5' 
                      : 'border-noir-border bg-noir-surface'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-noir-chalk">{cell.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isDeployed ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {cell.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mb-3">{cell.code}</div>

                    {/* Operative Slots */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[10px] text-zinc-500 block mb-0.5">LEADER OPERATIVE:</label>
                        <select
                          value={cell.leaderOperativeId ?? ''}
                          onChange={(e) => handleUpdateCell(cell.id, { leaderId: e.target.value || null })}
                          className="w-full bg-zinc-900 border border-noir-border rounded p-1 text-xs text-zinc-200"
                        >
                          <option value="">(None - Unassigned)</option>
                          {activeOperatives.map((op) => (
                            <option key={op.id} value={op.id}>
                              {op.name} ({op.callsign})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-zinc-500 block mb-0.5">WING OPERATIVE:</label>
                        <select
                          value={cell.wingOperativeId ?? ''}
                          onChange={(e) => handleUpdateCell(cell.id, { wingId: e.target.value || null })}
                          className="w-full bg-zinc-900 border border-noir-border rounded p-1 text-xs text-zinc-200"
                        >
                          <option value="">(None - Unassigned)</option>
                          {activeOperatives.map((op) => (
                            <option key={op.id} value={op.id}>
                              {op.name} ({op.callsign})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-zinc-500 block mb-0.5">DEPLOYMENT NODE:</label>
                        <select
                          value={cell.assignedNodeId ?? ''}
                          onChange={(e) => handleUpdateCell(cell.id, { nodeId: e.target.value || null })}
                          className="w-full bg-zinc-900 border border-noir-border rounded p-1 text-xs text-zinc-200"
                        >
                          <option value="">(Taproom Reserve)</option>
                          {mapNodesList.map((node) => (
                            <option key={node.id} value={node.id}>
                              {node.id} // {node.name} ({node.sector.toUpperCase()})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-zinc-500 block mb-0.5">MISSION DIRECTIVE:</label>
                        <select
                          value={cell.missionType}
                          onChange={(e) => handleUpdateCell(cell.id, { missionType: e.target.value as CellMissionType })}
                          className="w-full bg-zinc-900 border border-noir-border rounded p-1 text-xs text-zinc-200"
                        >
                          <option value="IDLE">IDLE / STANDBY</option>
                          <option value="PATROL">PATROL (Suppress Local Heat -1)</option>
                          <option value="SALVAGE">SALVAGE (+Credits Harvesting)</option>
                          <option value="SUPPRESS_HEAT">SUPPRESS HEAT (E-War Sweep -2)</option>
                          <option value="COUNTER_INTEL">COUNTER-INTEL (Delay Faction Clocks)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Log */}
                  <div className="pt-2 border-t border-noir-border/50 text-[10px] text-zinc-400">
                    <span className="text-zinc-600 block mb-0.5">LATEST LOG:</span>
                    <p className="italic text-zinc-300 truncate">{cell.lastTelemetryLog}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Operations Log */}
          {recentOutcomes.length > 0 && (
            <div className="p-3.5 bg-noir-surface border border-noir-border rounded-lg text-xs space-y-1.5 mt-4">
              <span className="text-hazard font-bold uppercase text-[10px] block">
                SHIFT OPERATIONS TELEMETRY FEED:
              </span>
              {recentOutcomes.map((out, i) => (
                <div key={i} className="flex items-center justify-between text-zinc-300 border-b border-zinc-800/50 pb-1">
                  <span className="font-bold text-noir-chalk">{out.cellName} ({out.missionType}):</span>
                  <span className="text-zinc-400">{out.telemetryLog}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: THREAT & HEAT TUNER */}
      {activeTab === 'tuning' && (
        <div className="space-y-6">
          {/* Sector Heat Controller */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-hazard uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              REGIONAL HEAT CONTROLLER (0 - 5 HEAT)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {(['sink', 'heights', 'old_town', 'redoubt', 'scorch'] as const).map((sector) => {
                const currentHeat = store.economy.heat[sector] ?? 0;
                return (
                  <div key={sector} className="p-3 bg-noir-surface border border-noir-border rounded flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="uppercase text-zinc-300">{sector}</span>
                      <span className="text-hazard">{currentHeat} / 5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => directorEngine.setSectorHeat(sector, lvl)}
                          className={`flex-1 py-1 text-[10px] font-bold rounded border transition-colors ${
                            currentHeat === lvl 
                              ? 'bg-hazard text-noir-ink border-hazard' 
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Faction Front Clocks Controller */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-hazard uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              FACTION CLOCK SEGMENTS (0 - 6 SEGMENTS)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {factionsList.map((faction) => {
                const currentFront = faction.activeFronts?.[0];
                const currentProgress = currentFront?.progress ?? 0;
                const maxSegments = currentFront?.max ?? 6;
                return (
                  <div key={faction.id} className="p-3 bg-noir-surface border border-noir-border rounded flex flex-col gap-2">
                    <div className="text-xs font-bold text-zinc-300 truncate">
                      {faction.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">{currentFront?.name ?? 'Standard Objective'}</div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-hazard">
                      <span>SEGMENTS:</span>
                      <span>{currentProgress} / {maxSegments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: maxSegments + 1 }, (_, seg) => (
                        <button
                          key={seg}
                          onClick={() => directorEngine.setFactionClock(faction.id, seg)}
                          className={`flex-1 py-1 text-[10px] font-bold rounded border transition-colors ${
                            currentProgress === seg 
                              ? 'bg-hazard text-noir-ink border-hazard' 
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          {seg}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulation Multipliers */}
          <div className="p-4 bg-noir-surface border border-noir-border rounded-lg space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase">
              SANDBOX SIMULATION PARAMETERS
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-400">
                <input
                  type="checkbox"
                  checked={sandboxConfig.unlimitedReserves}
                  onChange={(e) => {
                    const updated = { unlimitedReserves: e.target.checked };
                    directorEngine.updateSandboxConfig(updated);
                    setSandboxConfig(directorEngine.getSandboxConfig());
                  }}
                  className="rounded border-zinc-700 bg-zinc-900 text-hazard"
                />
                <span>Unlimited Operational Reserves</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-zinc-400">
                <input
                  type="checkbox"
                  checked={sandboxConfig.godModeOperatives}
                  onChange={(e) => {
                    const updated = { godModeOperatives: e.target.checked };
                    directorEngine.updateSandboxConfig(updated);
                    setSandboxConfig(directorEngine.getSandboxConfig());
                  }}
                  className="rounded border-zinc-700 bg-zinc-900 text-hazard"
                />
                <span>Invulnerable Operatives (God Mode)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUALITIES & RESERVES DEBUGGER */}
      {activeTab === 'qualities' && (
        <div className="space-y-6">
          {/* Quick Injectors */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-hazard uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              QUICK PAYLOAD INJECTORS
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => directorEngine.injectReserves(100, 100)}
                className="px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 hover:border-hazard text-xs flex items-center gap-1"
              >
                <Coins className="w-3.5 h-3.5 text-hazard" />
                +100 Chip / +100 Digi
              </button>
              <button
                onClick={() => directorEngine.injectReserves(500, 500)}
                className="px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 hover:border-hazard text-xs flex items-center gap-1"
              >
                <Coins className="w-3.5 h-3.5 text-hazard" />
                +500 Chip / +500 Digi
              </button>
              <button
                onClick={() => directorEngine.restoreAllOperatives()}
                className="px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-emerald-400 hover:border-emerald-500 text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                RESTORE ROSTER HP TO MAX
              </button>
            </div>
          </div>

          {/* Direct Quality Insertion */}
          <div className="p-4 bg-noir-surface border border-noir-border rounded-lg space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-hazard" />
              SET / MUTATE ACTIVE QUALITY
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="Quality Key (e.g. met_silas_vance)"
                value={newQualityKey}
                onChange={(e) => setNewQualityKey(e.target.value)}
                className="flex-1 min-w-[200px] p-2 rounded bg-zinc-900 border border-noir-border text-zinc-200 text-xs font-mono"
              />
              <input
                type="text"
                placeholder="Value (e.g. true or 5)"
                value={newQualityVal}
                onChange={(e) => setNewQualityVal(e.target.value)}
                className="w-32 p-2 rounded bg-zinc-900 border border-noir-border text-zinc-200 text-xs font-mono"
              />
              <button
                onClick={() => {
                  if (!newQualityKey) return;
                  let parsedVal: any = newQualityVal;
                  if (newQualityVal === 'true') parsedVal = true;
                  else if (newQualityVal === 'false') parsedVal = false;
                  else if (!isNaN(Number(newQualityVal)) && newQualityVal.trim() !== '') parsedVal = Number(newQualityVal);
                  directorEngine.setQuality(newQualityKey, parsedVal);
                  setNewQualityKey('');
                  setNewQualityVal('');
                }}
                className="px-4 py-2 rounded bg-hazard text-noir-ink font-bold text-xs uppercase hover:bg-yellow-400 transition-colors"
              >
                SET QUALITY
              </button>
            </div>
          </div>

          {/* Active Qualities Inspector Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>ACTIVE WORLD & NARRATIVE QUALITIES ({Object.keys(store.qualities).length}):</span>
            </div>
            <div className="max-h-60 overflow-y-auto border border-noir-border rounded bg-zinc-950 p-2 font-mono text-[11px] space-y-1">
              {Object.entries(store.qualities).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-zinc-900 pb-0.5">
                  <span className="text-zinc-400">{k}:</span>
                  <span className="text-hazard font-bold">{JSON.stringify(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
