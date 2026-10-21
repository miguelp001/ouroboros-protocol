import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DirectorModeView } from './DirectorModeView';
import { useGameStore } from '../../engine/store';
import { INITIAL_GAME_STATE } from '../../engine/initialState';
import { directorEngine } from '../../engine/directorEngine';

describe('DirectorModeView Component (Master GDD Phase 24)', () => {
  beforeEach(() => {
    useGameStore.setState({
      ...INITIAL_GAME_STATE,
      economy: {
        chipCred: 100,
        digitalCred: 100,
        heat: { sink: 2, heights: 1, old_town: 3, redoubt: 0, scorch: 1 },
      },
      qualities: {
        campaign_victory: true,
        vault_zero_breached: true,
      },
    });
    directorEngine.resetCells();
  });

  it('renders header, subtabs, and default autonomous cells view', () => {
    const handleClose = vi.fn();
    render(<DirectorModeView onClose={handleClose} />);

    expect(screen.getByText(/DIRECTOR COMMAND CONSOLE \/\/ POST-GAME SANDBOX/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AUTONOMOUS CELLS/i })).toBeInTheDocument();
    expect(screen.getByText(/THREAT & HEAT TUNER/i)).toBeInTheDocument();
    expect(screen.getByText(/QUALITIES & RESERVES/i)).toBeInTheDocument();
    expect(screen.getByText(/Cell Alpha/i)).toBeInTheDocument();
    expect(screen.getByText(/Cell Bravo/i)).toBeInTheDocument();
    expect(screen.getByText(/Cell Charlie/i)).toBeInTheDocument();
  });

  it('allows switching to THREAT & HEAT TUNER and modifying sector heat', () => {
    const handleClose = vi.fn();
    render(<DirectorModeView onClose={handleClose} />);

    fireEvent.click(screen.getByRole('button', { name: /THREAT & HEAT TUNER/i }));
    expect(screen.getByText(/REGIONAL HEAT CONTROLLER/i)).toBeInTheDocument();
    expect(screen.getByText(/FACTION CLOCK SEGMENTS/i)).toBeInTheDocument();

    // Click heat level 5 for sink
    const heat5Buttons = screen.getAllByRole('button', { name: '5' });
    fireEvent.click(heat5Buttons[0]);

    expect(useGameStore.getState().economy.heat.sink).toBe(5);
  });

  it('allows switching to QUALITIES & RESERVES and injecting resources', () => {
    const handleClose = vi.fn();
    render(<DirectorModeView onClose={handleClose} />);

    fireEvent.click(screen.getByRole('button', { name: /QUALITIES & RESERVES/i }));
    expect(screen.getByText(/QUICK PAYLOAD INJECTORS/i)).toBeInTheDocument();

    const inject100Btn = screen.getByRole('button', { name: /\+100 Chip \/ \+100 Digi/i });
    fireEvent.click(inject100Btn);

    const store = useGameStore.getState();
    expect(store.economy.chipCred).toBe(200);
    expect(store.economy.digitalCred).toBe(200);
  });

  it('allows setting a custom quality and displays active qualities', () => {
    const handleClose = vi.fn();
    render(<DirectorModeView onClose={handleClose} />);

    fireEvent.click(screen.getByRole('button', { name: /QUALITIES & RESERVES/i }));

    const keyInput = screen.getByPlaceholderText(/Quality Key/i);
    const valInput = screen.getByPlaceholderText(/Value/i);
    const setBtn = screen.getByRole('button', { name: /SET QUALITY/i });

    fireEvent.change(keyInput, { target: { value: 'custom_director_flag' } });
    fireEvent.change(valInput, { target: { value: 'true' } });
    fireEvent.click(setBtn);

    expect(useGameStore.getState().qualities.custom_director_flag).toBe(true);
  });

  it('invokes onClose when clicking EXIT DIRECTOR MODE', () => {
    const handleClose = vi.fn();
    render(<DirectorModeView onClose={handleClose} />);

    const exitBtn = screen.getByRole('button', { name: /EXIT DIRECTOR MODE/i });
    fireEvent.click(exitBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
