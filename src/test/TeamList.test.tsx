import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import TeamList from '../pages/TeamList';
import { supabase } from '../lib/supabase';
import { mockTeams } from '../lib/mockData';
import { mockLoginAs, TEST_USERS } from '../lib/utils';

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
    from: vi.fn()
  },
}));

// Mock authentication
vi.mock('../components/AuthContext', () => ({
    useAuth: vi.fn(),
}));

beforeEach(() => {
    vi.resetAllMocks();
});

describe('TeamList', () => {
  it('displays a message when no records are found', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
        }),
    } as any);
    
    mockLoginAs(TEST_USERS.USER);

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
        select: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'connection failed' } }),
        }),
    } as any);
    
    mockLoginAs(TEST_USERS.USER);

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
        select: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockResolvedValueOnce({ data: mockTeams, error: null } ),
        }),
    } as any);
    
    mockLoginAs(TEST_USERS.USER);

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
  
  it('displays add personnel button only for admins', async () =>{
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ data: mockTeams, error: null }),
        })
    } as any);

    mockLoginAs(TEST_USERS.ADMIN);
    
    render(
        <MemoryRouter>
            <TeamList />
        </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: 'Add Team' }));
  });
    
  it('hides add personnel button for officers', async () =>{
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ data: mockTeams, error: null }),
        })
    } as any);
  
  mockLoginAs(TEST_USERS.OFFICER);
  
    render(
        <MemoryRouter>
            <TeamList />
        </MemoryRouter>
    );

    await screen.findByText(/SG-1/);

    const addBtn = screen.queryByRole('button', { name: 'Add Team' });
    expect(addBtn).not.toBeInTheDocument();
  });

  it('hides add personnel button for standard users', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ data: mockTeams, error: null }),
        })
    } as any);
    
    mockLoginAs(TEST_USERS.USER);
    
    render(
        <MemoryRouter>
            <TeamList />
        </MemoryRouter>
    );

    await screen.findByText(/SG-1/);

    const addBtn = screen.queryByRole('button', { name: 'Add Team' });
    expect(addBtn).not.toBeInTheDocument();
  });
});