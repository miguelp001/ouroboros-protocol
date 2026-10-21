import React from 'react';

interface SlateScanlinesProps {
  showFracture?: boolean;
}

export const SlateScanlines: React.FC<SlateScanlinesProps> = ({ showFracture = true }) => {
  return (
    <>
      {/* 35mm Scanlines layer */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 scanlines z-40 pointer-events-none opacity-75" 
      />

      {/* CRT Vignette Depth Curve */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 crt-vignette z-40 pointer-events-none" 
      />

      {/* Screen Glass Fracture Overlay */}
      {showFracture && (
        <div 
          aria-hidden="true"
          className="absolute inset-0 glass-fracture z-40 pointer-events-none opacity-40" 
        />
      )}

      {/* Heavy Sin City 35mm Gritty Film Grain */}
      <div 
        aria-hidden="true"
        className="film-grain film-grain-animated" 
      />

      {/* CRT Horizontal Phosphor Scan Beam */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-transparent via-hazard/5 to-transparent h-24 w-full z-40 pointer-events-none animate-[scanline_8s_linear_infinite]"
        style={{
          animation: 'scanline 9s linear infinite',
        }}
      />
    </>
  );
};
