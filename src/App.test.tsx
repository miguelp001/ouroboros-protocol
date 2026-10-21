import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import { useGameStore } from './engine/store';

describe('Diegetic Slate App Scaffolding', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('renders the diegetic HUD header and active sector', () => {
    render(<App />);
    expect(screen.getByText(/OUROBOROS SLATE-4B/i)).toBeInTheDocument();
    expect(screen.getByText(/THE SUBMERGED SPUR \/\/ PONTOON JUNCTION/i)).toBeInTheDocument();
  });

  it('locks Transit, Roster, and Bar tabs until prologue is completed, then allows switching', () => {
    const { unmount } = render(<App />);
    // Before prologue completion, 02 // TRANSIT [LOCKED] is disabled
    const lockedMapTab = screen.getByRole('button', { name: /02 \/\/ TRANSIT \[LOCKED\]/i });
    expect(lockedMapTab).toBeDisabled();

    // Complete prologue in store
    act(() => {
      useGameStore.setState({
        qualities: {
          ...useGameStore.getState().qualities,
          prologue_completed: true,
        },
      });
    });
    unmount();

    // Now tabs are unlocked
    render(<App />);
    const mapTab = screen.getByRole('button', { name: /02 \/\/ TRANSIT$/i });
    expect(mapTab).not.toBeDisabled();
    fireEvent.click(mapTab);
    expect(screen.getByText(/VIGNELLI TRANSIT SCHEMATIC/i)).toBeInTheDocument();
  });

  it('simulates a PbtA 2d6 action check on the prologue storylet', () => {
    render(<App />);
    const scrapButton = screen.getByRole('button', { name: /\[SCRAP \+/i });
    fireEvent.click(scrapButton);
    expect(screen.getByText(/PBTA RESOLUTION TRAY/i)).toBeInTheDocument();
  });
});
