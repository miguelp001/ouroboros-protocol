import React, { useState } from 'react';
import { SlateScanlines } from './SlateScanlines';
import { SlateHeader } from './SlateHeader';
import { soundFx } from '../../audio/soundFx';
import { useGameStore } from '../../engine/store';

interface SlateContainerProps {
  children: React.ReactNode;
  activeSectorName?: string;
}

export const SlateContainer: React.FC<SlateContainerProps> = ({
  children,
}) => {
  const [isTilted, setIsTilted] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const isInterrupt = useGameStore((state) => state.isInterrupt);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFx.setMuted(next);
  };

  return (
    <div className="min-h-screen w-screen bg-noir-ink text-noir-chalk flex items-center justify-center p-2 sm:p-4 md:p-6 relative overflow-hidden select-none">
      {/* Background Ambience Layer: Rain and moisture shadow */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-noir-ink to-noir-ink pointer-events-none" 
      />

      {/* Diegetic 3D Slate Perspective Container */}
      <div className={`w-full max-w-5xl h-[92vh] flex flex-col ${isTilted ? 'slate-perspective' : ''}`}>
        <div 
          className={`
            relative w-full h-full flex flex-col bg-noir-surface rounded-xl overflow-hidden transition-all duration-300
            ${isInterrupt 
              ? 'border-2 border-crisis shadow-[0_0_35px_rgba(239,68,68,0.35)]' 
              : 'border-2 border-noir-border shadow-slate-bevel'}
            ${isTilted ? 'slate-tilt' : ''}
          `}
        >
          {/* Bezel Screw Rivets (Top-Left, Top-Right, Bottom-Left, Bottom-Right) */}
          <div aria-hidden="true" className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full border border-zinc-700 bg-zinc-900 z-50 pointer-events-none" />
          <div aria-hidden="true" className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full border border-zinc-700 bg-zinc-900 z-50 pointer-events-none" />
          <div aria-hidden="true" className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full border border-zinc-700 bg-zinc-900 z-50 pointer-events-none" />
          <div aria-hidden="true" className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full border border-zinc-700 bg-zinc-900 z-50 pointer-events-none" />

          {/* CRT Shaders, Film Grain & Glass Fracture Overlays */}
          <SlateScanlines />

          {/* Diegetic Slate Bezel Header */}
          <SlateHeader 
            isTilted={isTilted}
            onToggleTilt={() => setIsTilted(!isTilted)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />

          {/* Inner Content Area */}
          <div className="relative z-20 flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
