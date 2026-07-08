import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PersonnelDetail from '../pages/PersonnelDetail';
import { supabase } from '../lib/supabase';
import userEvent from '@testing-library/user-event';
import { mockPersonnel } from '../lib/mockData';
import { PATHS, ROUTES } from '../lib/paths';
import { mockLoginAs, TEST_USERS } from '../lib/utils';

const user = userEvent.setup();

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock authentication
vi.mock('../components/AuthContext', () => ({
    useAuth: vi.fn(),
}));

beforeEach(() => {
    vi.resetAllMocks();
});

describe('PersonnelDetail', () => {
    it('displays a message when no record is found', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
              single: vi.fn().mockResolvedValueOnce({
                data: null,
                error:  { message: 'no rows returned', code: 'PGRST116' }
              }),
            }),
          }),
      } as any);

      mockLoginAs(TEST_USERS.USER);

      render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[0].id)]}>
          <Routes>
            <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
          </Routes>
        </MemoryRouter>
      );

      const message = await screen.findByText('Personnel record not found.');
      expect(message).toBeInTheDocument();
    });

    it('displays error message when fetch fails', async () =>{
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ 
              data: null, 
              error: { message: 'connection failed', code: '500' } 
            }),
          }),
        }),
      } as any);

      mockLoginAs(TEST_USERS.USER);

      render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[0].id)]}>
          <Routes>
            <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
          </Routes>
        </MemoryRouter>
      );

      const message = await screen.findByText('Error 500: An unexpected error occurred.');
      expect(message).toBeInTheDocument();
    });

    it('displays the detailed records when data is returned', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockPersonnel[0], error: null }),
          }),
        }),
      } as any);

      mockLoginAs(TEST_USERS.USER);

      render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[0].id)]}>
          <Routes>
            <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
          </Routes>
        </MemoryRouter>
      );

      const name = await screen.findByText(/Jack O'Neill/);
      const rank = await screen.findByText(/Colonel/);
      const team = await screen.findByText(/SG-1/);
      const role = await screen.findByText(/Commanding Officer/);
      const status = await screen.findByText(/active/);
      expect(name).toBeInTheDocument();
      expect(rank).toBeInTheDocument();
      expect(team).toBeInTheDocument();
      expect(role).toBeInTheDocument();
      expect(status).toBeInTheDocument();
    });

    it('should show edit button for admins', async () =>{
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockPersonnel[0], error: null }),
          }),
        }),
      } as any);

      mockLoginAs(TEST_USERS.ADMIN);

      render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[0].id)]}>
          <Routes>
            <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await screen.findByText(/Rank:/);

      expect(await screen.findByRole('button', { name: 'Edit' }));
    });

    it('should show edit button for officers', async () =>{
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockPersonnel[0], error: null }),
          }),
        }),
      } as any);

      mockLoginAs(TEST_USERS.OFFICER);

      render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[0].id)]}>
          <Routes>
            <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await screen.findByText(/Rank:/);

      expect(await screen.findByRole('button', { name: 'Edit' }));
    });

    it('should show edit button for officers', async () =>{
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockPersonnel[0], error: null }),
          }),
        }),
      } as any);

      mockLoginAs(TEST_USERS.USER);

      render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[0].id)]}>
          <Routes>
            <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await screen.findByText(/Rank:/);

      const editBtn = await screen.queryByRole('button', { name: 'Edit' });
      expect(editBtn).not.toBeInTheDocument();
    });

    it('displays delete button only for admin', async () =>{
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockPersonnel[0], error: null }),
          }),
        }),
      } as any);

      mockLoginAs(TEST_USERS.ADMIN);

      render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[0].id)]}>
          <Routes>
            <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await screen.findByText(/Rank:/);

      const delBtn = await screen.queryByRole('button', { name: 'Delete' });
      expect(delBtn).toBeInTheDocument();
    });

    it('hides delete button for officers', async () =>{
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockPersonnel[0], error: null }),
          }),
        }),
      } as any);

      mockLoginAs(TEST_USERS.OFFICER);

      render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[0].id)]}>
          <Routes>
            <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await screen.findByText(/Rank:/);

      const delBtn = await screen.queryByRole('button', { name: 'Delete' });
      expect(delBtn).not.toBeInTheDocument();
    });

    it('hides delete button for standard users', async () =>{
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockPersonnel[0], error: null }),
          }),
        }),
      } as any);

      mockLoginAs(TEST_USERS.USER);

      render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[0].id)]}>
          <Routes>
            <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await screen.findByText(/Rank:/);

      const delBtn = await screen.queryByRole('button', { name: 'Delete' });
      expect(delBtn).not.toBeInTheDocument();
    });

    it('should retun to List view after confirming delete record', async () =>{
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockPersonnel[2], error: null }),
          }),
        }),
      } as any);

      vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

      const deleteRecord = vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({ error: null }),
      });

      vi.mocked(supabase.from).mockReturnValueOnce({
        delete: deleteRecord,
      } as any);

      mockLoginAs(TEST_USERS.ADMIN);

      render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[2].id)]}>
          <Routes>
            <Route path={PATHS.PERSONNEL_DETAIL(mockPersonnel[2].id)} element={<PersonnelDetail />} />
                <Route path={PATHS.PERSONNEL_LIST} element={<h1>Personnel List</h1>} />
          </Routes>
        </MemoryRouter>
      );

      await user.click(await screen.findByText('Delete'));

      expect(deleteRecord).toHaveBeenCalled();
      expect(await screen.findByRole('heading', { name: "Personnel List" })).toBeInTheDocument();
    });

    it('should stay on detail page after cancelling delete', async () =>{
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockPersonnel[2], error: null }),
          }),
        }),
      } as any);

      vi.spyOn(window, 'confirm').mockReturnValueOnce(false);

      mockLoginAs(TEST_USERS.ADMIN);

      render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[2].id)]}>
          <Routes>
            <Route path={PATHS.PERSONNEL_DETAIL(mockPersonnel[2].id)} element={<PersonnelDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await user.click(await screen.findByText('Delete'));

      const carl = await screen.findByText(/Carl John Baker III/);

      expect(carl).toBeInTheDocument();
    });
});