import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import TeamList from '../pages/TeamList';
import { supabase } from '../lib/supabase';
import { mockTeams } from '../lib/mockData';

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('TeamList', () => {
  it('displays a message when no records are found', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
    } as any);

    render(
      <MemoryRouter>
        <TeamList />
      </MemoryRouter>
    );

    const message = await screen.findByText('No team records found.');
    expect(message).toBeInTheDocument();
  });

  it('displays no records message when fetch fails', async () =>{
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'connection failed' } }),
    } as any);

    render(
      <MemoryRouter>
        <TeamList />
      </MemoryRouter>
    );

    const message = await screen.findByText('No team records found.');
    expect(message).toBeInTheDocument();
  });

  it('displays team records when data is returned', async () =>{
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce({ data: mockTeams, error: null }),
    } as any);

    render(
      <MemoryRouter>
        <TeamList />
      </MemoryRouter>
    );

    const unassigned = await screen.findByText(/Unassigned/);
    const sg_test = await screen.findByText(/SG-Test/);
    expect(unassigned).toBeInTheDocument();
    expect(sg_test).toBeInTheDocument();
  });
});