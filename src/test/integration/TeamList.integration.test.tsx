import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import userEvent from '@testing-library/user-event';
import Homepage from '../../pages/Homepage'
import { PATHS, ROUTES } from '../../lib/paths';
import TeamsList from '../../pages/TeamList';
import TeamDetail from '../../pages/TeamDetail';
import TeamForm from '../../pages/TeamForm';

const user = userEvent.setup();

vi.mock('../../components/AuthContext.tsx', () => ({
    useAuth: () => ({
        session: { user: { id: 'mock-admin-id' } },
        error: null,
        role: 'admin',
        loading: false,
    }),
}));

// Clear overrides from server.use()
afterEach(() => {
    server.resetHandlers(); 
});

describe('TeamList (integration)', () => {
    it('navigates to homepage when Home button is clicked', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.TEAM_LIST]}>
                <Routes>
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                    <Route path={PATHS.HOME} element={<Homepage />} />
                </Routes>
            </MemoryRouter>
        );
        
        const homeButton = await screen.findByRole('button', { name: 'Home' });
        await user.click(homeButton);

        const header = await screen.findByText('Stargate Command Records');
        expect(header).toBeInTheDocument();
    });

    it('fetches and displays personnel records from the API', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.HOME]}>
                <Routes>
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                    <Route path={PATHS.HOME} element={<Homepage />} />
                </Routes>
            </MemoryRouter>
        );

        const teams = await screen.findByRole('link', { name: 'TEAM LIST' });
        await user.click(teams);

        const sg1 = await screen.findByText('SG-1');
        expect(sg1).toBeInTheDocument();
    });

    it('displays no records message when API returns empty array', async ()=>{
        server.use(
            http.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/teams`, () => {
            return HttpResponse.json([]);
            })
        );

        render(
            <MemoryRouter>
                <TeamsList />
            </MemoryRouter>
        );

        const message = await screen.findByText('No team records found.');
        expect(message).toBeInTheDocument();
    });

    it('displays no records message when API returns error', async ()=>{
        server.use(
            http.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/teams`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        render(
            <MemoryRouter>
                <TeamsList />
            </MemoryRouter>
        );

        const message = await screen.findByText('No team records found.');
        expect(message).toBeInTheDocument();
    });

    it('navigates to team detail when a record is clicked', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.TEAM_LIST]}>
                <Routes>
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                    <Route path={ROUTES.TEAM_DETAIL} element={<TeamDetail />} />
                </Routes>
            </MemoryRouter>
        );

        const sg1 = await screen.findByText('SG-1');
        await user.click(sg1);

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

    it('navigates to team form when Add Team button is clicked', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.TEAM_LIST]}>
                <Routes>
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                    <Route path={PATHS.TEAM_NEW} element={<TeamForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Add Team' }));

        const nameField = await screen.findByLabelText('Designation:');
        expect(nameField).toBeInTheDocument();
    });
});