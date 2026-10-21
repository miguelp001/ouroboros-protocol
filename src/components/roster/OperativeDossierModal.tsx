import React from 'react';
import { Operative } from '../../types';
import { 
  X, 
  Heart, 
  Smile, 
  Wrench, 
  Stethoscope, 
  Compass, 
  UserCheck, 
  BookOpen, 
  Award,
  Zap,
  Lock,
  MapPin,
  UserPlus
} from 'lucide-react';
import { SlateButton } from '../slate/SlateButton';

interface OperativeDossierModalProps {
  operative: Operative | null;
  isActiveCompanion: boolean;
  onClose: () => void;
  onDeployCompanion: (id: string) => void;
  onAssignWorkstation: (id: string, type: 'FORGE' | 'INFIRMARY' | 'SCOUT') => void;
  onRecruitOperative?: (id: string) => void;
}

export const OperativeDossierModal: React.FC<OperativeDossierModalProps> = ({
  operative,
  isActiveCompanion,
  onClose,
  onDeployCompanion,
  onAssignWorkstation,
  onRecruitOperative,
}) => {
  if (!operative) return null;

  const isDead = operative.status === 'DEAD';
  const isMutinied = operative.status === 'MUTINIED';
  const isUnrecruited = operative.status === 'UNRECRUITED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
      <div className="relative w-full max-w-2xl bg-noir-surface border-2 border-noir-border rounded-xl shadow-slate-bevel p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-noir-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase ${
                isUnrecruited
                  ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  : isDead 
                  ? 'bg-crisis/20 text-crisis border border-crisis' 
                  : isMutinied 
                  ? 'bg-amber-950 text-amber-400 border border-amber-600'
                  : 'bg-hazard/10 text-hazard border border-hazard/40'
              }`}>
                STATUS: {operative.status}
              </span>
              <span className="text-zinc-500 text-xs">
                {isUnrecruited ? '// UNRESOLVED FIELD INTEL' : '// DOSSIER CLASSIFIED'}
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-noir-chalk mt-1 flex items-center gap-2">
              <span>{operative.name}</span>
              <span className="text-hazard text-base">"{operative.callsign}"</span>
            </h2>
            <p className="text-xs text-noir-muted">{operative.role}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-noir-muted hover:text-noir-chalk hover:bg-noir-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unrecruited Banner if not yet joined */}
        {isUnrecruited && (
          <div className="p-4 rounded border border-zinc-700 bg-zinc-900/90 text-xs space-y-2">
            <div className="flex items-center gap-2 text-hazard font-bold">
              <Lock className="w-4 h-4 text-hazard" />
              <span>RECRUITMENT INTEL: GAINED THROUGH PLAY</span>
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              This operative has not yet been recruited into Agent 0's Agency.
              You must explore the city sectors, navigate storylet nodes, or rescue them during missions to enlist them.
            </p>
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] pt-1">
              <MapPin className="w-3.5 h-3.5 text-hazard" />
              <span>Last Reported Sighting: <strong className="text-noir-chalk">{operative.recruitmentLocation ?? 'Metropolis Sprawl'}</strong></span>
            </div>
          </div>
        )}

        {/* Stats Grid Matrix */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { label: 'SCRAP', value: operative.stats.scrap, desc: 'Violence & Force' },
            { label: 'COVER', value: operative.stats.cover, desc: 'Stealth & Agility' },
            { label: 'RECKON', value: operative.stats.reckon, desc: 'Logic & Tech' },
            { label: 'TETHER', value: operative.stats.tether, desc: 'Will & Anomaly' },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded border border-noir-border bg-noir-ink/60 space-y-1">
              <div className="text-[10px] text-noir-muted">{stat.label}</div>
              <div className={`text-base font-bold ${stat.value > 0 ? 'text-hazard' : stat.value < 0 ? 'text-crisis' : 'text-zinc-400'}`}>
                {stat.value >= 0 ? `+${stat.value}` : stat.value}
              </div>
              <div className="text-[9px] text-zinc-500 truncate">{stat.desc}</div>
            </div>
          ))}
        </div>

        {/* Vitals: HP & Morale (if recruited) */}
        {!isUnrecruited && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded border border-noir-border bg-noir-ink/40 space-y-1.5">
              <div className="flex justify-between items-center text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-400" />
                  Physical Integrity
                </span>
                <span className="font-bold">{operative.hp} / {operative.maxHp} HP</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all ${operative.hp <= 3 ? 'bg-crisis' : 'bg-red-500'}`}
                  style={{ width: `${(operative.hp / operative.maxHp) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded border border-noir-border bg-noir-ink/40 space-y-1.5">
              <div className="flex justify-between items-center text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-hazard" />
                  Morale & Loyalty
                </span>
                <span className="font-bold">{operative.morale}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all ${operative.morale <= 30 ? 'bg-crisis' : 'bg-hazard'}`}
                  style={{ width: `${operative.morale}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Loyalty Perk */}
        <div className="p-3.5 rounded border border-hazard/30 bg-hazard/5 text-xs space-y-1">
          <div className="text-hazard font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>LOYALTY PERK:</span>
          </div>
          <p className="text-zinc-300 text-[11px] leading-relaxed">
            {operative.loyaltyPerk}
          </p>
        </div>

        {/* Active Workstation Assignment */}
        {operative.activeAssignment && (
          <div className="p-3.5 rounded border border-noir-border bg-noir-surface text-xs space-y-2">
            <div className="flex items-center justify-between text-hazard font-bold">
              <span className="flex items-center gap-1.5">
                {operative.activeAssignment.type === 'FORGE' && <Wrench className="w-4 h-4" />}
                {operative.activeAssignment.type === 'INFIRMARY' && <Stethoscope className="w-4 h-4" />}
                {operative.activeAssignment.type === 'SCOUT' && <Compass className="w-4 h-4" />}
                ACTIVE WORKSTATION: {operative.activeAssignment.type}
              </span>
              <span>PROGRESS: {operative.activeAssignment.progress}/{operative.activeAssignment.maxProgress} SHIFTS</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Target: <strong className="text-noir-chalk">{operative.activeAssignment.target}</strong>
            </p>
          </div>
        )}

        {/* Epitaph Ledger Timeline */}
        <div className="space-y-2">
          <div className="text-xs text-noir-muted uppercase font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-hazard" />
            <span>EPITAPH LEDGER & CAREER LOG:</span>
          </div>
          <div className="p-3 rounded border border-noir-border bg-noir-ink/60 space-y-1.5 max-h-28 overflow-y-auto text-[11px]">
            {operative.epitaphLedger.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-2 text-zinc-300">
                <Award className="w-3.5 h-3.5 text-hazard shrink-0 mt-0.5" />
                <span>{entry}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-noir-border flex flex-wrap gap-2 justify-end">
          {isUnrecruited && onRecruitOperative && (
            <SlateButton
              variant="hazard"
              onClick={() => {
                onRecruitOperative(operative.id);
                onClose();
              }}
              className="text-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              RECRUIT OPERATIVE INTO AGENCY
            </SlateButton>
          )}

          {!isDead && !isMutinied && !isUnrecruited && (
            <>
              {!isActiveCompanion && (
                <SlateButton
                  variant="hazard"
                  onClick={() => {
                    onDeployCompanion(operative.id);
                    onClose();
                  }}
                  className="text-xs flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  DEPLOY AS FIELD PARTNER
                </SlateButton>
              )}

              {!operative.activeAssignment && !isActiveCompanion && (
                <>
                  <SlateButton
                    variant="neutral"
                    onClick={() => onAssignWorkstation(operative.id, 'FORGE')}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    FORGE
                  </SlateButton>

                  <SlateButton
                    variant="neutral"
                    onClick={() => onAssignWorkstation(operative.id, 'INFIRMARY')}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    INFIRMARY
                  </SlateButton>

                  <SlateButton
                    variant="neutral"
                    onClick={() => onAssignWorkstation(operative.id, 'SCOUT')}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    SCOUT
                  </SlateButton>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
