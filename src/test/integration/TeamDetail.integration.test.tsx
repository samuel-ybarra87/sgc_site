import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { server } from '../../mocks/server';
import userEvent from '@testing-library/user-event';
import { mockTeamData } from '../../lib/mockData';
import { PATHS, ROUTES } from '../../lib/paths';
import { setupPatchCapture } from '../testUtils';
import { TEAM } from '../../lib/utils';
import TeamsList from '../../pages/TeamList';
import TeamDetail from '../../pages/TeamDetail';

const user = userEvent.setup();

// Clear overrides from server.use()
afterEach(() => {
    server.resetHandlers(); 
});

describe('TeamDetail (integration)', () => {
    it('displays a message when no records are found', async () => {
        render(
            <MemoryRouter initialEntries={['/teams/team-not-found']}>
                <Routes>
                    <Route path={ROUTES.TEAM_DETAIL} element={<TeamDetail />} />
                </Routes>
            </MemoryRouter>
        );
        
        expect(await screen.findByText('Team record not found.'));
    });

    it('displays the detailed records when data is returned', async () => {
        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockTeamData[0].id)]}>
                <Routes>
                    <Route path={ROUTES.PERSONNEL_DETAIL} element={<TeamDetail />} />
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
    
    it('displays Other Members who are not active but stil assigned to team', async () => {
        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockTeamData[1].id)]}>
                <Routes>
                    <Route path={ROUTES.PERSONNEL_DETAIL} element={<TeamDetail />} />
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
    
    it('should show custom header for Unassigned team', async () => {
        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockTeamData[2].id)]}>
                <Routes>
                    <Route path={ROUTES.PERSONNEL_DETAIL} element={<TeamDetail />} />
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
    
    it('should retun to List view after confirming delete record', async () => {
        vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

        await setupPatchCapture(TEAM);

        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockTeamData[1].id)]}>
                <Routes>
                    <Route path={ROUTES.PERSONNEL_DETAIL} element={<TeamDetail />} />
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Delete' }));

        const header = await screen.findByText('SGC Team List');
        expect(header).toBeInTheDocument();
    });
    
    it('should stay on detail page after cancelling delete', async () => {
        vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
        
        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockTeamData[1].id)]}>
                <Routes>
                    <Route path={ROUTES.PERSONNEL_DETAIL} element={<TeamDetail />} />
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Delete' }));

        const header = await screen.queryByText('SGC Team List');
        expect(header).not.toBeInTheDocument();
    });
});