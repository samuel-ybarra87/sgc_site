import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PersonnelForm from '../pages/PersonnelForm';
import { supabase } from '../lib/supabase';
import userEvent from '@testing-library/user-event';
import PersonnelList from '../pages/PersonnelList';
import { mockEntry, mockPersonnel, mockRoles, mockTeams } from '../lib/mockData';
import { PATHS, ROUTES } from '../lib/paths';

const user = userEvent.setup();

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));


describe('PersonnelForm', () => {

  beforeEach(() =>{
    vi.resetAllMocks();
  });

  it('should show empty fields for new entries', () =>{
    // roles
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockRoles, error: null }),
      }),
    } as any);

    // teams
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
      }),
    } as any);
    
    // person
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({ data: [], error: null }),
    } as any);
    
    render(
        <MemoryRouter>
            <PersonnelForm />
        </MemoryRouter>
    );

    expect(screen.getByLabelText('Prefix:')).toHaveValue('');
    expect(screen.getByLabelText('First Name:')).toHaveValue('');
    expect(screen.getByLabelText('Middle Name:')).toHaveValue('');
    expect(screen.getByLabelText('Last Name:')).toHaveValue('');
    expect(screen.getByLabelText('Suffix:')).toHaveValue('');
    expect(screen.getByLabelText('Rank:')).toHaveValue('');
    expect(screen.getByLabelText('Team:')).toHaveValue('');
    expect(screen.getByLabelText('Role:')).toHaveDisplayValue('Custom');
    expect(screen.getByTitle('role')).toHaveValue('');
    expect(screen.getByLabelText('Personnel Type:')).toHaveValue('military');
    expect(screen.getByLabelText('Status:')).toHaveValue('active');
  });

  it('should insert values into database after clicking save', async () => {
    // Save to mock db
    const insertMock = vi.fn().mockResolvedValueOnce({ error: null });

    // roles
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockRoles, error: null }),
      }),
    } as any);

    // teams
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
      }),
    } as any);
    
    vi.mocked(supabase.from).mockReturnValueOnce({
        insert: insertMock,
    } as any);

    render(
        <MemoryRouter>
            <PersonnelForm />
        </MemoryRouter>
    );

    // Type into fields
    await user.type(screen.getByLabelText('First Name:'), mockEntry.first_name);
    await user.type(screen.getByLabelText('Middle Name:'), mockEntry.middle_name);
    await user.type(screen.getByLabelText('Last Name:'), mockEntry.last_name);
    await user.type(screen.getByLabelText('Suffix:'), mockEntry.suffix);
      // Select dropdown value
    await user.selectOptions(screen.getByLabelText('Role:'), mockEntry.role_id)
    await user.selectOptions(screen.getByLabelText('Team:'), mockEntry.team_id);
    await user.selectOptions(screen.getByLabelText('Rank:'), mockEntry.rank);
    await user.selectOptions(screen.getByLabelText('Prefix:'), mockEntry.prefix);
    await user.selectOptions(screen.getByLabelText('Personnel Type:'), mockEntry.personnel_type);
    await user.selectOptions(screen.getByLabelText('Status:'), mockEntry.status);

    // click save
    await user.click(screen.getByText('Save'));


    expect(insertMock).toHaveBeenCalled();
  });

  it('should display error message when insert fails', async () => {
    const insertMock = vi.fn().mockResolvedValueOnce({ error: { message: 'insert failed' } });

    // roles
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockRoles, error: null }),
      }),
    } as any);

    // teams
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
      }),
    } as any);
    
    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: insertMock,
    } as any);

    render(
      <MemoryRouter>
        <PersonnelForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('First Name:'), mockEntry.first_name);
    await user.type(screen.getByLabelText('Last Name:'), mockEntry.last_name);
    await user.selectOptions(screen.getByLabelText('Role:'), mockEntry.role_id);
    await user.selectOptions(screen.getByLabelText('Team:'), mockEntry.team_id);
    await user.click(screen.getByText('Save'));

    expect(insertMock).toHaveBeenCalled();
    const error = await screen.findByText('insert failed');
    expect(error).toBeInTheDocument();
  });

  it('should convert empty prefix, rank, and role_id to null on submit', async () => {
    const insertMock = vi.fn().mockResolvedValueOnce({ error: null });

    // roles
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockRoles, error: null }),
      }),
    } as any);

    // teams
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
      }),
    } as any);
    
    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: insertMock,
    } as any);

    render(
      <MemoryRouter>
        <PersonnelForm />
      </MemoryRouter>
    );

    await user.selectOptions(screen.getByLabelText('Role:'), '');
    await user.selectOptions(screen.getByLabelText('Team:'), mockEntry.team_id);
    await user.type(screen.getByTitle('role'), 'test-custom-role');
    await user.type(screen.getByLabelText('First Name:'), mockEntry.first_name);
    await user.type(screen.getByLabelText('Last Name:'), mockEntry.last_name);
    await user.click(screen.getByText('Save'));

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: null, rank: null, role_id: null, role: 'test-custom-role' })
    );
  });

  it('should show an error message if team is blank', async () => {
    // roles
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockRoles, error: null }),
      }),
    } as any);

    // teams
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
      }),
    } as any);

    render(
      <MemoryRouter>
        <PersonnelForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('First Name:'), mockEntry.first_name);
    await user.type(screen.getByLabelText('Last Name:'), mockEntry.last_name);
    await user.selectOptions(screen.getByLabelText('Role:'), mockEntry.role_id);
    await user.click(screen.getByText('Save'));

    const errorMsg = await screen.findByText(/Please select a team./);
    expect(errorMsg).toBeInTheDocument();
  });

  it('should show values of record to edit', async () =>{
    // roles
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockRoles, error: null }),
      }),
    } as any);

    // teams
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
      }),
    } as any);
    
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: mockPersonnel[0], error: null }),
        }),
      }),
    } as any);

    render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_EDIT(mockPersonnel[0].id)]}>
            <Routes>
                <Route path={ROUTES.PERSONNEL_EDIT} element={<PersonnelForm />} />
            </Routes>
        </MemoryRouter>
    );

    expect(await screen.findByLabelText('Prefix:')).toHaveValue("Mr.");
    expect(await screen.findByLabelText('First Name:')).toHaveValue("Jack");
    expect(await screen.findByLabelText('Middle Name:')).toHaveValue('');
    expect(await screen.findByLabelText('Last Name:')).toHaveValue("O'Neill");
    expect(await screen.findByLabelText('Suffix:')).toHaveValue('');
    expect(await screen.findByLabelText('Rank:')).toHaveValue('Colonel');
    expect(await screen.findByLabelText('Team:')).toHaveDisplayValue('SG-1');
    expect(await screen.findByLabelText('Role:')).toHaveValue('test-commander');
    expect(await screen.findByLabelText('Personnel Type:')).toHaveValue("military");
    expect(await screen.findByLabelText('Status:')).toHaveValue('active');
  });

  it('should update values into database after clicking save', async () => {
    // Populate mock database with data
    // roles
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockRoles, error: null }),
      }),
    } as any);

    // teams
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
      }),
    } as any);

    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: mockPersonnel[1], error: null }),
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
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_EDIT(mockPersonnel[1].id)]}>
            <Routes>
                <Route path={ROUTES.PERSONNEL_EDIT} element={<PersonnelForm />} />
            </Routes>
        </MemoryRouter>
    );

    // Type into fields
    await user.selectOptions(await screen.findByLabelText('Status:'), "kia");
    // click save
    await user.click(screen.getByText('Save'));

    // Expected behavior
    expect(updateMock).toHaveBeenCalled();
  });

  it('should navigate back to personnel list when cancelling', async () =>{
    // Populate mock database with data
    // roles
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockRoles, error: null }),
      }),
    } as any);

    // teams
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({ data: mockTeams, error: null }),
      }),
    } as any);
    
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({ data: mockPersonnel[1], error: null }),
        }),
      }),
    } as any);

    vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockResolvedValueOnce({ data: mockPersonnel, error: null }),
        } as any);

    render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_EDIT(mockPersonnel[1].id)]}>
            <Routes>
                <Route path={ROUTES.PERSONNEL_EDIT} element={<PersonnelForm />} />
                <Route path={PATHS.PERSONNEL_LIST} element={<PersonnelList />} />
            </Routes>
        </MemoryRouter>
    );

    await user.click(await screen.findByText('Cancel'));

    const title = await screen.findByText(/SGC Personnel/);

    expect(title).toBeInTheDocument();
  });
});