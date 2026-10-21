import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrologueView } from './PrologueView';

describe('PrologueView Diegetic Onboarding Component', () => {
  it('renders Beat 0 with character archetype selection and stat arrays', () => {
    const handleComplete = vi.fn();
    render(<PrologueView onComplete={handleComplete} />);

    expect(screen.getByText(/ORIGIN SCRIPT \/\/ SECTOR ZERO PROTOCOL/i)).toBeInTheDocument();
    expect(screen.getByText(/SELECT AGENT 0 BACKGROUND PROFILE/i)).toBeInTheDocument();
    expect(screen.getByText(/Warden Defector/i)).toBeInTheDocument();
    expect(screen.getByText(/Apex Ghost Operative/i)).toBeInTheDocument();
    expect(screen.getByText(/Archive Cryptographer/i)).toBeInTheDocument();
    expect(screen.getByText(/Sub-Level Diviner/i)).toBeInTheDocument();
  });

  it('selects an archetype and advances to Beat 1 (Culvert Chase)', () => {
    const handleComplete = vi.fn();
    render(<PrologueView onComplete={handleComplete} />);

    const ghostBtn = screen.getByText(/Apex Ghost Operative/i);
    fireEvent.click(ghostBtn);

    const initBtn = screen.getByRole('button', { name: /INITIALIZE RECOVERY RUN/i });
    fireEvent.click(initBtn);

    expect(screen.getByText(/THE CULVERT SPRINT/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 3 Shifting Hound/i)).toBeInTheDocument();
  });

  it('allows quick-start skip invoking onComplete callback', () => {
    const handleComplete = vi.fn();
    render(<PrologueView onComplete={handleComplete} />);

    const skipBtn = screen.getByRole('button', { name: /SKIP PROLOGUE \(QUICK START\)/i });
    fireEvent.click(skipBtn);

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });
});
