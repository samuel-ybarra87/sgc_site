import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import userEvent from '@testing-library/user-event';
import { mockTeams, mockPersonnel, mockTeamEntry } from '../../lib/mockData';
import { PATHS, ROUTES } from '../../lib/paths';
import { setupPostCapture, setupPatchCapture, TEAM } from '../testUtils';
import TeamsList from '../../pages/TeamList';
import TeamForm from '../../pages/TeamForm';
import TeamDetail from '../../pages/TeamDetail';

const user = userEvent.setup();

// Clear overrides from server.use()
afterEach(() => {
    server.resetHandlers(); 
});

describe('TeamForm (integration)', () => {
    it('navigates to add form and show empty fields for new entries', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.TEAM_LIST]}>
                <Routes>
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                    <Route path={PATHS.TEAM_NEW} element={<TeamForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Add Team' }));

        expect(await screen.findByLabelText('Designation:')).toHaveValue('');
        expect(await screen.findByLabelText('Commanding Officer:')).toHaveValue('');
        expect(await screen.findByLabelText('Status:')).toHaveValue('active');
        expect(await screen.findByRole('button', { name: 'Save' })).toBeInTheDocument();
        expect(await screen.findByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('inserts values into database after clicking save then navigates to list view', async ()=>{
        const body = setupPostCapture(TEAM);
        
        render(
            <MemoryRouter initialEntries={[PATHS.TEAM_LIST]}>
                <Routes>
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                    <Route path={PATHS.TEAM_NEW} element={<TeamForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Add Team' }));

        await user.type(screen.getByLabelText('Designation:'), mockTeamEntry.designation);
        await user.selectOptions(screen.getByLabelText('Commanding Officer:'), mockTeamEntry.commanding_officer);
        await user.selectOptions(screen.getByLabelText('Status:'), mockTeamEntry.status);

        await user.click(await screen.findByRole('button', { name: 'Save' }));

        expect(body()).toMatchObject(mockTeamEntry);
    });

    it('should display error message when insert fails', async ()=>{
        server.use(
            http.post(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/teams`, () => {
                return new HttpResponse(
                    JSON.stringify({ message: 'insert failed', code: '500' }),
                    { status: 500 }
                );
            })
        );

        render(
            <MemoryRouter initialEntries={[PATHS.TEAM_LIST]}>
                <Routes>
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                    <Route path={PATHS.TEAM_NEW} element={<TeamForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Add Team' }));

        await user.type(screen.getByLabelText('Designation:'), mockTeamEntry.designation);
        await user.selectOptions(screen.getByLabelText('Commanding Officer:'), mockTeamEntry.commanding_officer);
        await user.selectOptions(screen.getByLabelText('Status:'), mockTeamEntry.status);

        await user.click(await screen.findByRole('button', { name: 'Save' }));

        const error = await screen.findByText('insert failed');
        expect(error).toBeInTheDocument();
    });

    it('should show an error message if Commanding Officer is blank', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.TEAM_LIST]}>
                <Routes>
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                    <Route path={PATHS.TEAM_NEW} element={<TeamForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Add Team' }));

        await user.type(screen.getByLabelText('Designation:'), mockTeamEntry.designation);
        await user.selectOptions(screen.getByLabelText('Status:'), mockTeamEntry.status);

        await user.click(await screen.findByRole('button', { name: 'Save' }));

        const error = await screen.findByText('Please select a Commanding Officer.');
        expect(error).toBeInTheDocument();

    });

    it('navigates to edit form and show values of record to edit', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.TEAM_LIST]}>
                <Routes>
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                    <Route path={ROUTES.TEAM_DETAIL} element={<TeamDetail/>} />
                    <Route path={ROUTES.TEAM_EDIT} element={<TeamForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('link', { name: 'SG-1' }));
        await user.click(await screen.findByRole('button', { name: 'Edit' }));

        expect(await screen.findByLabelText('Designation:')).toHaveValue('SG-1');
        expect(await screen.findByLabelText('Commanding Officer:')).toHaveDisplayValue(/Col Jack O'Neill/);
        expect(await screen.findByLabelText('Status:')).toHaveValue('active');
        expect(await screen.findByRole('button', { name: 'Save' })).toBeInTheDocument();
        expect(await screen.findByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('updates values into database after clicking save then navigates to list view', async ()=>{
        const body = setupPatchCapture(TEAM);

        render(
            <MemoryRouter initialEntries={[PATHS.TEAM_LIST]}>
                <Routes>
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                    <Route path={ROUTES.TEAM_DETAIL} element={<TeamDetail/>} />
                    <Route path={ROUTES.TEAM_EDIT} element={<TeamForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('link', { name: mockTeams[2].designation }));
        // mockTeamData is used for TeamDetail fetch calls
        // mockTeams[2] is used to populate mockTeamData[1] where Col O'Neill is CO
        expect(await screen.findByText(/Commanding Officer: Colonel Jack O'Neill/))
        await user.click(await screen.findByRole('button', { name: 'Edit' }));

        await user.selectOptions(screen.getByLabelText('Commanding Officer:'), mockPersonnel[6].id);
        await user.click(await screen.findByRole('button', { name: 'Save' }));

        expect(body()).toMatchObject({ ...mockTeams[2], commanding_officer: mockPersonnel[6].id})
    });

    it('navigates back to team list when cancelling (add)', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.TEAM_LIST]}>
                <Routes>
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                    <Route path={PATHS.TEAM_NEW} element={<TeamForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Add Team' }));
        await user.click(await screen.findByRole('button', { name: 'Cancel' }));

        expect(await screen.getByText('SGC Team List'));
    });

    it('navigates back to team list when cancelling (edit)', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.TEAM_LIST]}>
                <Routes>
                    <Route path={PATHS.TEAM_LIST} element={<TeamsList />} />
                    <Route path={ROUTES.TEAM_DETAIL} element={<TeamDetail/>} />
                    <Route path={ROUTES.TEAM_EDIT} element={<TeamForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('link', { name: 'SG-1' }));
        await user.click(await screen.findByRole('button', { name: 'Edit' }));
        await user.click(await screen.findByRole('button', { name: 'Cancel' }));

        expect(await screen.getByText('SGC Team List'));
    });
});