import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SlateContainer } from './SlateContainer';
import { SlateButton } from './SlateButton';
import { SlateTabs } from './SlateTabs';
import { soundFx } from '../../audio/soundFx';

describe('Diegetic Slate UI Components', () => {
  it('renders SlateContainer with telemetry and children', () => {
    render(
      <SlateContainer>
        <div data-testid="child-content">Terminal Slate Content</div>
      </SlateContainer>
    );

    expect(screen.getByText(/OUROBOROS SLATE-4B/i)).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toHaveTextContent('Terminal Slate Content');
  });

  it('toggles perspective tilt on header button click', () => {
    render(
      <SlateContainer>
        <div>Content</div>
      </SlateContainer>
    );

    const tiltButton = screen.getByTitle(/Flatten Perspective View/i);
    expect(tiltButton).toBeInTheDocument();

    fireEvent.click(tiltButton);
    expect(screen.getByTitle(/Enable Diegetic 3D Slate Perspective/i)).toBeInTheDocument();
  });

  it('toggles audio mute status', () => {
    render(
      <SlateContainer>
        <div>Content</div>
      </SlateContainer>
    );

    const muteButton = screen.getByTitle(/Mute Diegetic SFX/i);
    fireEvent.click(muteButton);
    expect(soundFx.getMuted()).toBe(true);

    const unmuteButton = screen.getByTitle(/Unmute Diegetic SFX/i);
    fireEvent.click(unmuteButton);
    expect(soundFx.getMuted()).toBe(false);
  });

  it('renders SlateButton and triggers audio click', () => {
    const playClickSpy = vi.spyOn(soundFx, 'playClick');
    const handleClick = vi.fn();

    render(
      <SlateButton onClick={handleClick}>
        Engage Protocol
      </SlateButton>
    );

    const button = screen.getByRole('button', { name: /Engage Protocol/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(playClickSpy).toHaveBeenCalled();
  });

  it('disables SlateButton and prevents click callbacks', () => {
    const handleClick = vi.fn();

    render(
      <SlateButton disabled onClick={handleClick}>
        Locked Action
      </SlateButton>
    );

    const button = screen.getByRole('button', { name: /Locked Action/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('switches tabs in SlateTabs', () => {
    const handleTabChange = vi.fn();

    render(
      <SlateTabs
        activeTab="slate"
        onTabChange={handleTabChange}
        activeRosterCount={15}
        notchesOnBar={2}
        hasPendingWakes={false}
      />
    );

    const mapButton = screen.getByRole('button', { name: /02 \/\/ TRANSIT/i });
    fireEvent.click(mapButton);
    expect(handleTabChange).toHaveBeenCalledWith('map');
  });
});
