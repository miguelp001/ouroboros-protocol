import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiceTray } from './DiceTray';
import { DetailedRollResult } from '../../engine/pbta';

describe('DiceTray Component', () => {
  it('renders nothing when there is no rollResult and is not rolling', () => {
    const { container } = render(<DiceTray rollResult={null} isRolling={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders active dice and outcome banner for Clean Hit (10+)', () => {
    const mockResult: DetailedRollResult = {
      d1: 5,
      d2: 4,
      baseDiceTotal: 9,
      stat: 'scrap',
      statMod: 2,
      forwardMod: 0,
      fatigueMod: 0,
      helpOutResult: null,
      total: 11,
      tier: 'CLEAN_HIT',
      label: 'CLEAN HIT (10+)',
      narrativeSummary: 'Flawless execution. Objective achieved.',
    };

    render(<DiceTray rollResult={mockResult} isRolling={false} />);

    expect(screen.getByText(/PBTA RESOLUTION TRAY/i)).toBeInTheDocument();
    expect(screen.getByText(/TOTAL: 11/i)).toBeInTheDocument();
    expect(screen.getByText(/CLEAN HIT \(10\+\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Flawless execution/i)).toBeInTheDocument();
  });

  it('renders companion assist badge when Help Out succeeds', () => {
    const mockResult: DetailedRollResult = {
      d1: 3,
      d2: 3,
      baseDiceTotal: 6,
      stat: 'scrap',
      statMod: 1,
      forwardMod: 0,
      fatigueMod: 0,
      helpOutResult: {
        companion: {
          id: 'silas_vance',
          name: 'Silas Vance',
          callsign: 'BULLDOG',
          role: 'Enforcer',
          stats: { scrap: 2, cover: 0, reckon: -1, tether: 1 },
          status: 'ACTIVE',
          hp: 12,
          maxHp: 12,
          morale: 80,
          activeAssignment: null,
          epitaphLedger: [],
          loyaltyPerk: '',
        },
        statName: 'scrap',
        d1: 4,
        d2: 4,
        statMod: 2,
        total: 10,
        success: true,
      },
      total: 8,
      tier: 'COSTLY_ADVANCE',
      label: 'COSTLY ADVANCE (7-9)',
      narrativeSummary: 'Success at a cost.',
    };

    render(<DiceTray rollResult={mockResult} isRolling={false} />);

    expect(screen.getByText(/\+1 ASSIST/i)).toBeInTheDocument();
    expect(screen.getByText(/COSTLY ADVANCE \(7-9\)/i)).toBeInTheDocument();
  });
});
