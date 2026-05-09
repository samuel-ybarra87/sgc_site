import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PersonnelList from '../../pages/PersonnelList';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import PersonnelDetail from '../../pages/PersonnelDetail';
import userEvent from '@testing-library/user-event';
import PersonnelForm from '../../pages/PersonnelForm';
import { PATHS, ROUTES } from '../../lib/paths';
import { mockPersonnel } from '../../lib/mockData';

const user = userEvent.setup();

describe('PersonnelDetail (integration)', () => {
    it('fetches and displays detailed military personnel record from the API', async () =>{
        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[2].id)]}>
            <Routes>
                <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
            </Routes>
            </MemoryRouter>
        );

        const heading = await screen.findByText(/Mr. Carl John Baker III/);
        const rank = await screen.findByText(/Rank: Second Lieutenant/);
        const team = await screen.findByText(/SG-2/);
        const role = await screen.findByText(/Test Role/);
        const status = await screen.findByText(/active/);
        expect(heading).toBeInTheDocument();
        expect(rank).toBeInTheDocument();
        expect(team).toBeInTheDocument();
        expect(role).toBeInTheDocument();
        expect(status).toBeInTheDocument();
    });
    
    it('fetches and displays detailed civilian personnel record from the API', async () =>{
        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[3].id)]}>
            <Routes>
                <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
            </Routes>
            </MemoryRouter>
        );

        const heading = await screen.findByText(/Dr. Samantha Alexandra Shepard PHD/);
        const rank = await screen.findByText(/Civilian Contractor/);
        const team = await screen.findByText(/SG-2/);
        const role = await screen.findByText(/Computer Expert/);
        const status = await screen.findByText(/active/);
        expect(heading).toBeInTheDocument();
        expect(rank).toBeInTheDocument();
        expect(team).toBeInTheDocument();
        expect(role).toBeInTheDocument();
        expect(status).toBeInTheDocument();
    });

    it('fetches and displays broken personnel record from the API successfully', async () =>{
        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[4].id)]}>
            <Routes>
                <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
            </Routes>
            </MemoryRouter>
        );

        const heading = await screen.findByText(/test test/);
        const rank = await screen.findByText(/N\/A/);
        const role = await screen.findByText(/broken/);
        const status = await screen.findByText(/active/);
        expect(heading).toBeInTheDocument();
        expect(rank).toBeInTheDocument();
        expect(role).toBeInTheDocument();
        expect(status).toBeInTheDocument();
    });

    it('displays error message when no record found', async () =>{
        render(
        <MemoryRouter initialEntries={['/personnel/0']}>
            <Routes>
                <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
            </Routes>
        </MemoryRouter>
        );

        const message = await screen.findByText('Personnel record not found.');
        expect(message).toBeInTheDocument();
    });

    it('navigates to personnel form when clicking edit button', async () =>{
        render(
        <MemoryRouter initialEntries={['/personnel/2']}>
            <Routes>
                <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
                <Route path={ROUTES.PERSONNEL_EDIT} element={<PersonnelForm />} />
            </Routes>
        </MemoryRouter>
        );

        await user.click(await screen.findByText('Edit'));

        expect(await screen.findByLabelText('First Name:')).toHaveValue('Daniel');
        expect(await screen.findByLabelText('Middle Name:')).toHaveValue('');
    });

    it('navigates to the list view when clicking back', async () =>{
        render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[1].id)]}>
            <Routes>
                <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
                <Route path={PATHS.PERSONNEL_LIST} element={<PersonnelList />} />
            </Routes>
        </MemoryRouter>
        );

        await user.click(await screen.findByText('Back'));

        const jack = await screen.findByText(/Col Jack O'Neill/);
        expect(jack).toBeInTheDocument(); 
    });

    it('navigates to the list view after confirming delete action', async () => {
        vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

        render(
        <MemoryRouter initialEntries={[PATHS.PERSONNEL_DETAIL(mockPersonnel[4].id)]}>
            <Routes>
                <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
                <Route path={PATHS.PERSONNEL_LIST} element={<PersonnelList />} />
            </Routes>
        </MemoryRouter>
        );

        await user.click(await screen.findByText('Delete'));

        const jack = await screen.findByText(/Col Jack O'Neill/);
        expect(jack).toBeInTheDocument(); 
    });

    it('displays error message when API returns server error', async () => {
        server.use(
            http.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/personnel`, () => {
            return new HttpResponse(null, { status: 500 });
            })
        );

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
});