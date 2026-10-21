import React, { useState } from 'react';
import { 
  Key, 
  Terminal, 
  ShieldAlert, 
  Award, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Heart, 
  Skull, 
  Clock, 
  Coins, 
  Flame, 
  Zap,
  Lock,
  Unlock
} from 'lucide-react';
import { 
  vaultZeroEndgameEngine, 
  EndgameStage, 
  EpilogueEndingId, 
  EPILOGUE_ENDINGS, 
  CampaignVictoryDossier 
} from '../../engine/endgameEngine';
import { soundFx } from '../../audio/soundFx';

interface VaultZeroEndgameViewProps {
  onComplete: () => void;
  onEnterDirectorMode?: () => void;
}

export const VaultZeroEndgameView: React.FC<VaultZeroEndgameViewProps> = ({
  onComplete,
  onEnterDirectorMode,
}) => {
  const [currentStage, setCurrentStage] = useState<EndgameStage>('STAGE_1_BREACH');
  const [keysRotated, setKeysRotated] = useState(false);
  const [selectedEnding, setSelectedEnding] = useState<EpilogueEndingId>('RUPTURE_SEALED');
  const [victoryDossier, setVictoryDossier] = useState<CampaignVictoryDossier | null>(null);

  // Rotate Three Keys to breach portal (Stage 1)
  const handleRotateKeys = () => {
    soundFx.playKeyUnlock();
    setKeysRotated(true);
    setTimeout(() => {
      soundFx.playClick();
    }, 600);
  };

  // Advance between stages
  const handleNextStage = (next: EndgameStage) => {
    soundFx.playClick();
    setCurrentStage(next);
  };

  // Finalize selected epilogue
  const handleConfirmEpilogue = () => {
    const dossier = vaultZeroEndgameEngine.resolveEpilogue(selectedEnding);
    setVictoryDossier(dossier);
    setCurrentStage('STAGE_6_VICTORY_DOSSIER');
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-noir-ink text-noir-chalk font-mono select-none overflow-y-auto p-4 sm:p-6 md:p-8 animate-fade-in">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between border-b border-noir-border pb-3 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-hazard animate-pulse" />
          <span className="font-bold text-hazard tracking-widest uppercase">
            TERMINUS ZERO // OPERATION VAULT ZERO // CLIMAX
          </span>
        </div>
        <span className="text-zinc-500 font-mono text-[11px] hidden sm:inline">
          GATE CLEARANCE: LEVEL 4 TRIPLE-LOCK
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">

        {/* --- STAGE 1: TRIPLE-LOCK PORTAL GATE BREACH --- */}
        {currentStage === 'STAGE_1_BREACH' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div>
              <span className="text-xs text-hazard font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <Key className="w-4 h-4" />
                Subterranean Blast Portal // Terminus Zero
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-noir-chalk">
                THE TRIPLE-LOCK GATEWAY
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Five hundred feet beneath the radioactive Scorch, the monolithic blast door of Vault Zero looms in solid granite.
              </p>
            </div>

            {/* Three Keys Graphic Representation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg border border-hazard bg-hazard/10 flex flex-col items-center text-center gap-2">
                <Key className="w-8 h-8 text-hazard" />
                <div className="text-xs font-bold text-noir-chalk">THE THRESHOLD KEY</div>
                <div className="text-[10px] text-zinc-400">Lock 1: Dimensional Substrate Anchor</div>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ENGAGED
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-zinc-500 bg-zinc-900/60 flex flex-col items-center text-center gap-2">
                <Lock className="w-8 h-8 text-zinc-400" />
                <div className="text-xs font-bold text-noir-chalk">THE SKELETON KEY</div>
                <div className="text-[10px] text-zinc-400">Lock 2: Mechanical Blast Tumbler</div>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ENGAGED
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-cyan-500 bg-cyan-950/20 flex flex-col items-center text-center gap-2">
                <Unlock className="w-8 h-8 text-cyan-400" />
                <div className="text-xs font-bold text-noir-chalk">THE GHOST KEY</div>
                <div className="text-[10px] text-zinc-400">Lock 3: Quantum Cryptographic ICE</div>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ENGAGED
                </span>
              </div>
            </div>

            <div className="bg-noir-surface border-l-4 border-hazard p-4 rounded-r-lg text-sm text-zinc-300 leading-relaxed">
              <p>
                All three keys are aligned. As you turn them in synchronized harmony, three heavy hydraulic bolts withdraw with a deep subterranean roar. The fifty-ton titanium portal hinges backward into the darkness.
              </p>
            </div>

            {!keysRotated ? (
              <button
                onClick={handleRotateKeys}
                className="w-full py-3.5 rounded-lg bg-hazard text-noir-ink font-bold text-sm tracking-wider uppercase hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                ROTATE THE THREE KEYS IN SYNCHRONIZATION
                <Key className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleNextStage('STAGE_2_VAULT_CORE')}
                className="w-full py-3.5 rounded-lg bg-emerald-500 text-noir-ink font-bold text-sm tracking-wider uppercase hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-lg animate-pulse"
              >
                BREACH COMPLETED // DESCEND INTO VAULT CORE
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* --- STAGE 2: THE VAULT CORE --- */}
        {currentStage === 'STAGE_2_VAULT_CORE' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center gap-2 text-hazard text-xs font-bold uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4" />
              <span>THE DESCENT // SUB-LEVEL OMEGA</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-noir-chalk tracking-tight">
              THE AUTOMATED DEFENSE GRID
            </h1>

            <div className="bg-noir-surface border-l-4 border-hazard p-4 rounded-r-lg text-sm text-zinc-300 leading-relaxed space-y-3">
              <p>
                You step across the threshold into an immaculate, pre-collapse subterranean cathedral of black glass and brushed aluminum. Cold blue phosphor lines trace the perimeter walls.
              </p>
              <p>
                A dozen automated laser turrets swivel toward you, their targeting diodes painting your chest. But as the Quantum Ghost Key pulses from your slate, the defense matrix registers your clearance:
                <br />
                <span className="text-cyan-400 font-bold block mt-1">
                  // AGENT ZERO CLEARANCE CONFIRMED // AUTOMATED PROTOCOLS STAND DOWN
                </span>
              </p>
              <p className="text-zinc-400 italic">
                The turrets power down into their recesses. At the far end of the grand hall lies a circular hermetic seal bathed in cryogenic mist.
              </p>
            </div>

            <button
              onClick={() => handleNextStage('STAGE_3_CRYO_FOUNDER')}
              className="w-full py-3.5 rounded-lg bg-hazard text-noir-ink font-bold text-sm tracking-wider uppercase hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              APPROACH THE CRYOGENIC SARCOPHAGUS
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --- STAGE 3: THE CRYO-FOUNDER --- */}
        {currentStage === 'STAGE_3_CRYO_FOUNDER' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center gap-2 text-hazard text-xs font-bold uppercase tracking-widest">
              <Heart className="w-4 h-4 text-hazard" />
              <span>THE SLEEPER // PRE-COLLAPSE ARCHITECT</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-noir-chalk tracking-tight">
              DR. JONATHAN VANCE IN STASIS
            </h1>

            <div className="bg-noir-surface border-l-4 border-hazard p-4 rounded-r-lg text-sm text-zinc-300 leading-relaxed space-y-3">
              <p>
                Inside a cylindrical stasis capsule filled with shimmering amniotic fluid floats <strong>Dr. Jonathan Vance</strong>—the original founder of the Ouroboros Protocol and ancestor of your fellow scrapper, Silas Vance.
              </p>
              <p>
                A digital biosensor displays faint, rhythmic brainwaves: two hundred years of preservation without cellular degradation. His right hand holds an antique brass datapad identical to yours.
              </p>
              <p className="text-zinc-400 italic">
                Beside the stasis pod, two elevated pedestals emerge from the polished floor, presenting the Two Relics of Creation.
              </p>
            </div>

            <button
              onClick={() => handleNextStage('STAGE_4_RELICS')}
              className="w-full py-3.5 rounded-lg bg-hazard text-noir-ink font-bold text-sm tracking-wider uppercase hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              EXAMINE THE TWO RELICS OF CREATION
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --- STAGE 4: THE RELICS OF CREATION --- */}
        {currentStage === 'STAGE_4_RELICS' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div>
              <span className="text-xs text-hazard font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4" />
                The Artifacts of Creation // Vault Zero
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-noir-chalk">
                THE THREE-DROP VIAL & THE ALL-CUTTING EDGE
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Relic 1: The Three-Drop Vial */}
              <div className="p-4 rounded-lg border border-hazard/60 bg-hazard/10 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-hazard uppercase mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    RELIC I // CATALYST
                  </div>
                  <div className="text-sm font-bold text-noir-chalk">THE THREE-DROP VIAL</div>
                  <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                    A small crystalline phial holding three luminescent droplets of concentrated dimensional fluid. Consuming it grants complete cellular immortality and absolute operational authority, but risks perpetual isolation.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-zinc-500 font-mono">
                  PROPERTY: CELLULAR REGENERATION / CATALYTIC OVERLOAD
                </div>
              </div>

              {/* Relic 2: The All-Cutting Edge */}
              <div className="p-4 rounded-lg border border-zinc-600 bg-zinc-900/60 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-zinc-300 uppercase mb-1 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-hazard" />
                    RELIC II // WEAPON
                  </div>
                  <div className="text-sm font-bold text-noir-chalk">THE ALL-CUTTING EDGE</div>
                  <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                    A matte-black monomolecular blade forged from anomalous singularity alloy. Capable of slicing through any physical substrate or severing reality tears permanently at their quantum root.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-zinc-500 font-mono">
                  PROPERTY: ANOMALOUS DIMENSIONAL SEVERANCE
                </div>
              </div>
            </div>

            <button
              onClick={() => handleNextStage('STAGE_5_EPILOGUE_CHOICE')}
              className="w-full py-3.5 rounded-lg bg-hazard text-noir-ink font-bold text-sm tracking-wider uppercase hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              DECIDE THE FATE OF VAULT ZERO // CHOOSE EPILOGUE
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --- STAGE 5: THE 4 BRANCHING EPILOGUES --- */}
        {currentStage === 'STAGE_5_EPILOGUE_CHOICE' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div>
              <span className="text-xs text-hazard font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4" />
                The Final Decision // Campaign Resolution
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-noir-chalk">
                SELECT THE CAMPAIGN FINALE
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Your choice determines the fate of Agent 0, the surviving operatives, and the ruins of the city.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(EPILOGUE_ENDINGS) as EpilogueEndingId[]).map((endingId) => {
                const ending = EPILOGUE_ENDINGS[endingId];
                const isSelected = selectedEnding === endingId;
                return (
                  <button
                    key={endingId}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedEnding(endingId);
                    }}
                    className={`text-left p-4 rounded-lg border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-hazard/15 border-hazard shadow-[0_0_15px_rgba(250,204,21,0.2)] text-noir-chalk'
                        : 'bg-noir-surface border-noir-border text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-1">
                        <span className={isSelected ? 'text-hazard' : ''}>{endingId}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-hazard" />}
                      </div>
                      <div className="text-sm font-bold text-noir-chalk">{ending.title}</div>
                      <p className="text-xs text-zinc-400 italic mt-1.5 leading-relaxed">
                        "{ending.tagline}"
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-noir-border/50 text-[10px] text-zinc-500 font-mono">
                      RELIC: <span className="text-noir-chalk">{ending.relicUsed.split('&')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Ending Preview & Consequences */}
            <div className="p-4 bg-noir-surface border border-noir-border rounded-lg text-xs flex flex-col gap-2">
              <span className="text-hazard font-bold uppercase text-[10px]">
                CONSEQUENCES // {EPILOGUE_ENDINGS[selectedEnding].title}:
              </span>
              <ul className="space-y-1 text-zinc-300">
                {EPILOGUE_ENDINGS[selectedEnding].consequences.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-hazard">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 pt-2 border-t border-noir-border/50 text-zinc-400 text-[11px]">
                Agency Fate: <strong className="text-noir-chalk">{EPILOGUE_ENDINGS[selectedEnding].agencyFate}</strong>
              </div>
            </div>

            <button
              onClick={handleConfirmEpilogue}
              className="w-full py-3.5 rounded-lg bg-hazard text-noir-ink font-bold text-sm tracking-wider uppercase hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(250,204,21,0.3)] animate-pulse"
            >
              EXECUTE DECISION // SEAL THE OUROBOROS PROTOCOL
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --- STAGE 6: VICTORY DOSSIER & POST-GAME UNLOCK --- */}
        {currentStage === 'STAGE_6_VICTORY_DOSSIER' && victoryDossier && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-hazard/50 pb-2">
              <div className="flex items-center gap-2 text-hazard">
                <Award className="w-6 h-6 animate-bounce" />
                <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
                  CAMPAIGN CONCLUDED // EPILOGUE SEALED
                </h1>
              </div>
              <span className="text-[10px] bg-hazard/20 border border-hazard text-hazard px-2 py-0.5 rounded font-bold">
                VICTORY ARCHIVED
              </span>
            </div>

            {/* Narrative Epilogue Summary */}
            <div className="p-4 rounded-lg bg-noir-surface border-l-4 border-hazard text-sm text-zinc-300 leading-relaxed space-y-2">
              <h2 className="text-base font-bold text-hazard">
                {victoryDossier.ending.title}
              </h2>
              <p>{victoryDossier.ending.narrative}</p>
            </div>

            {/* Career Telemetry Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-hazard" />
                  DAYS ELAPSED
                </div>
                <div className="text-lg font-bold text-noir-chalk mt-1">
                  DAY {victoryDossier.daysElapsed}
                </div>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Heart className="w-3 h-3 text-emerald-400" />
                  SURVIVORS
                </div>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {victoryDossier.survivingOperativesCount} / 15
                </div>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Skull className="w-3 h-3 text-crisis" />
                  FALLEN NOTCHES
                </div>
                <div className="text-lg font-bold text-crisis mt-1">
                  {victoryDossier.barNotches} NOTCHES
                </div>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Coins className="w-3 h-3 text-hazard" />
                  FINAL CREDS
                </div>
                <div className="text-sm font-bold text-hazard mt-1.5">
                  {victoryDossier.chipCredFinal}C | {victoryDossier.digitalCredFinal}D
                </div>
              </div>
            </div>

            {/* Fallen Comrades Ledger */}
            {victoryDossier.fallenOperatives.length > 0 && (
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded text-xs space-y-1.5">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px]">
                  MEMORIAL CASUALTIES CARVED INTO THE BAR:
                </span>
                {victoryDossier.fallenOperatives.map((fallen, idx) => (
                  <div key={idx} className="text-zinc-400 flex items-center justify-between text-[11px]">
                    <span className="text-crisis font-bold">✝ {fallen.name} ({fallen.callsign})</span>
                    <span className="text-zinc-600 italic truncate max-w-xs">{fallen.cause}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Director Mode Unlock Banner */}
            <div className="p-3.5 bg-hazard/10 border border-hazard rounded-lg flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-hazard uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  DIRECTOR MODE UNLOCKED // PHASE 24
                </span>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Multi-cell procedural node management across 2-agent autonomous squads is now available.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onComplete}
                className="w-full py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 hover:border-hazard hover:text-hazard font-bold text-xs uppercase tracking-wider transition-colors"
              >
                RETURN TO TAPROOM SANCTUARY
              </button>

              {onEnterDirectorMode && (
                <button
                  onClick={onEnterDirectorMode}
                  className="w-full py-3 rounded-lg bg-hazard text-noir-ink hover:bg-yellow-400 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  COMMENCE DIRECTOR MODE
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
