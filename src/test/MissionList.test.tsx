import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import MissionList from '../pages/MissionList';
import { supabase } from '../lib/supabase';
import { mockMissions } from '../lib/mockData';

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('MissionList', () => {
  it('displays a message when no records are found', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
        }),
    } as any);

    render(
      <MemoryRouter>
        <MissionList />
      </MemoryRouter>
    );

    const message = await screen.findByText('No mission records found.');
    expect(message).toBeInTheDocument();
  });

  it('displays no records message when fetch fails', async () =>{
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'connection failed' } }),
        }),
    } as any);

    render(
      <MemoryRouter>
        <MissionList />
      </MemoryRouter>
    );

    const message = await screen.findByText('No mission records found.');
    expect(message).toBeInTheDocument();
  });

  it('displays mission records when data is returned', async () =>{
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockResolvedValueOnce({ data: mockMissions, error: null } ),
        }),
    } as any);

    render(
      <MemoryRouter>
        <MissionList />
      </MemoryRouter>
    );

    const abydos = await screen.findByText(/Abydos Recon/);
    const mission = await screen.findByText(/MockMission/);
    expect(abydos).toBeInTheDocument();
    expect(mission).toBeInTheDocument();
  });
});