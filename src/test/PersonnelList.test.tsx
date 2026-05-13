import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PersonnelList from '../pages/PersonnelList';
import { supabase } from '../lib/supabase';
import { mockPersonnel } from '../lib/mockData';

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('PersonnelList', () => {
  it('displays a message when no records are found', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
        }),
    } as any);

    render(
      <MemoryRouter>
        <PersonnelList />
      </MemoryRouter>
    );

    const message = await screen.findByText('No personnel records found.');
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
        <PersonnelList />
      </MemoryRouter>
    );

    const message = await screen.findByText('No personnel records found.');
    expect(message).toBeInTheDocument();
  });

  it('displays personnel records when data is returned', async () =>{
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockResolvedValueOnce({ data: mockPersonnel, error: null }),
      })
    } as any);

    render(
      <MemoryRouter>
        <PersonnelList />
      </MemoryRouter>
    );

    const jack = await screen.findByText(/Col Jack O'Neill/);
    const daniel = await screen.findByText(/Dr. Daniel Jackson PHD/);
    expect(jack).toBeInTheDocument();
    expect(daniel).toBeInTheDocument();
  });
});