import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PersonnelList from '../../pages/PersonnelList';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import PersonnelDetail from '../../pages/PersonnelDetail';
import userEvent from '@testing-library/user-event';
import PersonnelForm from '../../pages/PersonnelForm';
import { mockEntry, mockPersonnel } from '../../lib/mockData';
import { PATHS, ROUTES } from '../../lib/paths';
import { setupPostCapture, setupPatchCapture, PERSONNEL } from '../testUtils';

const user = userEvent.setup();

describe('PersonnelForm (integration)', () => {
    it('navigates to add form and show empty fields for new entries', async () =>{
        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_LIST]}>
                <Routes>
                    <Route path={PATHS.PERSONNEL_LIST} element={<PersonnelList />} />
                    <Route path={PATHS.PERSONNEL_NEW} element={<PersonnelForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByText('Add Personnel'));

        expect(screen.getByLabelText('Prefix:')).toHaveValue('');
        expect(screen.getByLabelText('First Name:')).toHaveValue('');
        expect(screen.getByLabelText('Middle Name:')).toHaveValue('');
        expect(screen.getByLabelText('Last Name:')).toHaveValue('');
        expect(screen.getByLabelText('Suffix:')).toHaveValue('');
        expect(screen.getByLabelText('Rank:')).toHaveValue('');
        expect(screen.getByLabelText('Team:')).toHaveValue('');
        expect(screen.getByLabelText('Role:')).toHaveValue('');
        expect(screen.getByLabelText('Personnel Type:')).toHaveValue('military');
        expect(screen.getByLabelText('Status:')).toHaveValue('active'); 
    });

    it('inserts values into database after clicking save then navigates to list view', async () =>{
        const body = setupPostCapture(PERSONNEL);

        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_NEW]}>
                <Routes>
                    <Route path={PATHS.PERSONNEL_NEW} element={<PersonnelForm />} />
                    <Route path={PATHS.PERSONNEL_LIST} element={<PersonnelList />} />
                </Routes>
            </MemoryRouter>
        );
    
        // Type into fields
        await user.type(screen.getByLabelText('First Name:'), mockEntry.first_name);
        await user.type(screen.getByLabelText('Middle Name:'), mockEntry.middle_name);
        await user.type(screen.getByLabelText('Last Name:'), mockEntry.last_name);
        await user.type(screen.getByLabelText('Suffix:'), mockEntry.suffix);
        await user.selectOptions(screen.getByLabelText('Role:'), mockEntry.role_id);
            // Select dropdown value
        await user.selectOptions(screen.getByLabelText('Team:'), mockEntry.team_id);
        await user.selectOptions(screen.getByLabelText('Rank:'), mockEntry.rank);
        await user.selectOptions(screen.getByLabelText('Prefix:'), mockEntry.prefix);
        await user.selectOptions(screen.getByLabelText('Personnel Type:'), mockEntry.personnel_type);
        await user.selectOptions(screen.getByLabelText('Status:'), mockEntry.status);
    
        // click save
        await user.click(screen.getByText('Save'));

        expect(body()).toMatchObject(mockEntry);
    });

    it('should display error message when insert fails', async () =>{
        server.use(
            http.post(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/personnel`, () => {
                return new HttpResponse(
                JSON.stringify({ message: 'insert failed', code: '500' }),
                { status: 500 }
                );
            })
        );

        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_NEW]}>
                <Routes>
                    <Route path={PATHS.PERSONNEL_NEW} element={<PersonnelForm />} />
                    <Route path={PATHS.PERSONNEL_LIST} element={<PersonnelList />} />
                </Routes>
            </MemoryRouter>
        );

        await user.type(screen.getByLabelText('First Name:'), mockEntry.first_name);
        await user.type(screen.getByLabelText('Last Name:'), mockEntry.last_name);
        await user.selectOptions(screen.getByLabelText('Role:'), mockEntry.role_id);
        await user.selectOptions(screen.getByLabelText('Team:'), mockEntry.team_id);
        await user.click(screen.getByText('Save'));

        const error = await screen.findByText('insert failed');
        expect(error).toBeInTheDocument();
    });

    it('converts empty prefix and rank to null on submit then navigates to list view', async () =>{
        const body = setupPostCapture(PERSONNEL);

        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_NEW]}>
                <Routes>
                    <Route path={PATHS.PERSONNEL_NEW} element={<PersonnelForm />} />
                    <Route path={PATHS.PERSONNEL_LIST} element={<PersonnelList />} />
                </Routes>
            </MemoryRouter>
        );
    
        // Type into fields
        await user.type(screen.getByLabelText('First Name:'), mockEntry.first_name);
        await user.type(screen.getByLabelText('Middle Name:'), mockEntry.middle_name);
        await user.type(screen.getByLabelText('Last Name:'), mockEntry.last_name);
        await user.type(screen.getByLabelText('Suffix:'), mockEntry.suffix);
        await user.selectOptions(screen.getByLabelText('Role:'), mockEntry.role_id);
            // Select dropdown value
        await user.selectOptions(screen.getByLabelText('Team:'), mockEntry.team_id);
        await user.selectOptions(screen.getByLabelText('Personnel Type:'), mockEntry.personnel_type);
        await user.selectOptions(screen.getByLabelText('Status:'), mockEntry.status);
    
        // click save
        await user.click(screen.getByText('Save'));

        expect(body()).toMatchObject({
            prefix: null,
            first_name: mockEntry.first_name,
            middle_name: mockEntry.middle_name,
            last_name: mockEntry.last_name,
            suffix: mockEntry.suffix,
            personnel_type: mockEntry.personnel_type,
            rank: null,
            team_id: mockEntry.team_id,
            role: mockEntry.role,
            status: mockEntry.status,
        });
    });

    it('navigates to edit form and show values of record to edit', async () =>{
        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_LIST]}>
                <Routes>
                    <Route path={PATHS.PERSONNEL_LIST} element={<PersonnelList />} />
                    <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
                    <Route path={ROUTES.PERSONNEL_EDIT} element={<PersonnelForm />} />
                </Routes>
            </MemoryRouter>
        );

        const jack = await screen.findByText(/Col Jack O'Neill/);
        await user.click(jack);

        await user.click(await screen.findByText('Edit'));

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

    it('updates values into database after clicking save then navigates to list view', async () =>{
        const body = setupPatchCapture(PERSONNEL);
        
        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_LIST]}>
                <Routes>
                    <Route path={PATHS.PERSONNEL_LIST} element={<PersonnelList />} />
                    <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
                    <Route path={ROUTES.PERSONNEL_EDIT} element={<PersonnelForm />} />
                </Routes>
            </MemoryRouter>
        );

        // Navigate to detailed page
        const daniel = await screen.findByText(/Dr. Daniel Jackson PHD/);
        await user.click(daniel);

        // Navigate to edit page
        await user.click(await screen.findByText('Edit'));

        // Update and save
        await user.selectOptions(await screen.findByLabelText('Status:'), "kia");
        await user.click(screen.getByText('Save'));

        // Test
        const heading = await screen.findByText('SGC Personnel');
        expect(heading).toBeInTheDocument();
        expect(body()).toMatchObject({
            id: mockPersonnel[1].id,
            prefix: mockPersonnel[1].prefix,
            first_name: mockPersonnel[1].first_name,
            middle_name: mockPersonnel[1].middle_name,
            last_name: mockPersonnel[1].last_name,
            suffix: mockPersonnel[1].suffix,
            personnel_type: mockPersonnel[1].personnel_type,
            rank: mockPersonnel[1].rank,
            team_id: mockPersonnel[1].team_id,
            teams: mockPersonnel[1].teams,
            role: mockPersonnel[1].role,
            status: "kia",
        });
    });

    it('navigates back to personnel list when cancelling', async () =>{
        render(
            <MemoryRouter initialEntries={[PATHS.PERSONNEL_LIST]}>
                <Routes>
                    <Route path={PATHS.PERSONNEL_LIST} element={<PersonnelList />} />
                    <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
                    <Route path={ROUTES.PERSONNEL_EDIT} element={<PersonnelForm />} />
                </Routes>
            </MemoryRouter>
        );

        // Navigate to detailed page
        const daniel = await screen.findByText(/Dr. Daniel Jackson PHD/);
        await user.click(daniel);

        // Navigate to edit page
        await user.click(await screen.findByText('Edit'));

        // Cancel Update
        await user.click(screen.getByText('Cancel'));

        // Test
        const heading = await screen.findByText('SGC Personnel');
        const danielAfterNav = await screen.findByText(/Dr. Daniel Jackson PHD/);
        expect(heading).toBeInTheDocument();
        expect(danielAfterNav).toBeInTheDocument();
    });
});