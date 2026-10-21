import React from 'react';

interface DieCubeProps {
  value: number;
  isRolling?: boolean;
  color?: 'hazard' | 'chalk' | 'crisis';
}

export const DieCube: React.FC<DieCubeProps> = ({
  value,
  isRolling = false,
  color = 'hazard',
}) => {
  const getPipPositions = (val: number) => {
    switch (val) {
      case 1:
        return ['col-start-2 row-start-2'];
      case 2:
        return ['col-start-1 row-start-1', 'col-start-3 row-start-3'];
      case 3:
        return ['col-start-1 row-start-1', 'col-start-2 row-start-2', 'col-start-3 row-start-3'];
      case 4:
        return [
          'col-start-1 row-start-1', 'col-start-3 row-start-1',
          'col-start-1 row-start-3', 'col-start-3 row-start-3'
        ];
      case 5:
        return [
          'col-start-1 row-start-1', 'col-start-3 row-start-1',
          'col-start-2 row-start-2',
          'col-start-1 row-start-3', 'col-start-3 row-start-3'
        ];
      case 6:
        return [
          'col-start-1 row-start-1', 'col-start-3 row-start-1',
          'col-start-1 row-start-2', 'col-start-3 row-start-2',
          'col-start-1 row-start-3', 'col-start-3 row-start-3'
        ];
      default:
        return ['col-start-2 row-start-2'];
    }
  };

  const pipColor = color === 'hazard' 
    ? 'bg-hazard shadow-[0_0_6px_rgba(250,204,21,0.8)]' 
    : color === 'crisis'
    ? 'bg-crisis shadow-[0_0_6px_rgba(239,68,68,0.8)]'
    : 'bg-noir-chalk shadow-[0_0_6px_rgba(244,244,245,0.8)]';

  const borderColor = color === 'hazard'
    ? 'border-hazard/60'
    : color === 'crisis'
    ? 'border-crisis/60'
    : 'border-zinc-500/60';

  return (
    <div 
      className={`
        w-12 h-12 rounded-lg bg-zinc-950 border-2 ${borderColor} p-2 grid grid-cols-3 grid-rows-3
        shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_4px_8px_rgba(0,0,0,0.6)]
        transition-transform duration-200
        ${isRolling ? 'animate-bounce rotate-12 scale-105' : 'rotate-0 scale-100'}
      `}
      data-testid="die-cube"
      aria-label={`Die showing ${value}`}
    >
      {getPipPositions(value).map((pos, idx) => (
        <span 
          key={idx} 
          className={`w-2 h-2 rounded-full self-center justify-self-center ${pos} ${pipColor}`} 
        />
      ))}
    </div>
  );
};
