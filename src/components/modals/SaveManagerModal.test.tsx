import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SaveManagerModal } from './SaveManagerModal';
import { persistenceEngine } from '../../engine/persistenceEngine';

describe('SaveManagerModal Diegetic Storage Terminal', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('renders memory banks and slots when open', () => {
    const handleClose = vi.fn();
    render(<SaveManagerModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText(/MEMORY CORE ARCHIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/AUTO-SAVE BANK/i)).toBeInTheDocument();
    expect(screen.getByText(/MEMORY BANK 01/i)).toBeInTheDocument();
    expect(screen.getByText(/MEMORY BANK 02/i)).toBeInTheDocument();
    expect(screen.getByText(/MEMORY BANK 03/i)).toBeInTheDocument();
  });

  it('saves game to slot 1 on button click and shows confirmation', () => {
    const handleClose = vi.fn();
    render(<SaveManagerModal isOpen={true} onClose={handleClose} />);

    const saveButtons = screen.getAllByRole('button', { name: /^SAVE$/i });
    expect(saveButtons.length).toBeGreaterThan(0);

    fireEvent.click(saveButtons[0]);
    expect(screen.getByText(/successfully saved to/i)).toBeInTheDocument();

    const meta = persistenceEngine.getSlotMetadata('slot_1');
    expect(meta).toBeDefined();
  });

  it('switches to JSON Export tab and presents export controls', () => {
    const handleClose = vi.fn();
    render(<SaveManagerModal isOpen={true} onClose={handleClose} />);

    const exportTab = screen.getByRole('button', { name: /JSON EXPORT/i });
    fireEvent.click(exportTab);

    expect(screen.getByText(/SELECT BANK TO ENCODE/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /COPY CIPHERTEXT/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /DOWNLOAD \.JSON/i })).toBeInTheDocument();
  });

  it('switches to Factory Reset tab and displays warning', () => {
    const handleClose = vi.fn();
    render(<SaveManagerModal isOpen={true} onClose={handleClose} />);

    const resetTab = screen.getByRole('button', { name: /FACTORY RESET/i });
    fireEvent.click(resetTab);

    expect(screen.getByText(/IRREVERSIBLE HARD RESET WARNING/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CONFIRM COMPLETE FACTORY WIPE/i })).toBeInTheDocument();
  });
});
