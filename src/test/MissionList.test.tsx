import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import MissionList from '../pages/MissionList';
import { supabase } from '../lib/supabase';
import { mockMissions } from '../lib/mockData';
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

describe('MissionList', () => {
  it('displays a message when no records are found', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
        }),
    } as any);

    mockLoginAs(TEST_USERS.USER);

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

    mockLoginAs(TEST_USERS.USER);

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

    mockLoginAs(TEST_USERS.USER);

    render(
      <MemoryRouter>
        <MissionList />
      </MemoryRouter>
    );

    const abydos = await screen.findByText(/Abydos Recon/);
    const mission = await screen.findByText(/Mock Mission/);
    expect(abydos).toBeInTheDocument();
    expect(mission).toBeInTheDocument();
  });

  it('displays add personnel button only for admins', async () =>{
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ data: mockMissions, error: null }),
        })
    } as any);

    mockLoginAs(TEST_USERS.ADMIN);
    
    render(
        <MemoryRouter>
            <MissionList />
        </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: 'Add Mission Record' }));
  });
    
  it('hides add personnel button for officers', async () =>{
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ data: mockMissions, error: null }),
        })
    } as any);
  
  mockLoginAs(TEST_USERS.OFFICER);
  
    render(
        <MemoryRouter>
            <MissionList />
        </MemoryRouter>
    );

    await screen.findByText(/Abydos/);

    const addBtn = screen.queryByRole('button', { name: 'Add Mission Record' });
    expect(addBtn).not.toBeInTheDocument();
  });

  it('hides add personnel button for standard users', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ data: mockMissions, error: null }),
        })
    } as any);
    
    mockLoginAs(TEST_USERS.USER);
    
    render(
        <MemoryRouter>
            <MissionList />
        </MemoryRouter>
    );

    await screen.findByText(/Abydos/);

    const addBtn = screen.queryByRole('button', { name: 'Add Mission Record' });
    expect(addBtn).not.toBeInTheDocument();
  });
});