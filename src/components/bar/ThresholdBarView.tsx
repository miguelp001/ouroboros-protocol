// The Threshold Bar Sanctuary Viewport Component
// Implements the atmospheric 1860s impossible taproom sanctuary, Bartender consultations,
// House Rye orders, Chalk Slate strategy wall, and Threshold Key deployment doorway.

import React, { useState, useEffect } from 'react';
import { 
  Wine, 
  Key, 
  Flame, 
  MessageSquare, 
  DoorOpen, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { useGameStore } from '../../engine/store';
import { soundFx } from '../../audio/soundFx';
import { TaproomSeating } from './TaproomSeating';
import { 
  BARTENDER_TOPICS, 
  orderHouseWhiskey, 
  getBartenderFactionIntel, 
  exitThresholdBarToField 
} from '../../engine/sanctuaryEngine';
import { MAP_NODES } from '../../data/transitMapData';
import { getLocationBackground } from '../../utils/assets';

interface ThresholdBarViewProps {
  onDeployToField?: (nodeId: string) => void;
}

export const ThresholdBarView: React.FC<ThresholdBarViewProps> = ({
  onDeployToField,
}) => {
  const store = useGameStore();
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [bartenderResponse, setBartenderResponse] = useState<string | null>(null);
  const [whiskeyFeedback, setWhiskeyFeedback] = useState<string | null>(null);
  const [ambientAudioOn, setAmbientAudioOn] = useState(false);
  const [isTick, setIsTick] = useState(false);

  // Grandfather Clock Tick-Tock Interval when ambient audio is active
  useEffect(() => {
    if (!ambientAudioOn) return;

    const interval = setInterval(() => {
      setIsTick((prev) => {
        const next = !prev;
        soundFx.playClockTick(next);
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [ambientAudioOn]);

  const handleSelectTopic = (topicId: string) => {
    soundFx.playClick();
    setActiveTopic(topicId);
    setWhiskeyFeedback(null);

    if (topicId === 'factions') {
      setBartenderResponse(getBartenderFactionIntel());
    } else {
      const topic = BARTENDER_TOPICS.find((t) => t.id === topicId);
      setBartenderResponse(topic ? topic.response : null);
    }
  };

  const handleOrderWhiskey = () => {
    const res = orderHouseWhiskey();
    setWhiskeyFeedback(res.message);
    setBartenderResponse(null);
  };

  const handleDoorExit = (nodeId: string = 'S-01') => {
    exitThresholdBarToField(nodeId);
    if (onDeployToField) {
      onDeployToField(nodeId);
    }
  };

  const keys = store.agency.keys;
  const hasThreshold = keys.includes('THRESHOLD_KEY');
  const hasSkeleton = keys.includes('SKELETON_KEY');
  const hasGhost = keys.includes('GHOST_KEY');

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* 1860s Sanctuary Atmosphere Banner */}
      <div className="relative rounded-lg border-2 border-amber-900/70 bg-stone-950 p-5 shadow-lg shadow-amber-950/30 overflow-hidden">
        {/* Diegetic Sanctuary Background Backdrop */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-45 filter contrast-125 pointer-events-none"
          style={{ backgroundImage: `url(${getLocationBackground('bar')})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/75 to-amber-950/60 pointer-events-none" />

        {/* Ambient Candlelight Glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-950 border border-amber-700/60 text-amber-400">
              <Wine className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-500 font-bold flex items-center gap-1.5">
                <Flame className="h-3 w-3 text-amber-400 animate-pulse" />
                SANCTUARY ZONE // OFF-GRID EXTRA-SPATIAL TAPROOM
              </div>
              <h3 className="text-base font-bold text-amber-100 tracking-tight">
                THE THRESHOLD BAR (EST. 1860)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Grandfather Clock Tick Indicator & Toggle */}
            <button
              onClick={() => {
                const nextState = !ambientAudioOn;
                setAmbientAudioOn(nextState);
                if (nextState) soundFx.playClockTick(false);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors flex items-center gap-1.5 ${
                ambientAudioOn
                  ? 'border-amber-500 bg-amber-950/80 text-amber-200'
                  : 'border-stone-800 bg-stone-900 text-zinc-500 hover:text-zinc-300'
              }`}
              title="Toggle Grandfather Clock ambient pendulum ticking"
            >
              {ambientAudioOn ? <Volume2 className="h-3.5 w-3.5 text-amber-400" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span>CLOCK PENDULUM [{isTick ? 'TICK' : 'TOCK'}]</span>
            </button>
          </div>
        </div>

        <p className="mt-3 text-zinc-400 leading-relaxed max-w-3xl">
          Rain and cyber-static die beyond the iron threshold. In here, a wood-burning stove crackles, 
          the 1860s grandfather clock measures timeless hours, and the scarred mahogany bar preserves every sacrifice.
        </p>
      </div>

      {/* The Chalk Slate Strategy Wall */}
      <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
          <div className="flex items-center gap-2 text-zinc-300 font-bold">
            <Key className="h-4 w-4 text-amber-400" />
            <span className="uppercase text-[11px] tracking-wider">THE CHALK SLATE // AGENCY STRATEGY WALL</span>
          </div>
          <div className="text-[10px] text-zinc-400">
            AGENCY LEVEL: <strong className="text-hazard">RANK {store.agency.level}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Discovered Keys Pinboard */}
          <div className="p-3 rounded bg-stone-900/60 border border-stone-800 space-y-2">
            <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
              THE THREE KEYS ({keys.length}/3)
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className={hasThreshold ? 'text-amber-300 font-bold' : 'text-zinc-600'}>
                  1. THRESHOLD KEY
                </span>
                <span className={hasThreshold ? 'text-emerald-400 text-[10px]' : 'text-zinc-600 text-[10px]'}>
                  {hasThreshold ? '[ACQUIRED]' : '[LOCKED]'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={hasSkeleton ? 'text-amber-300 font-bold' : 'text-zinc-600'}>
                  2. SKELETON KEY
                </span>
                <span className={hasSkeleton ? 'text-emerald-400 text-[10px]' : 'text-zinc-600 text-[10px]'}>
                  {hasSkeleton ? '[ACQUIRED]' : '[LOCKED]'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={hasGhost ? 'text-amber-300 font-bold' : 'text-zinc-600'}>
                  3. GHOST KEY
                </span>
                <span className={hasGhost ? 'text-emerald-400 text-[10px]' : 'text-zinc-600 text-[10px]'}>
                  {hasGhost ? '[ACQUIRED]' : '[LOCKED]'}
                </span>
              </div>
            </div>
          </div>

          {/* Bar Counter Notches */}
          <div className="p-3 rounded bg-stone-900/60 border border-stone-800 space-y-1.5">
            <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
              MAHOGANY BAR NOTCHES
            </div>
            <div className="text-2xl font-black text-amber-200">
              {store.notchesOnBar}
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              {store.notchesOnBar === 0 
                ? 'No vigils carved yet. The oak counter remains unscarred.'
                : `${store.notchesOnBar} fallen comrade(s) carved into the edge with rye toasts.`}
            </p>
          </div>

          {/* Roster Readiness */}
          <div className="p-3 rounded bg-stone-900/60 border border-stone-800 space-y-1.5">
            <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
              ROSTER READINESS
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">
                {store.roster.filter(o => o.status === 'ACTIVE').length}
              </span>
              <span className="text-zinc-400 text-[11px]">ACTIVE OPERATIVES</span>
            </div>
            <div className="text-[10px] text-zinc-400">
              MORTALITY: <strong className="text-crisis">{store.roster.filter(o => o.status === 'DEAD').length} K.I.A.</strong>
            </div>
          </div>
        </div>
      </div>

      {/* The Bartender Consultation Station */}
      <div className="rounded-lg border border-amber-900/60 bg-stone-900/80 p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <MessageSquare className="h-4 w-4 text-amber-500" />
            <span className="uppercase text-[11px] tracking-wider">CONSULT THE BARTENDER</span>
          </div>
          <span className="text-[10px] text-zinc-400">CHIP CREDS: <strong className="text-amber-400">{store.economy.chipCred}C</strong></span>
        </div>

        {/* Dialogue Prompts & House Special Button */}
        <div className="flex flex-wrap gap-2">
          {BARTENDER_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleSelectTopic(topic.id)}
              className={`px-3 py-1.5 rounded border text-[11px] font-bold transition-colors ${
                activeTopic === topic.id
                  ? 'border-amber-400 bg-amber-500 text-stone-950'
                  : 'border-amber-900/70 bg-stone-950 text-amber-200 hover:border-amber-500'
              }`}
            >
              {topic.title}
            </button>
          ))}

          <button
            onClick={handleOrderWhiskey}
            className="px-3 py-1.5 rounded border border-amber-500 bg-amber-900/40 hover:bg-amber-600 hover:text-stone-950 text-amber-100 font-bold text-[11px] transition-colors flex items-center gap-1.5 shadow-sm"
            title="Cost: 20 Chip Creds. Restores Agent 0 to full HP and boosts companion Morale +10."
          >
            <Wine className="h-3.5 w-3.5 text-amber-400" />
            ORDER HOUSE RYE (-20C)
          </button>
        </div>

        {/* Bartender Speech Output */}
        {(bartenderResponse || whiskeyFeedback) && (
          <div className="p-3.5 rounded border border-amber-800/70 bg-stone-950 text-xs text-amber-100 space-y-1 animate-fadeIn">
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              THE BARTENDER SAYS:
            </div>
            <p className="leading-relaxed italic text-zinc-200">
              {whiskeyFeedback ?? bartenderResponse}
            </p>
          </div>
        )}
      </div>

      {/* The Physical 15 Mahogany Bar Stools */}
      <TaproomSeating roster={store.roster} />

      {/* The Iron Door (Field Return Deployment) */}
      <div className="p-4 rounded-lg border border-amber-900/60 bg-gradient-to-r from-stone-950 to-stone-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-stone-900 border border-stone-800 text-amber-400">
            <DoorOpen className="h-5 w-5" />
          </div>
          <div>
            <h5 className="font-bold text-amber-100 text-xs">THE HEAVY IRON DOORWAY</h5>
            <p className="text-[11px] text-zinc-400">
              Turn the Threshold Key to step back through into the subterranean transit lines.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleDoorExit(store.activeLocation === 'THRESHOLD_BAR' ? 'S-01' : store.activeLocation)}
          className="py-2.5 px-4 rounded font-bold text-xs uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-stone-950 flex items-center gap-2 transition-all shadow-md shadow-amber-950/50"
        >
          <Key className="h-3.5 w-3.5" />
          <span>
            STEP THROUGH TO {
              store.activeLocation === 'THRESHOLD_BAR' 
                ? 'PONTOON JUNCTION (S-01)' 
                : (MAP_NODES[store.activeLocation]?.name 
                    ? `${MAP_NODES[store.activeLocation].name.toUpperCase()} (${store.activeLocation})`
                    : store.activeLocation)
            }
          </span>
        </button>
      </div>
    </div>
  );
};
