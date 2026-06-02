import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import TeamDetail from '../pages/TeamDetail';
import TeamList from '../pages/TeamList';
import { supabase } from '../lib/supabase';
import userEvent from '@testing-library/user-event';
import { mockTeamData } from '../lib/mockData';
import { PATHS, ROUTES } from '../lib/paths';

const user = userEvent.setup();

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('TeamDetail', () => {
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

        render(
          <MemoryRouter initialEntries={[PATHS.TEAM_DETAIL(mockTeamData[0].id)]}>
            <Routes>
              <Route path={ROUTES.TEAM_DETAIL} element={<TeamDetail />} />
            </Routes>
          </MemoryRouter>
        );

        const message = await screen.findByText('Team record not found.');
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

      render(
        <MemoryRouter initialEntries={[PATHS.TEAM_DETAIL(mockTeamData[0].id)]}>
          <Routes>
            <Route path={ROUTES.TEAM_DETAIL} element={<TeamDetail />} />
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
            single: vi.fn().mockResolvedValueOnce({ data: mockTeamData[0], error: null }),
          }),
        }),
      } as any);

      render(
        <MemoryRouter initialEntries={[PATHS.TEAM_DETAIL(mockTeamData[0].id)]}>
          <Routes>
            <Route path={ROUTES.TEAM_DETAIL} element={<TeamDetail />} />
          </Routes>
        </MemoryRouter>
      );

      const jack = await screen.findByText(/Commanding Officer: Colonel Jack O'Neill/);
      const daneil = await screen.findByText(/Test Role: Dr. Daniel Jackson PHD/);
      const tealc = await screen.findByText(/Test Role: Teal'c/);
      const samantha = await screen.findByText(/Chief Science Officer: Captain Samantha Carter PHD/);
      expect(await screen.findByRole('heading', { name: 'SG-1', level: 1 })).toBeInTheDocument();
      expect(await screen.findByRole('heading', { name: /Current Members/, level: 3 })).toBeInTheDocument();
      expect(jack).toBeInTheDocument();
      expect(daneil).toBeInTheDocument();
      expect(tealc).toBeInTheDocument();
      expect(samantha).toBeInTheDocument();
      expect(await screen.findByRole('heading', { name: 'Status: active', level: 4})).toBeInTheDocument();
      expect(await screen.queryByText('Other Members')).not.toBeInTheDocument();
    });

    it('should show extra members not active but still assinged to team', async ()=>{
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockTeamData[1], error: null }),
          }),
        }),
      } as any);

      render(
        <MemoryRouter initialEntries={[PATHS.TEAM_DETAIL(mockTeamData[1].id)]}>
          <Routes>
            <Route path={ROUTES.TEAM_DETAIL} element={<TeamDetail />} />
          </Routes>
        </MemoryRouter>
      );

      const jack = await screen.findByText(/Commanding Officer: Colonel Jack O'Neill/);
      const carl = await screen.findByText(/Test Role: Second Lieutenant Carl John Baker III/);
      const samantha = await screen.findByText(/Computer Expert: Dr. Samantha Alexandra Shepard PHD/);
      const john = await screen.findByText(/Test Role: Major John Shepard/);
      expect(await screen.findByRole('heading', { name: 'SG-Test', level: 1 })).toBeInTheDocument();
      expect(await screen.findByRole('heading', { name: /Current Members/, level: 3 })).toBeInTheDocument();
      expect(jack).toBeInTheDocument();
      expect(carl).toBeInTheDocument();
      expect(samantha).toBeInTheDocument();
      expect(await screen.findByRole('heading', { name: /Other Members/, level: 3 })).toBeInTheDocument();
      expect(john).toBeInTheDocument();
      expect(await screen.findByText(/\(TRANSFERRED\)/)).toBeInTheDocument();
    });

    it('should show custom header for Unassigned team', async ()=>{
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockTeamData[2], error: null }),
          }),
        }),
      } as any);

      render(
        <MemoryRouter initialEntries={[PATHS.TEAM_DETAIL(mockTeamData[2].id)]}>
          <Routes>
            <Route path={ROUTES.TEAM_DETAIL} element={<TeamDetail />} />
          </Routes>
        </MemoryRouter>
      );

      const vala = await screen.findByText(/Guest: Ms. Vala Maldaran/);
      const john = await screen.findByText(/Test Role: Major John Shepard/);
      expect(await screen.findByRole('heading', { name: 'Unassigned', level: 1 })).toBeInTheDocument();
      expect(await screen.findByRole('heading', { name: /Members/, level: 3 })).toBeInTheDocument();
      expect(await screen.queryByText('Current Members')).not.toBeInTheDocument();
      expect(john).toBeInTheDocument();
      expect(vala).toBeInTheDocument();
      expect(await screen.queryByText('Status: inactive')).not.toBeInTheDocument();
      expect(await screen.queryByText('Other Members')).not.toBeInTheDocument();
    });

    it('should retun to List view after confirming delete record', async () =>{
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockTeamData[1], error: null }),
          }),
        }),
      } as any);

      vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({ error: null }),
        }),
      } as any);


      const deleteRecord = vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({ error: null }),
      });

      vi.mocked(supabase.from).mockReturnValueOnce({
        delete: deleteRecord,
      } as any);

      render(
        <MemoryRouter initialEntries={[PATHS.TEAM_DETAIL(mockTeamData[1].id)]}>
          <Routes>
            <Route path={PATHS.TEAM_DETAIL(mockTeamData[1].id)} element={<TeamDetail />} />
            <Route path={PATHS.TEAM_LIST} element={<h1>Team List</h1>} />
          </Routes>
        </MemoryRouter>
      );

      await user.click(await screen.findByText('Delete'));

      expect(deleteRecord).toHaveBeenCalled();
      expect(await screen.findByRole('heading', { name: "Team List" })).toBeInTheDocument();
    });

    it('should stay on detail page after cancelling delete', async () =>{
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockTeamData[1], error: null }),
          }),
        }),
      } as any);

      vi.spyOn(window, 'confirm').mockReturnValueOnce(false);

      render(
        <MemoryRouter initialEntries={[PATHS.TEAM_DETAIL(mockTeamData[1].id)]}>
          <Routes>
            <Route path={PATHS.TEAM_DETAIL(mockTeamData[1].id)} element={<TeamDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await user.click(await screen.findByText('Delete'));

      const jack = await screen.findByText(/Commanding Officer: Colonel Jack O'Neill/);

      expect(jack).toBeInTheDocument();
    });
});