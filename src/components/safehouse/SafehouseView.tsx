import React, { useState } from 'react';
import { Operative } from '../../types';
import { 
  Wrench, 
  Stethoscope, 
  Compass, 
  Clock, 
  Coins, 
  X, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { 
  WorkstationType, 
  WorkstationProject, 
  FORGE_PROJECTS, 
  INFIRMARY_PROJECTS, 
  SCOUT_PROJECTS 
} from '../../data/workstationProjects';
import { startWorkstationTask, abortWorkstationTask } from '../../engine/safehouseEngine';
import { SlateButton } from '../slate/SlateButton';
import { soundFx } from '../../audio/soundFx';

interface SafehouseViewProps {
  roster: Operative[];
  activeCompanionId: string | null;
  chipCred: number;
  digitalCred: number;
}

export const SafehouseView: React.FC<SafehouseViewProps> = ({
  roster,
  activeCompanionId,
  chipCred,
  digitalCred,
}) => {
  const [modalType, setModalType] = useState<WorkstationType | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedOperativeId, setSelectedOperativeId] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Available operatives: active, not companion, not currently assigned
  const availableOperatives = roster.filter(
    (op) => op.status === 'ACTIVE' && op.id !== activeCompanionId && !op.activeAssignment
  );

  const getAssignedOperative = (type: WorkstationType) => {
    return roster.find((op) => op.activeAssignment?.type === type && op.status === 'ACTIVE');
  };

  const getProjectsForType = (type: WorkstationType): WorkstationProject[] => {
    switch (type) {
      case 'FORGE':
        return FORGE_PROJECTS;
      case 'INFIRMARY':
        return INFIRMARY_PROJECTS;
      case 'SCOUT':
        return SCOUT_PROJECTS;
    }
  };

  const handleOpenAssignModal = (type: WorkstationType) => {
    soundFx.playClick();
    setModalType(type);
    const projects = getProjectsForType(type);
    setSelectedProjectId(projects[0]?.id ?? '');
    setSelectedOperativeId(availableOperatives[0]?.id ?? '');
    setFeedbackMessage(null);
  };

  const handleConfirmAssignment = () => {
    if (!modalType || !selectedProjectId || !selectedOperativeId) return;
    const projects = getProjectsForType(modalType);
    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project) return;

    const res = startWorkstationTask(selectedOperativeId, project);
    if (res.success) {
      setModalType(null);
      setFeedbackMessage(res.message);
    } else {
      setFeedbackMessage(res.message);
    }
  };

  const handleAbort = (operativeId: string) => {
    soundFx.playGlitch();
    const res = abortWorkstationTask(operativeId);
    setFeedbackMessage(res.message);
  };

  const workstations = [
    {
      type: 'FORGE' as WorkstationType,
      title: 'THE MECHANICAL FORGE',
      subtitle: 'Armor Plating, Key Lathe & Relic Fabrication',
      icon: Wrench,
      accent: 'text-amber-400 border-amber-600/40',
      projects: FORGE_PROJECTS,
    },
    {
      type: 'INFIRMARY' as WorkstationType,
      title: 'TRAUMA INFIRMARY',
      subtitle: 'Surgical Recovery, Blood Suture & Psychic Cleansing',
      icon: Stethoscope,
      accent: 'text-emerald-400 border-emerald-600/40',
      projects: INFIRMARY_PROJECTS,
    },
    {
      type: 'SCOUT' as WorkstationType,
      title: 'SCOUT OPERATIONS',
      subtitle: 'Sub-level Recon, Contraband Intercept & Heat Reduction',
      icon: Compass,
      accent: 'text-sky-400 border-sky-600/40',
      projects: SCOUT_PROJECTS,
    },
  ];

  return (
    <div className="space-y-5 font-mono">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-noir-border pb-3">
        <div>
          <h3 className="font-bold text-base text-noir-chalk font-mono">SAFEHOUSE WORKSTATION DISPATCH</h3>
          <p className="text-xs text-noir-muted">
            Un-deployed operatives lock into persistent workstations across shifts without micromanagement.
          </p>
        </div>

        <div className="text-xs flex items-center gap-3 bg-noir-surface px-3 py-1.5 rounded border border-noir-border">
          <span className="text-zinc-400">Available Technicians: <strong className="text-hazard font-bold">{availableOperatives.length}</strong></span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">Creds: <strong className="text-noir-chalk">{digitalCred}D</strong> / <strong className="text-hazard">{chipCred}C</strong></span>
        </div>
      </div>

      {/* Feedback banner */}
      {feedbackMessage && (
        <div className="p-3 rounded border border-hazard/40 bg-hazard/10 text-xs text-hazard flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-xs hover:text-white">✕</button>
        </div>
      )}

      {/* Workstation Terminals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workstations.map((station) => {
          const Icon = station.icon;
          const assignedOp = getAssignedOperative(station.type);
          const assignment = assignedOp?.activeAssignment;

          return (
            <div
              key={station.type}
              className={`p-4 rounded-lg border bg-noir-ink/80 flex flex-col justify-between space-y-4 shadow-slate-bevel ${
                assignment ? 'border-hazard/50' : 'border-noir-border'
              }`}
            >
              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded bg-noir-surface border ${station.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-noir-chalk">{station.title}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    assignment ? 'bg-hazard/10 text-hazard border border-hazard/40' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {assignment ? 'ACTIVE' : 'IDLE'}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500">{station.subtitle}</p>
              </div>

              {/* Body: Active Task vs Idle */}
              {assignment && assignedOp ? (
                <div className="p-3 rounded bg-noir-surface border border-noir-border/80 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-noir-muted">Assigned:</span>
                    <strong className="text-noir-chalk font-bold">{assignedOp.name} [{assignedOp.callsign}]</strong>
                  </div>

                  <div>
                    <div className="text-[11px] text-zinc-300 font-bold truncate">{assignment.target}</div>
                    <div className="flex justify-between text-[10px] text-noir-muted mt-1">
                      <span>Progress:</span>
                      <span>{assignment.progress} / {assignment.maxProgress} Shifts</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden mt-1">
                      <div 
                        className="bg-hazard h-full transition-all duration-300"
                        style={{ width: `${(assignment.progress / assignment.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-noir-border/50 flex justify-end">
                    <button
                      onClick={() => handleAbort(assignedOp.id)}
                      className="text-[10px] text-crisis hover:underline flex items-center gap-1 font-bold"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      ABORT TASK (-10 MORALE)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded bg-noir-surface/40 border border-dashed border-zinc-800 text-center space-y-2">
                  <Clock className="w-6 h-6 text-zinc-600 mx-auto" />
                  <p className="text-[11px] text-zinc-500">No active assignment dispatched.</p>
                  <SlateButton
                    variant="neutral"
                    onClick={() => handleOpenAssignModal(station.type)}
                    disabled={availableOperatives.length === 0}
                    className="text-xs mx-auto"
                  >
                    ASSIGN OPERATIVE
                  </SlateButton>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Assignment Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
          <div className="w-full max-w-lg bg-noir-surface border-2 border-noir-border rounded-xl shadow-slate-bevel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-noir-border pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-hazard">
                <Play className="w-4 h-4" />
                <span>DISPATCH TO {modalType} WORKSTATION</span>
              </div>
              <button onClick={() => setModalType(null)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select Operative */}
            <div className="space-y-1.5 text-xs">
              <label className="text-noir-muted block">1. Select Available Operative:</label>
              <select
                value={selectedOperativeId}
                onChange={(e) => setSelectedOperativeId(e.target.value)}
                className="w-full p-2.5 rounded bg-noir-ink border border-noir-border text-noir-chalk text-xs focus:border-hazard outline-none"
              >
                {availableOperatives.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name} ({op.callsign}) // {op.role} [HP: {op.hp}/{op.maxHp}]
                  </option>
                ))}
              </select>
            </div>

            {/* Select Project */}
            <div className="space-y-1.5 text-xs">
              <label className="text-noir-muted block">2. Select Project / Operation:</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {getProjectsForType(modalType).map((p) => {
                  const isSelected = selectedProjectId === p.id;
                  const canAfford = (!p.cost?.chipCred || chipCred >= p.cost.chipCred) &&
                                    (!p.cost?.digitalCred || digitalCred >= p.cost.digitalCred);

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`p-3 rounded border text-xs cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-hazard bg-hazard/10' 
                          : 'border-noir-border bg-noir-ink hover:border-zinc-500'
                      } ${!canAfford ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-noir-chalk">{p.title}</span>
                        <span className="text-[10px] text-hazard">{p.durationShifts} SHIFTS</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">{p.description}</p>
                      {p.cost && (
                        <div className="text-[10px] text-amber-400 mt-1 flex items-center gap-1.5">
                          <Coins className="w-3 h-3" />
                          <span>Cost: {p.cost.chipCred ? `${p.cost.chipCred}C ` : ''}{p.cost.digitalCred ? `${p.cost.digitalCred}D` : ''}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-noir-border flex justify-end gap-2 text-xs">
              <SlateButton variant="neutral" onClick={() => setModalType(null)}>
                CANCEL
              </SlateButton>
              <SlateButton variant="hazard" onClick={handleConfirmAssignment}>
                CONFIRM DISPATCH
              </SlateButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
