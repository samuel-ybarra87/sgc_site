import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import TeamForm from '../pages/TeamForm';
import { supabase } from '../lib/supabase';
import userEvent from '@testing-library/user-event';
import TeamList from '../pages/TeamList';
import { mockTeamEntry, mockPersonnel, mockRoles, mockTeams } from '../lib/mockData';
import { PATHS, ROUTES } from '../lib/paths';
import { rankAbbreviations } from '../lib/rankAbbreviations';

const user = userEvent.setup();

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));


describe('TeamForm', () => {

  beforeEach(() =>{
    vi.resetAllMocks();
  });

  it('should show empty fields for new entries', () =>{

    // personnel
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
               order: vi.fn().mockReturnValueOnce({ data: mockPersonnel, error: null }),
            })
        })
      }),
    } as any);
    
    // teams
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({ data: [], error: null }),
    } as any);
    
    render(
        <MemoryRouter>
            <TeamForm />
        </MemoryRouter>
    );

    expect(screen.getByLabelText('Designation:')).toHaveValue('');
    expect(screen.getByLabelText('Commanding Officer:')).toHaveValue('');
    expect(screen.getByLabelText('Status:')).toHaveValue('active');
  });

  it('should insert values into database after clicking save', async () => {
    // Save to mock db
    const insertMock = vi.fn().mockResolvedValueOnce({ error: null });


    // personnel
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockReturnValueOnce({ data: mockPersonnel, error: null }),
          })
        })
      }),
    } as any);
    
    vi.mocked(supabase.from).mockReturnValueOnce({
        insert: insertMock,
    } as any);

    render(
        <MemoryRouter>
            <TeamForm />
        </MemoryRouter>
    );

    // Type into fields
    await user.type(screen.getByLabelText('Designation:'), mockTeamEntry.designation);
      // Select dropdown value
    await user.selectOptions(screen.getByLabelText('Commanding Officer:'), mockTeamEntry.commanding_officer);
    await user.selectOptions(screen.getByLabelText('Status:'), mockTeamEntry.status);

    // click save
    await user.click(screen.getByText('Save'));


    expect(insertMock).toHaveBeenCalled();
  });

  it('should display error message when insert fails', async () => {
    const insertMock = vi.fn().mockResolvedValueOnce({ error: { message: 'insert failed' } });


    // personnel
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
               order: vi.fn().mockReturnValueOnce({ data: mockPersonnel, error: null }),
            })
        })
      }),
    } as any);
    
    vi.mocked(supabase.from).mockReturnValueOnce({
        insert: insertMock,
    } as any);

    render(
      <MemoryRouter>
        <TeamForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Designation:'), mockTeamEntry.designation);
    await user.selectOptions(screen.getByLabelText('Commanding Officer:'), mockTeamEntry.commanding_officer);
    await user.selectOptions(screen.getByLabelText('Status:'), mockTeamEntry.status);

    // click save
    await user.click(screen.getByText('Save'));

    expect(insertMock).toHaveBeenCalled();
    const error = await screen.findByText('insert failed');
    expect(error).toBeInTheDocument();
  });

  it('should show error message if commanding_officer is empty', async () => {
    const insertMock = vi.fn().mockResolvedValueOnce({ error: null });


    // personnel
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
               order: vi.fn().mockReturnValueOnce({ data: mockPersonnel, error: null }),
            })
        })
      }),
    } as any);
    
    vi.mocked(supabase.from).mockReturnValueOnce({
        insert: insertMock,
    } as any);

    render(
      <MemoryRouter>
        <TeamForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Designation:'), mockTeamEntry.designation);
    await user.selectOptions(screen.getByLabelText('Status:'), mockTeamEntry.status);
    await user.click(screen.getByText('Save'));

    const err = await screen.getByText(/Please select a Commanding Officer/);
    expect(err).toBeInTheDocument();
  });

  it('should show values of record to edit', async () =>{

    // personnel
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
               order: vi.fn().mockReturnValueOnce({ data: mockPersonnel, error: null }),
            })
        })
      }),
    } as any);
    
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: mockTeams[0], error: null }),
        }),
      }),
    } as any);

    render(
        <MemoryRouter initialEntries={[PATHS.TEAM_EDIT(mockTeams[0].id)]}>
            <Routes>
                <Route path={ROUTES.TEAM_EDIT} element={<TeamForm />} />
            </Routes>
        </MemoryRouter>
    );

    expect(await screen.findByLabelText('Designation:')).toHaveValue("SG-1");
    expect(await screen.findByLabelText('Commanding Officer:')).toHaveDisplayValue("Col Jack O'Neill");
    expect(await screen.findByLabelText('Status:')).toHaveValue('active');
  });

  it('should update values into database after clicking save', async () => {
    // Populate mock database with data

    // personnel
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
               order: vi.fn().mockReturnValueOnce({ data: mockPersonnel, error: null }),
            })
        })
      }),
    } as any);

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: mockTeams[4], error: null }),
        }),
      }),
    } as any);

    const updateMock = vi.fn().mockReturnValueOnce({
      eq: vi.fn().mockResolvedValueOnce({ error: null }),
    });

    // Save to mock db
    vi.mocked(supabase.from).mockReturnValueOnce({
        update: updateMock,
    } as any);

    render(
        <MemoryRouter initialEntries={[PATHS.TEAM_EDIT(mockTeams[4].id)]}>
            <Routes>
                <Route path={ROUTES.TEAM_EDIT} element={<TeamForm />} />
            </Routes>
        </MemoryRouter>
    );

    // Type into fields
    await user.selectOptions(await screen.findByLabelText('Commanding Officer:'), mockPersonnel[0].id);
    // click save
    await user.click(screen.getByText('Save'));

    // Expected behavior
    expect(updateMock).toHaveBeenCalled();
  });

  it('should navigate back to team list when cancelling', async () =>{
    // Populate mock database with data
    // personnel
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
               order: vi.fn().mockReturnValueOnce({ data: mockPersonnel, error: null }),
            })
        })
      }),
    } as any);
    
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: mockTeams[1], error: null }),
        }),
      }),
    } as any);

    vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockResolvedValueOnce({ data: mockTeams, error: null }),
        } as any);

    render(
        <MemoryRouter initialEntries={[PATHS.TEAM_EDIT(mockTeams[1].id)]}>
            <Routes>
                <Route path={ROUTES.TEAM_EDIT} element={<TeamForm />} />
                <Route path={PATHS.TEAM_LIST} element={<TeamList />} />
            </Routes>
        </MemoryRouter>
    );

    await user.click(await screen.findByText('Cancel'));

    const title = await screen.findByText(/SGC Team List/);

    expect(title).toBeInTheDocument();
  });
});