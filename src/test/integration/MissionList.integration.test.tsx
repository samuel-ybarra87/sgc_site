import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import userEvent from '@testing-library/user-event';
import Homepage from '../../pages/Homepage'
import { PATHS, ROUTES } from '../../lib/paths';
import MissionDetail from '../../pages/MissionDetail';
import MissionForm from '../../pages/MissionForm';
import MissionList from '../../pages/MissionList';
import { mockMissions } from '../../lib/mockData';

const user = userEvent.setup();
const abydos = mockMissions[0];

vi.mock('../../components/AuthContext.tsx', () => ({
    useAuth: () => ({
        session: { user: { id: 'mock-admin-id' } },
        error: null,
        role: 'admin',
        loading: false,
    }),
}));

describe('MissionList', () => {
    it('displays a message when no records are found', async () => {
        server.use(
            http.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/missions`, () => {
            return HttpResponse.json([]);
            })
        );

        render(
        <MemoryRouter>
            <MissionList />
        </MemoryRouter>
        );

        const message = await screen.findByText('No mission records found.');
        expect(message).toBeInTheDocument();
    });

    it('displays no records message when fetch fails', async () =>{
        server.use(
            http.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/missions`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        render(
        <MemoryRouter>
            <MissionList />
        </MemoryRouter>
        );

        const message = await screen.findByText('No mission records found.');
        expect(message).toBeInTheDocument();
    });

    it('displays mission records when data is returned', async () =>{
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

    it('navigates to mission record detail when a record is clicked', async () => {
        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
                </Routes>
            </MemoryRouter>
        );

        const link = await screen.findByText(`${abydos.destination} | ${abydos.name} | ${abydos.status}`);
        await user.click(link);

        expect(await screen.findByRole('heading', { name: 'Mission Record', level: 1})).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: abydos.destination, level: 2})).toBeInTheDocument();
    });

    it('navigates to mission form when Add Mission Record button is clicked', async () => {
        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={PATHS.MISSION_NEW} element={<MissionForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Add Mission Record' }));

        expect(await screen.findByRole('heading', { name: 'Add Mission Record' })).toBeInTheDocument();
        expect(await screen.findByLabelText('Name:')).toBeInTheDocument();
    });

    it('navigates to homepage when Home button is clicked', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={PATHS.HOME} element={<Homepage />} />
                </Routes>
            </MemoryRouter>
        );

        const homeButton = await screen.findByRole('button', { name: 'Home' });
        await user.click(homeButton);

        const header = await screen.findByText('Stargate Command Records');
        expect(header).toBeInTheDocument();
    });
});