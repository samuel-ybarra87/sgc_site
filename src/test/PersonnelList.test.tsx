import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PersonnelList from '../pages/PersonnelList';
import { supabase } from '../lib/supabase';
import { mockPersonnel } from '../lib/mockData';
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

describe('PersonnelList', () => {
  it('displays a message when no records are found', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
        }),
    } as any);
    
    mockLoginAs(TEST_USERS.USER);

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
    
    mockLoginAs(TEST_USERS.USER);
    
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
    
    mockLoginAs(TEST_USERS.USER);
    
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

  it('displays add personnel button only for admins', async () =>{
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ data: mockPersonnel, error: null }),
        })
    } as any);

    mockLoginAs(TEST_USERS.ADMIN);
    
    render(
        <MemoryRouter>
            <PersonnelList />
        </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: 'Add Personnel' }));
  });
    
  it('hides add personnel button for officers', async () =>{
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ data: mockPersonnel, error: null }),
        })
    } as any);
  
  mockLoginAs(TEST_USERS.OFFICER);
  
    render(
        <MemoryRouter>
            <PersonnelList />
        </MemoryRouter>
    );

    await screen.findByText(/Col Jack O'Neill/);

    const addBtn = screen.queryByRole('button', { name: 'Add Personnel' });
    expect(addBtn).not.toBeInTheDocument();
  });

  it('hides add personnel button for standard users', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ data: mockPersonnel, error: null }),
        })
    } as any);
    
    mockLoginAs(TEST_USERS.USER);
    
    render(
        <MemoryRouter>
            <PersonnelList />
        </MemoryRouter>
    );

    await screen.findByText(/Col Jack O'Neill/);

    const addBtn = screen.queryByRole('button', { name: 'Add Personnel' });
    expect(addBtn).not.toBeInTheDocument();
  });
});