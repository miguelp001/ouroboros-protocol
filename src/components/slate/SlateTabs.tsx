import React from 'react';
import { Terminal, Map as MapIcon, Users, Key } from 'lucide-react';
import { soundFx } from '../../audio/soundFx';

export type SlateTabId = 'slate' | 'map' | 'roster' | 'bar';

interface SlateTabsProps {
  activeTab: SlateTabId;
  onTabChange: (tab: SlateTabId) => void;
  activeRosterCount: number;
  notchesOnBar: number;
  hasPendingWakes: boolean;
  isInterrupt?: boolean;
}

export const SlateTabs: React.FC<SlateTabsProps> = ({
  activeTab,
  onTabChange,
  activeRosterCount,
  notchesOnBar,
  hasPendingWakes,
  isInterrupt = false,
}) => {
  const tabs = [
    { id: 'slate' as SlateTabId, label: isInterrupt ? '01 // CRISIS LOCK' : '01 // DECK', icon: Terminal },
    { id: 'map' as SlateTabId, label: '02 // TRANSIT', icon: MapIcon },
    { id: 'roster' as SlateTabId, label: `03 // ROSTER (${activeRosterCount})`, icon: Users },
    { id: 'bar' as SlateTabId, label: `04 // BAR (${notchesOnBar})`, icon: Key },
  ];

  return (
    <nav className="relative z-30 flex border-b border-noir-border bg-noir-surface/70 text-xs font-mono">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isLockedOut = isInterrupt && tab.id !== 'slate';

        return (
          <button
            key={tab.id}
            disabled={isLockedOut}
            onClick={() => {
              if (isLockedOut) return;
              soundFx.playClick();
              onTabChange(tab.id);
            }}
            title={isLockedOut ? 'LOCKED: Resolve active crisis interrupt before traversing' : ''}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-2 border-r last:border-r-0 border-noir-border transition-colors ${
              isLockedOut
                ? 'opacity-30 cursor-not-allowed text-zinc-600 bg-noir-ink/80'
                : isActive 
                ? isInterrupt 
                  ? 'bg-crisis/20 text-crisis font-bold border-b-2 border-b-crisis'
                  : 'bg-noir-elevated text-hazard font-bold border-b-2 border-b-hazard' 
                : 'text-noir-muted hover:text-noir-chalk hover:bg-noir-ink/40'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${
              isLockedOut 
                ? 'text-zinc-600' 
                : isActive 
                ? isInterrupt ? 'text-crisis' : 'text-hazard' 
                : 'text-noir-muted'
            }`} />
            <span className="tracking-wider">{tab.label}</span>
            {tab.id === 'bar' && hasPendingWakes && (
              <span className="w-2 h-2 rounded-full bg-crisis animate-ping ml-1" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
