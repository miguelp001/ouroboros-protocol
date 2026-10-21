import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Diegetic Slate App Scaffolding', () => {
  it('renders the diegetic HUD header and active sector', () => {
    render(<App />);
    expect(screen.getByText(/OUROBOROS SLATE-4B/i)).toBeInTheDocument();
    expect(screen.getByText(/THE SUBMERGED SPUR \/\/ PONTOON JUNCTION/i)).toBeInTheDocument();
  });

  it('allows switching between navigation tabs', () => {
    render(<App />);
    const mapTab = screen.getByRole('button', { name: /02 \/\/ TRANSIT/i });
    fireEvent.click(mapTab);
    expect(screen.getByText(/VIGNELLI TRANSIT SCHEMATIC/i)).toBeInTheDocument();
  });

  it('simulates a PbtA 2d6 action check', () => {
    render(<App />);
    const scrapButton = screen.getByRole('button', { name: /\[SCRAP \+/i });
    fireEvent.click(scrapButton);
    expect(screen.getByText(/PBTA RESOLUTION TRAY/i)).toBeInTheDocument();
  });
});
