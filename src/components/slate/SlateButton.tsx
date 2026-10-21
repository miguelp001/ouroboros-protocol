import React from 'react';
import { soundFx } from '../../audio/soundFx';

interface SlateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'hazard' | 'neutral' | 'crisis' | 'ghost';
  glow?: boolean;
  playAudio?: boolean;
}

export const SlateButton: React.FC<SlateButtonProps> = ({
  children,
  variant = 'hazard',
  glow = false,
  playAudio = true,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (playAudio) {
      if (variant === 'crisis') {
        soundFx.playGlitch();
      } else {
        soundFx.playClick();
      }
    }
    onClick?.(e);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'hazard':
        return 'border-hazard/70 text-hazard bg-hazard/10 hover:bg-hazard hover:text-noir-ink hover:border-hazard';
      case 'crisis':
        return 'border-crisis/80 text-crisis bg-crisis/10 hover:bg-crisis hover:text-white hover:border-crisis';
      case 'neutral':
        return 'border-noir-border text-noir-chalk bg-noir-surface hover:border-hazard hover:text-hazard hover:bg-noir-elevated';
      case 'ghost':
        return 'border-transparent text-noir-muted hover:text-noir-chalk hover:bg-noir-surface/60';
      default:
        return '';
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        px-3.5 py-2 font-mono text-xs uppercase tracking-wider font-bold rounded border transition-all duration-150
        active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
        ${getVariantStyles()}
        ${glow ? 'border-hazard-glow' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
