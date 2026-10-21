import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Key, 
  Terminal, 
  ChevronRight, 
  Activity, 
  Flame, 
  Compass, 
  Sparkles,
  Zap,
  CheckCircle2,
  Fingerprint
} from 'lucide-react';
import { BACKGROUND_PROFILES, BackgroundProfile, PROFILES_ARRAY } from '../../data/backgroundProfiles';
import { prologueScriptEngine, PrologueBeat, PrologueResolutionResult } from '../../engine/prologueEngine';
import { soundFx } from '../../audio/soundFx';
import { ambientAudioEngine } from '../../audio/ambientAudioEngine';
import { DiceTray } from '../dice/DiceTray';

interface PrologueViewProps {
  onComplete: () => void;
}

export const PrologueView: React.FC<PrologueViewProps> = ({ onComplete }) => {
  const [currentBeat, setCurrentBeat] = useState<PrologueBeat>('BEAT_0_PROFILE');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('warden_defector');
  const [biometricSynced, setBiometricSynced] = useState<boolean>(false);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [trialResult, setTrialResult] = useState<PrologueResolutionResult | null>(null);
  const [doorUnlocked, setDoorUnlocked] = useState<boolean>(false);

  const selectedProfile: BackgroundProfile = 
    BACKGROUND_PROFILES[selectedProfileId] ?? BACKGROUND_PROFILES.warden_defector;

  // Handle Beat Transitions
  const handleNextBeat = (next: PrologueBeat) => {
    soundFx.playClick();
    setCurrentBeat(next);

    if (next === 'BEAT_1_CULVERT_CHASE') {
      ambientAudioEngine.setSector('sink', 0.8);
    } else if (next === 'BEAT_5_SANCTUARY') {
      ambientAudioEngine.setSector('bar', 0.8);
    }
  };

  // Biometric Scan Handshake (Beat 2)
  const handleBiometricScan = () => {
    if (biometricSynced) return;
    soundFx.playBoot();
    setTimeout(() => {
      soundFx.playClick();
      setBiometricSynced(true);
    }, 450);
  };

  // Resolve Beat 3 PbtA Roll
  const handleRollTrial = (stat: 'scrap' | 'cover') => {
    if (isRolling) return;
    setIsRolling(true);
    soundFx.playDiceRoll();

    setTimeout(() => {
      const result = prologueScriptEngine.resolveBeat3Trial(
        stat,
        true,
        selectedProfile.stats
      );
      setTrialResult(result);
      setIsRolling(false);
      if (result.roll.tier === 'MISS') {
        soundFx.playGlitch();
      } else {
        soundFx.playClick();
      }
    }, 700);
  };

  // Unlock Threshold Door (Beat 4)
  const handleUnlockDoor = () => {
    soundFx.playKeyUnlock();
    setDoorUnlocked(true);
  };

  // Finalize Prologue & Enter Sanctuary
  const handleFinishPrologue = () => {
    prologueScriptEngine.completePrologue(selectedProfileId);
    onComplete();
  };

  // Skip option for quick-start testing
  const handleSkipPrologue = () => {
    soundFx.playClick();
    prologueScriptEngine.completePrologue(selectedProfileId);
    onComplete();
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-noir-ink text-noir-chalk font-mono select-none overflow-y-auto p-4 sm:p-6 md:p-8">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between border-b border-noir-border pb-3 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-hazard animate-pulse" />
          <span className="font-bold text-hazard tracking-widest uppercase">
            ORIGIN SCRIPT // SECTOR ZERO PROTOCOL
          </span>
          <span className="text-zinc-600 hidden sm:inline">
            // BEAT: {currentBeat.replace('BEAT_', '')}
          </span>
        </div>

        <button
          onClick={handleSkipPrologue}
          className="text-[11px] text-zinc-500 hover:text-hazard transition-colors border border-zinc-800 hover:border-hazard px-2.5 py-1 rounded"
          title="Bypass scripted sequence and initialize sandbox directly"
        >
          SKIP PROLOGUE (QUICK START)
        </button>
      </div>

      {/* Main Narrative Stage */}
      <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">

        {/* --- BEAT 0: CHARACTER CREATION & BACKGROUND PROFILE --- */}
        {currentBeat === 'BEAT_0_PROFILE' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div>
              <span className="text-xs text-hazard font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <Compass className="w-4 h-4" />
                Character Archetype // Stat Array
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-noir-chalk">
                SELECT AGENT 0 BACKGROUND PROFILE
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Standard PbtA fixed stat array (+2, +1, 0, -1) applied to SCRAP, COVER, RECKON, and TETHER.
              </p>
            </div>

            {/* Profile Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROFILES_ARRAY.map((profile) => {
                const isSelected = selectedProfileId === profile.id;
                return (
                  <button
                    key={profile.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedProfileId(profile.id);
                    }}
                    className={`text-left p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-hazard/10 border-hazard shadow-[0_0_15px_rgba(250,204,21,0.15)] text-noir-chalk'
                        : 'bg-noir-surface border-noir-border text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-1">
                        <span className={isSelected ? 'text-hazard' : ''}>{profile.callsignTag}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-hazard" />}
                      </div>
                      <div className="text-sm font-bold text-noir-chalk">{profile.name}</div>
                      <p className="text-xs text-zinc-400 italic mt-1 line-clamp-2">
                        "{profile.tagline}"
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-noir-border/50 flex items-center justify-between text-xs">
                      <div className="flex gap-2">
                        <span title="Scrap (Violence)">S:<strong className={profile.stats.scrap > 0 ? 'text-hazard' : ''}>{profile.stats.scrap > 0 ? `+${profile.stats.scrap}` : profile.stats.scrap}</strong></span>
                        <span title="Cover (Stealth)">C:<strong className={profile.stats.cover > 0 ? 'text-hazard' : ''}>{profile.stats.cover > 0 ? `+${profile.stats.cover}` : profile.stats.cover}</strong></span>
                        <span title="Reckon (Logic)">R:<strong className={profile.stats.reckon > 0 ? 'text-hazard' : ''}>{profile.stats.reckon > 0 ? `+${profile.stats.reckon}` : profile.stats.reckon}</strong></span>
                        <span title="Tether (Anomalous)">T:<strong className={profile.stats.tether > 0 ? 'text-hazard' : ''}>{profile.stats.tether > 0 ? `+${profile.stats.tether}` : profile.stats.tether}</strong></span>
                      </div>
                      <span className="text-[10px] text-hazard font-semibold">{profile.perkName}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Profile Detail Box */}
            <div className="bg-noir-surface border border-noir-border rounded-lg p-3.5 text-xs flex flex-col gap-1.5">
              <span className="text-zinc-500 uppercase tracking-widest text-[10px]">
                Operative Dossier Dossier Details:
              </span>
              <p className="text-zinc-300">{selectedProfile.description}</p>
              <div className="text-hazard font-bold flex items-center gap-1.5 mt-1">
                <Sparkles className="w-3.5 h-3.5" />
                Trait: {selectedProfile.perkName} — <span className="text-zinc-300 font-normal">{selectedProfile.perkDescription}</span>
              </div>
            </div>

            <button
              onClick={() => handleNextBeat('BEAT_1_CULVERT_CHASE')}
              className="w-full py-3 rounded-lg bg-hazard text-noir-ink font-bold text-sm tracking-wider uppercase hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              INITIALIZE RECOVERY RUN // ENTER CULVERTS
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --- BEAT 1: CULVERT CHASE --- */}
        {currentBeat === 'BEAT_1_CULVERT_CHASE' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center gap-2 text-crisis text-xs font-bold uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4 animate-ping" />
              <span>ACT I // THE FLOODED INTAKE</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-noir-chalk tracking-tight">
              THE CULVERT SPRINT
            </h1>

            <div className="bg-noir-surface border-l-4 border-crisis p-4 rounded-r-lg text-sm text-zinc-300 leading-relaxed flex flex-col gap-3">
              <p>
                The floodwater is waist-deep, freezing and brackish with industrial runoff. Upstream, a five-ton intake floodgate has blown off its hydraulic mountings, dumping black water into the culverts of Sector Zero.
              </p>
              <p>
                Behind you in the dark, the air tears like ripping sheet metal. It’s a <strong>Tier 3 Shifting Hound</strong>—a predator whose folded silhouette snaps between dimensions with every slosh of the tide.
              </p>
              <p className="text-hazard italic">
                Silas Vance wades beside you, his breathing ragged, dragging a notched iron lead pipe through the silt:
                <br />
                <span className="text-noir-chalk font-semibold font-mono">
                  "Keep your feet under you, Zero! If you slip into the intake current, that thing’ll tear you apart before you hit the grates!"
                </span>
              </p>
            </div>

            <button
              onClick={() => handleNextBeat('BEAT_2_THE_SLATE')}
              className="w-full py-3 rounded-lg bg-hazard text-noir-ink font-bold text-sm tracking-wider uppercase hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              PUSH THROUGH THE FLOODED DEBRIS
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --- BEAT 2: THE SLATE (BIOMETRIC HANDSHAKE) --- */}
        {currentBeat === 'BEAT_2_THE_SLATE' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center gap-2 text-hazard text-xs font-bold uppercase tracking-widest">
              <Terminal className="w-4 h-4" />
              <span>ACT II // THE FALLEN OPERATIVE</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-noir-chalk tracking-tight">
              THE OUROBOROS SLATE-4B
            </h1>

            <div className="bg-noir-surface border-l-4 border-hazard p-4 rounded-r-lg text-sm text-zinc-300 leading-relaxed flex flex-col gap-3">
              <p>
                Your boot catches against heavy submerged armor. Floating face-down against an intake trash grate is an operative in shredded graphite battle-dress. Dead only minutes.
              </p>
              <p>
                In their rigid death grip sits an angled military datapad: the <strong>Ouroboros Slate-4B</strong>. The casing is dented, and fracture lines spider across the glass, but an amber standby indicator still flickers under the surface.
              </p>
              <p className="text-zinc-400">
                You pry the cold fingers free. The screen lights up with an urgent prompt:
                <span className="text-hazard font-bold font-mono block mt-1">
                  // BIOMETRIC OVERRIDE REQUIRED: CALIBRATE AGENT 0 VITALS
                </span>
              </p>
            </div>

            {/* Biometric Thumbprint Sensor Button */}
            <div className="flex flex-col items-center justify-center p-6 bg-noir-surface border border-noir-border rounded-xl gap-3">
              <button
                onClick={handleBiometricScan}
                disabled={biometricSynced}
                className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all ${
                  biometricSynced
                    ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                    : 'border-hazard bg-hazard/10 text-hazard hover:bg-hazard/20 animate-pulse cursor-pointer'
                }`}
              >
                <Fingerprint className="w-10 h-10" />
              </button>

              <span className="text-xs font-bold tracking-wider font-mono">
                {biometricSynced ? (
                  <span className="text-emerald-400">BIOMETRIC SYNC CONFIRMED // AGENT 0 REGISTERED</span>
                ) : (
                  <span className="text-hazard">PRESS THUMB TO CRACKED GLASS SENSOR</span>
                )}
              </span>

              {biometricSynced && (
                <div className="text-[11px] text-zinc-400 font-mono bg-zinc-900 px-3 py-1.5 rounded border border-zinc-700 mt-2 text-center">
                  VITALS: <strong className="text-emerald-400">100%</strong> | SCANLINES: <strong className="text-hazard">ONLINE</strong> | SECTOR: <strong className="text-hazard">THE SINK</strong>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNextBeat('BEAT_3_THE_ROLL')}
              disabled={!biometricSynced}
              className={`w-full py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2 ${
                biometricSynced
                  ? 'bg-hazard text-noir-ink hover:bg-yellow-400 cursor-pointer shadow-lg'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              ENGAGE TACTICAL HUD // SENSE THREAT
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --- BEAT 3: THE ROLL (FIRST PBTA TRIAL) --- */}
        {currentBeat === 'BEAT_3_THE_ROLL' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center gap-2 text-crisis text-xs font-bold uppercase tracking-widest">
              <Zap className="w-4 h-4 text-crisis" />
              <span>ACT III // THE FIRST TRIAL (PBTA 2D6 RESOLUTION)</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-noir-chalk tracking-tight">
              AMBUSH AT THE STORM GRATE
            </h1>

            <div className="bg-noir-surface border-l-4 border-hazard p-4 rounded-r-lg text-sm text-zinc-300 leading-relaxed flex flex-col gap-2">
              <p>
                The ceiling above the intake buckles with a concussive smash! The <strong>Tier 3 Shifting Hound</strong> drops from an overhead ventilation chute straight into the floodwater before you.
              </p>
              <p>
                Its skin shimmers with reality-distortion frequencies. Silas plants his boots in the gravel, lifting his heavy pipe: <span className="text-hazard font-semibold">"I've got your flank, Zero! Choose your move now!"</span>
              </p>
            </div>

            {/* Trial Options (Before Roll) */}
            {!trialResult && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleRollTrial('scrap')}
                  disabled={isRolling}
                  className="text-left p-4 rounded-lg bg-noir-surface border border-noir-border hover:border-hazard transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-hazard uppercase mb-1 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      [SCRAP +{selectedProfile.stats.scrap}]
                    </div>
                    <div className="text-sm font-bold text-noir-chalk group-hover:text-hazard">
                      FIRE HEAVY SIDEARM AT ITS CORE
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Brute force blast. Silas assists (+1 to roll on 7+). Risk: gunshot echoes alert Redoubt patrols (+1 Heat).
                    </p>
                  </div>
                  <div className="mt-3 text-[10px] text-zinc-500 font-mono">
                    CLEAN HIT: Collapses beast | COSTLY: +1 Heat | MISS: -3 HP
                  </div>
                </button>

                <button
                  onClick={() => handleRollTrial('cover')}
                  disabled={isRolling}
                  className="text-left p-4 rounded-lg bg-noir-surface border border-noir-border hover:border-hazard transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-hazard uppercase mb-1 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      [COVER +{selectedProfile.stats.cover}]
                    </div>
                    <div className="text-sm font-bold text-noir-chalk group-hover:text-hazard">
                      DROP PHOSPHORUS FLARE & SLIP IN
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Stealth diversion. Blind the Hound’s sensory stalks and duck through the narrow drainage conduit.
                    </p>
                  </div>
                  <div className="mt-3 text-[10px] text-zinc-500 font-mono">
                    CLEAN HIT: Clean escape | COSTLY: -1 HP snag | MISS: -3 HP
                  </div>
                </button>
              </div>
            )}

            {/* Roll Animation & Outcomes */}
            {isRolling && (
              <div className="p-6 bg-noir-surface border border-hazard/50 rounded-xl flex items-center justify-center gap-3">
                <Activity className="w-5 h-5 text-hazard animate-spin" />
                <span className="text-sm font-bold text-hazard uppercase tracking-wider font-mono">
                  RESOLVING 2D6 PBTA TACTICAL CHECK...
                </span>
              </div>
            )}

            {trialResult && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <DiceTray 
                  rollResult={trialResult.roll}
                  isRolling={false}
                />

                <div className={`p-4 rounded-lg border text-sm leading-relaxed ${
                  trialResult.roll.tier === 'CLEAN_HIT'
                    ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-200'
                    : trialResult.roll.tier === 'COSTLY_ADVANCE'
                    ? 'bg-amber-950/20 border-amber-500/50 text-amber-200'
                    : 'bg-rose-950/20 border-rose-500/50 text-rose-200'
                }`}>
                  <p>{trialResult.narrative}</p>
                  <p className="text-xs font-semibold mt-2 font-mono italic">
                    {trialResult.companionBanter}
                  </p>
                </div>

                <button
                  onClick={() => handleNextBeat('BEAT_4_THE_DOOR')}
                  className="w-full py-3 rounded-lg bg-hazard text-noir-ink font-bold text-sm tracking-wider uppercase hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                >
                  RECOVER CORPSE'S KEY & REACH BULKHEAD
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- BEAT 4: THE DOOR (THE THRESHOLD KEY) --- */}
        {currentBeat === 'BEAT_4_THE_DOOR' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center gap-2 text-hazard text-xs font-bold uppercase tracking-widest">
              <Key className="w-4 h-4 text-hazard" />
              <span>ACT IV // THE IMPOSSIBLE BULKHEAD</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-noir-chalk tracking-tight">
              THE THRESHOLD KEY
            </h1>

            <div className="bg-noir-surface border-l-4 border-hazard p-4 rounded-r-lg text-sm text-zinc-300 leading-relaxed flex flex-col gap-3">
              <p>
                You plunge your hand into the dead operative’s soaked trenchcoat before the rising tide swallows the body. Your fingers close around a heavy iron artifact: an 1860s wrought iron key, cold as liquid nitrogen. <strong>The Threshold Key</strong>.
              </p>
              <p>
                Fifty yards ahead, the culvert terminates into a rusted, blast-shielded iron bulkhead. Built into its steel plate is an archaic brass keyhole that defies modern architecture.
              </p>
              <p className="text-zinc-400 italic">
                Behind you, more spatial echoes howl down the pipes. Silas slams his shoulder into the door: "Lock's sealed tight! Put that key in or we drown here!"
              </p>
            </div>

            {/* Keyhole Interaction Card */}
            <div className="p-6 bg-noir-surface border border-noir-border rounded-xl flex flex-col items-center justify-center gap-4">
              <Key className={`w-12 h-12 transition-all ${doorUnlocked ? 'text-emerald-400 rotate-90 scale-110' : 'text-hazard animate-bounce'}`} />
              
              <button
                onClick={handleUnlockDoor}
                disabled={doorUnlocked}
                className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                  doorUnlocked
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                    : 'bg-hazard text-noir-ink hover:bg-yellow-400 cursor-pointer shadow-lg'
                }`}
              >
                {doorUnlocked ? 'BULKHEAD TUMBLER DISENGAGED' : 'INSERT THRESHOLD KEY & TURN'}
              </button>
            </div>

            <button
              onClick={() => handleNextBeat('BEAT_5_SANCTUARY')}
              disabled={!doorUnlocked}
              className={`w-full py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2 ${
                doorUnlocked
                  ? 'bg-hazard text-noir-ink hover:bg-yellow-400 cursor-pointer shadow-lg'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              KICK OPEN THE IRON DOOR // FALL THROUGH
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --- BEAT 5: SANCTUARY (THE THRESHOLD BAR) --- */}
        {currentBeat === 'BEAT_5_SANCTUARY' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center gap-2 text-hazard text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-hazard" />
              <span>ACT V // SANCTUARY & THE TAPROOM</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-noir-chalk tracking-tight">
              THE THRESHOLD BAR
            </h1>

            <div className="bg-noir-surface border-l-4 border-hazard p-4 rounded-r-lg text-sm text-zinc-300 leading-relaxed flex flex-col gap-3">
              <p>
                You throw your weight against the heavy iron door and tumble across the threshold. The door slams shut behind you with a dead, concussive thud.
              </p>
              <p className="text-hazard font-semibold">
                Instantly, all outside sound cuts out. The rushing culvert water, the hunting screams of the anomalies, and the city sirens vanish into absolute acoustic isolation.
              </p>
              <p>
                You are sitting on polished hardwood floors inside a warm, gaslit 1860s mahogany taproom. An iron stove crackles softly with burning oak logs. Across the room, a heavy grandfather clock swings its pendulum with a rhythmic, steady tick-tock.
              </p>
              <p className="text-zinc-400 italic">
                Behind the counter, a gaunt man in a rolled-sleeve vest sets down a clean towel and slides a heavy tumbler of amber rye whiskey across the aged mahogany:
                <br />
                <span className="text-noir-chalk font-semibold font-mono">
                  "Drink up. Most don't survive the intake culverts. Keep that Slate, keep that Key, and don't lose that scrapper at your side. That iron door opens to every sector in the ruins, and nowhere at all. Vault Zero is five sectors down, locked behind Three Keys. This taproom is your only safe ground."
                </span>
              </p>
            </div>

            <button
              onClick={handleFinishPrologue}
              className="w-full py-3.5 rounded-lg bg-hazard text-noir-ink font-bold text-sm tracking-wider uppercase hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(250,204,21,0.3)] animate-pulse"
            >
              DRINK THE RYE // COMMENCE OPERATION VAULT ZERO
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
