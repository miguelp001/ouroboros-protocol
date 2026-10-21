import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VaultZeroEndgameView } from './VaultZeroEndgameView';
import { useGameStore } from '../../engine/store';
import { INITIAL_GAME_STATE } from '../../engine/initialState';

describe('VaultZeroEndgameView Component (Master GDD Section 6.3)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useGameStore.setState({
      ...INITIAL_GAME_STATE,
      time: { day: 12, shift: 'NIGHT', fatigued: false },
      notchesOnBar: 3,
      economy: { chipCred: 300, digitalCred: 500, heat: { apex: 0, redoubt: 0, syndicate: 0, archive: 0 } },
      roster: [
        {
          id: 'agent_0',
          name: 'Vance',
          callsign: 'Cipher',
          role: 'Enforcer',
          stats: { scrap: 2, cover: 1, reckon: 0, tether: -1 },
          status: 'ACTIVE',
          hp: 10,
          maxHp: 10,
          morale: 80,
          activeAssignment: null,
          loyaltyPerk: 'Veteran Instincts',
          epitaphLedger: [],
        },
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders Stage 1: The Triple-Lock Gateway and handles key rotation', () => {
    const handleComplete = vi.fn();
    render(<VaultZeroEndgameView onComplete={handleComplete} />);

    expect(screen.getByText(/THE TRIPLE-LOCK GATEWAY/i)).toBeInTheDocument();
    expect(screen.getByText(/THE THRESHOLD KEY/i)).toBeInTheDocument();
    expect(screen.getByText(/THE SKELETON KEY/i)).toBeInTheDocument();
    expect(screen.getByText(/THE GHOST KEY/i)).toBeInTheDocument();

    const rotateBtn = screen.getByRole('button', { name: /ROTATE THE THREE KEYS IN SYNCHRONIZATION/i });
    fireEvent.click(rotateBtn);

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.getByRole('button', { name: /BREACH COMPLETED \/\/ DESCEND INTO VAULT CORE/i })).toBeInTheDocument();
  });

  it('walks through all stages up to Epilogue choice and Victory Dossier', () => {
    const handleComplete = vi.fn();
    const handleEnterDirector = vi.fn();
    render(
      <VaultZeroEndgameView 
        onComplete={handleComplete} 
        onEnterDirectorMode={handleEnterDirector} 
      />
    );

    // Stage 1 -> Rotate Keys
    fireEvent.click(screen.getByRole('button', { name: /ROTATE THE THREE KEYS IN SYNCHRONIZATION/i }));
    act(() => {
      vi.advanceTimersByTime(700);
    });

    // Stage 1 -> Stage 2
    fireEvent.click(screen.getByRole('button', { name: /BREACH COMPLETED \/\/ DESCEND INTO VAULT CORE/i }));
    expect(screen.getByText(/THE AUTOMATED DEFENSE GRID/i)).toBeInTheDocument();

    // Stage 2 -> Stage 3
    fireEvent.click(screen.getByRole('button', { name: /APPROACH THE CRYOGENIC SARCOPHAGUS/i }));
    expect(screen.getByText(/DR\. JONATHAN VANCE IN STASIS/i)).toBeInTheDocument();

    // Stage 3 -> Stage 4
    fireEvent.click(screen.getByRole('button', { name: /EXAMINE THE TWO RELICS OF CREATION/i }));
    expect(screen.getByText(/THE THREE-DROP VIAL & THE ALL-CUTTING EDGE/i)).toBeInTheDocument();

    // Stage 4 -> Stage 5
    fireEvent.click(screen.getByRole('button', { name: /DECIDE THE FATE OF VAULT ZERO \/\/ CHOOSE EPILOGUE/i }));
    expect(screen.getByText(/SELECT THE CAMPAIGN FINALE/i)).toBeInTheDocument();

    // Select NEW_ORDER epilogue
    const newOrderBtn = screen.getByRole('button', { name: /NEW_ORDER/i });
    fireEvent.click(newOrderBtn);

    // Execute Decision -> Stage 6
    fireEvent.click(screen.getByRole('button', { name: /EXECUTE DECISION \/\/ SEAL THE OUROBOROS PROTOCOL/i }));
    expect(screen.getByText(/CAMPAIGN CONCLUDED \/\/ EPILOGUE SEALED/i)).toBeInTheDocument();
    expect(screen.getByText(/THE NEW ORDER \/\/ HEGEMONY OF THE AGELESS/i)).toBeInTheDocument();
    expect(screen.getByText(/DIRECTOR MODE UNLOCKED \/\/ PHASE 24/i)).toBeInTheDocument();

    // Click Return or Director Mode
    const directorBtn = screen.getByRole('button', { name: /COMMENCE DIRECTOR MODE/i });
    fireEvent.click(directorBtn);
    expect(handleEnterDirector).toHaveBeenCalledTimes(1);
  });
});
