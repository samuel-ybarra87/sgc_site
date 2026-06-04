import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import userEvent from '@testing-library/user-event';
import { mockMissions, mockMissionData } from '../../lib/mockData';
import { PATHS, ROUTES } from '../../lib/paths';
import { setupPostCapture, setupPatchCapture, setupDeleteCapture } from '../testUtils';
import { MISSION, OBJECTIVE, MISSIONS_TEAMS } from '../../lib/utils';
import MissionList from '../../pages/MissionList';
import MissionForm from '../../pages/MissionForm';
import MissionDetail from '../../pages/MissionDetail';

const user = userEvent.setup();
const abydos = mockMissions[0];
const { objectives, teams, id: mockMissionID, ...mockMission } = mockMissionData;

// Clear overrides from server.use()
afterEach(() => {
    server.resetHandlers(); 
});

describe('MissionForm (integration)', () => {
    it('navigates to add form and show empty fields for new entries', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={PATHS.MISSION_NEW} element={<MissionForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Add Mission Record' }));

        expect(await screen.findByLabelText('Name:')).toHaveValue('');
        expect(await screen.findByLabelText('Destination:')).toHaveValue('');
        expect(await screen.findByLabelText('Status:')).toHaveValue('active');
        expect(await screen.findByLabelText('Start Date:')).toHaveValue('');
        expect(await screen.findByLabelText('End Date:')).toHaveValue('');
        expect(await screen.findByLabelText('Team 1:')).toHaveValue('');
        expect(await screen.findByLabelText('Objective 1:')).toHaveValue('');
        expect(await screen.findByLabelText('Report:')).toHaveValue('');
    });

    it('inserts values into database after clicking save then navigates to list view', async ()=>{
        setupPostCapture(MISSIONS_TEAMS);
        setupPostCapture(OBJECTIVE);
        const body = setupPostCapture(MISSION);
        
        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={PATHS.MISSION_NEW} element={<MissionForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Add Mission Record' }));

        await user.type(screen.getByLabelText('Name:'), mockMission.name);
        await user.type(screen.getByLabelText('Destination:'), mockMission.destination);
        await user.selectOptions(screen.getByLabelText('Status:'), mockMission.status);
        await user.type(screen.getByLabelText('Start Date:'), mockMission.start_date.slice(0,16));
        await user.selectOptions(screen.getByLabelText('Team 1:'), teams[0].id)
        await user.type(screen.getByLabelText('Objective 1:'), objectives[0].objective);

        await user.click(await screen.findByRole('button', { name: 'Save' }));

        expect(body()).toMatchObject(mockMission);
    });

    it('should display error message when insert fails', async ()=>{
        server.use(
            http.post(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/missions`, () => {
                return new HttpResponse(
                    JSON.stringify({ message: 'insert failed', code: '500' }),
                    { status: 500 }
                );
            })
        );

        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={PATHS.MISSION_NEW} element={<MissionForm />} />
                </Routes>
            </MemoryRouter>
        );
        
        await user.click(await screen.findByRole('button', { name: 'Add Mission Record' }));

        await user.type(screen.getByLabelText('Name:'), mockMission.name);
        await user.type(screen.getByLabelText('Destination:'), mockMission.destination);
        await user.selectOptions(screen.getByLabelText('Status:'), mockMission.status);
        await user.type(screen.getByLabelText('Start Date:'), mockMission.start_date.slice(0,16));
        await user.selectOptions(screen.getByLabelText('Team 1:'), teams[0].id)
        await user.type(screen.getByLabelText('Objective 1:'), objectives[0].objective);

        await user.click(await screen.findByRole('button', { name: 'Save' }));

        const error = await screen.findByText('insert failed');
        expect(error).toBeInTheDocument();
    });

    it('should show an error message if team is blank', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={PATHS.MISSION_NEW} element={<MissionForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Add Mission Record' }));

        await user.type(screen.getByLabelText('Name:'), mockMission.name);
        await user.type(screen.getByLabelText('Destination:'), mockMission.destination);
        await user.selectOptions(screen.getByLabelText('Status:'), mockMission.status);
        await user.type(screen.getByLabelText('Start Date:'), mockMission.start_date.slice(0,16));
        await user.type(screen.getByLabelText('Objective 1:'), objectives[0].objective);

        await user.click(await screen.findByRole('button', { name: 'Save' }));

        const error = await screen.findByText('Please select Team 1.');
        expect(error).toBeInTheDocument();
    });

    it('should show an error message if objective is blank', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={PATHS.MISSION_NEW} element={<MissionForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Add Mission Record' }));

        await user.type(screen.getByLabelText('Name:'), mockMission.name);
        await user.type(screen.getByLabelText('Destination:'), mockMission.destination);
        await user.selectOptions(screen.getByLabelText('Status:'), mockMission.status);
        await user.type(screen.getByLabelText('Start Date:'), mockMission.start_date.slice(0,16));
        await user.selectOptions(screen.getByLabelText('Team 1:'), teams[0].id);

        await user.click(await screen.findByRole('button', { name: 'Save' }));

        const error = await screen.findByText('Please fill out Objective 1.');
        expect(error).toBeInTheDocument();
    });

    it('navigates to edit form and show values of record to edit', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail/>} />
                    <Route path={ROUTES.MISSION_EDIT} element={<MissionForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('link', { name: `${abydos.destination} | ${abydos.name} | ${abydos.status}` }));
        await user.click(await screen.findByRole('button', { name: 'Edit' }));

        const teamList = await screen.findAllByLabelText(/Team/i);
        const sortedTeams = [...abydos.teams].sort((a, b) =>
            a.designation.localeCompare(b.designation)
        );
        const missionObjectives = await screen.findAllByLabelText(/Objective/i);
        const completedBtn = await screen.findAllByRole('button', { name: /Completed/i });
        const classifiedBtn = await screen.findAllByRole('button', { name: /Classified/i });

        expect(teamList).toHaveLength(sortedTeams.length);
        expect(missionObjectives).toHaveLength(abydos.objectives.length);
        expect(completedBtn).toHaveLength(abydos.objectives.length);
        expect(classifiedBtn).toHaveLength(abydos.objectives.length);

        expect(await screen.findByLabelText('Name:')).toHaveValue(abydos.name);
        expect(await screen.findByLabelText('Destination:')).toHaveValue(abydos.destination);
        expect(await screen.findByLabelText('Status:')).toHaveValue(abydos.status);
        expect(await screen.findByLabelText('Start Date:')).toHaveValue(abydos.start_date.slice(0,16));
        expect(await screen.findByLabelText('End Date:')).toHaveValue(abydos.end_date?.slice(0,16));

        teamList.forEach((node, i) => {
            expect(node).toHaveValue(sortedTeams[i].id);
            expect(node).toHaveDisplayValue(sortedTeams[i].designation);
        });
        missionObjectives.forEach((node, i) => expect(node).toHaveValue(abydos.objectives[i].objective));
        completedBtn.forEach((node, i) => expect(node).toHaveAttribute('aria-pressed', `${abydos.objectives[i].is_completed}`));
        classifiedBtn.forEach((node, i) => expect(node).toHaveAttribute('aria-pressed', `${abydos.objectives[i].secret_objective}`));

        expect(await screen.findByLabelText("Report:")).toHaveValue(abydos.description);
    });

    it('updates values into database after clicking save then navigates to list view', async ()=>{
        const {objectives, teams, ...mission} = mockMissions[1];
        await setupDeleteCapture(MISSIONS_TEAMS);
        await setupDeleteCapture(OBJECTIVE);
        await setupPostCapture(MISSIONS_TEAMS);
        await setupPostCapture(OBJECTIVE);
        const body = await setupPatchCapture(MISSION);

        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail/>} />
                    <Route path={ROUTES.MISSION_EDIT} element={<MissionForm />} />
                </Routes>
            </MemoryRouter>
        );
        await user.click(await screen.findByRole('link', { name: `${mission.destination} | ${mission.name} | ${mission.status}` }));
        await user.click(await screen.findByRole('button', { name: 'Edit' }));

        const status = await screen.findByLabelText("Status:");
        const end_date = await screen.findByLabelText("End Date:");

        expect(status).toHaveValue(mission.status);
        expect(end_date).toHaveValue('');

        const endDate = new Date().toISOString().slice(0,16);
        const expectedDateFormat = new Date(`${endDate}Z`).toISOString();

        // manipulate mission data
        await user.selectOptions(status, "complete");
        await user.type(end_date, endDate)
        await user.click(await screen.findByText("Save"));

        expect(body()).toMatchObject({
            ...mission,
            status: "complete",
            end_date: expectedDateFormat
        });
    });

    it('navigates back to team list when cancelling (add)', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={PATHS.MISSION_NEW} element={<MissionForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Add Mission Record' }));
        await user.click(await screen.findByRole('button', { name: 'Cancel' }));

        expect(await screen.getByText('SGC Mission Records'));
    });

    it('navigates back to team list when cancelling (edit)', async ()=>{
        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail/>} />
                    <Route path={ROUTES.MISSION_EDIT} element={<MissionForm />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByRole('link', { name: `${abydos.destination} | ${abydos.name} | ${abydos.status}` }));
        await user.click(await screen.findByRole('button', { name: 'Edit' }));
        await user.click(await screen.findByRole('button', { name: 'Cancel' }));

        expect(await screen.getByText('SGC Mission Records'));
    });
});