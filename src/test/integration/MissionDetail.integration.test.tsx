import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import userEvent from '@testing-library/user-event';
import MissionDetail from '../../pages/MissionDetail';
import MissionForm from '../../pages/MissionForm';
import MissionList from '../../pages/MissionList';
import { PATHS, ROUTES } from '../../lib/paths';
import { mockMissions, mockPersonnel, mockTeamPersonnelLink } from '../../lib/mockData';
import { extractDate, extractName, MISSION, MISSIONS_TEAMS, OBJECTIVE } from '../../lib/utils';
import { setupDeleteCapture } from '../testUtils';

const user = userEvent.setup();
const { objectives: abydosObjectives, teams: abydosTeams, id: abydosID, ...abydos } = mockMissions[0];
const { objectives: missionObjectives, teams: missionTeams, id: missionID, ...mission } = mockMissions[1];
abydosTeams.sort((a,b)=>a.designation.localeCompare(b.designation));

vi.mock('../../components/AuthContext.tsx', () => ({
    useAuth: () => ({
        session: { user: { id: 'mock-admin-id' } },
        error: null,
        role: 'admin',
        loading: false,
    }),
}));

describe('MissionDetail (integration)', () => {
    it('fetches and displays detailed completed mission record from the API', async () =>{
        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByText(`${abydos.destination} | ${abydos.name} | ${abydos.status}`));

        expect(await screen.findByRole('heading', { name: "Mission Record" })).toBeInTheDocument();
        expect(await screen.findByText(new RegExp(`Status: ${abydos.status}`))).toBeInTheDocument();
        expect(await screen.findByText(new RegExp(`Mission Start: ${extractDate(abydos.start_date)}`))).toBeInTheDocument();
        expect(await screen.findByText(new RegExp(`Mission End: ${extractDate(abydos.end_date)}`))).toBeInTheDocument();
        expect(await screen.findByText("TEAMS:")).toBeInTheDocument();

        for(const [i, team] of abydosTeams.entries()){
            const teamHeader = await screen.findByTitle(`team-name ${i}`);
            expect(teamHeader).toHaveTextContent(team.designation);

            const teamMembers = mockPersonnel.filter(p => 
                mockTeamPersonnelLink.some(l =>
                    l.team_id === team.id && l.personnel_id === p.id
                )
            )

            for(const [j, person] of teamMembers.entries()) {
                const memberRow = await screen.findByTitle(`team ${i} member ${j}`);
                expect(memberRow).toHaveTextContent(extractName(person));
            }
        }

        expect(await screen.findByText("OBJECTIVES:")).toBeInTheDocument();

        for(const [i, obj] of abydosObjectives.entries()) {
            const objective = await screen.findByTitle(`objective ${i}`);
            expect(objective).toHaveTextContent(`- ${obj.objective}`)

            const checkbox = await screen.findByTitle(`objective-status ${i}`);
            if(obj.is_completed) expect(checkbox).toBeChecked();
            else expect(checkbox).not.toBeChecked();
        }

        expect(await screen.findByText("Mission Debriefing")).toBeInTheDocument();
        expect(await screen.findByTitle("mission-description")).toHaveTextContent(abydos.description!);
    });
    
    it('fetches and displays detailed active mission record from the API', async () =>{
        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_LIST]}>
                <Routes>
                    <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
                    <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(await screen.findByText(`${mission.destination} | ${mission.name} | ${mission.status}`));

        expect(await screen.findByRole('heading', { name: "Mission Record" })).toBeInTheDocument();
        expect(await screen.findByText(new RegExp(`Status: ${mission.status}`))).toBeInTheDocument();
        expect(await screen.findByText(new RegExp(`Mission Start: ${extractDate(mission.start_date)}`))).toBeInTheDocument();
        expect(await screen.queryByText(new RegExp(/Mission End:/))).not.toBeInTheDocument();
        expect(await screen.findByText("TEAMS:")).toBeInTheDocument();

        for(const [i, team] of missionTeams.entries()){
            const teamHeader = await screen.findByTitle(`team-name ${i}`);
            expect(teamHeader).toHaveTextContent(team.designation);

            const teamMembers = mockPersonnel.filter(p => 
                mockTeamPersonnelLink.some(l =>
                    l.team_id === team.id && l.personnel_id === p.id
                )
            )

            for(const [j, person] of teamMembers.entries()) {
                const memberRow = await screen.findByTitle(`team ${i} member ${j}`);
                expect(memberRow).toHaveTextContent(extractName(person));
            }
        }

        expect(await screen.findByText("OBJECTIVES:")).toBeInTheDocument();

        for(const [i, obj] of missionObjectives.entries()) {
            const objective = await screen.findByTitle(`objective ${i}`);
            expect(objective).toHaveTextContent(`- ${obj.objective}`)

            const checkbox = await screen.findByTitle(`objective-status ${i}`);
            if(obj.is_completed) expect(checkbox).toBeChecked();
            else expect(checkbox).not.toBeChecked();
        }

        expect(await screen.queryByText("Mission Debriefing")).not.toBeInTheDocument();
        expect(await screen.queryByTitle("mission-description")).not.toBeInTheDocument();
    });

    it('displays error message when no record found', async () =>{
        server.use(
            http.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/missions_teams`, () => {
            return new HttpResponse(null);
            })
        );
        render(
        <MemoryRouter initialEntries={[PATHS.MISSION_DETAIL(mockMissions[0].id)]}>
            <Routes>
                <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
            </Routes>
        </MemoryRouter>
        );

        const message = await screen.findByText('Mission record not found.');
        expect(message).toBeInTheDocument();
    });

    it('navigates to mission form when clicking edit button', async () =>{
        render(
        <MemoryRouter initialEntries={[PATHS.MISSION_DETAIL(abydosID)]}>
            <Routes>
                <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
                <Route path={ROUTES.MISSION_EDIT} element={<MissionForm />} />
            </Routes>
        </MemoryRouter>
        );

        await user.click(await screen.findByText('Edit'));

        expect(await screen.findByLabelText('Name:')).toHaveValue(abydos.name);
        expect(await screen.findByLabelText('Status:')).toHaveValue(abydos.status);
    });

    it('navigates to the list view when clicking back', async () =>{
        render(
        <MemoryRouter initialEntries={[PATHS.MISSION_DETAIL(mockMissions[1].id)]}>
            <Routes>
                <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
                <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
            </Routes>
        </MemoryRouter>
        );

        await user.click(await screen.findByText('Back'));

        expect(await screen.findByRole('heading', { name: "SGC Mission Records", level: 1 }));
        expect(await screen.findByText(`${abydos.destination} | ${abydos.name} | ${abydos.status}`)).toBeInTheDocument();
        expect(await screen.findByText(`${mission.destination} | ${mission.name} | ${mission.status}`)).toBeInTheDocument();
    });

    it('navigates to the list view after confirming delete action', async () => {
        await setupDeleteCapture(MISSIONS_TEAMS);
        await setupDeleteCapture(OBJECTIVE);
        const missionIdParam = setupDeleteCapture(MISSION);
        vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

        render(
        <MemoryRouter initialEntries={[PATHS.MISSION_DETAIL(missionID)]}>
            <Routes>
                <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
                <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
            </Routes>
        </MemoryRouter>
        );

        await user.click(await screen.findByRole('button', { name: 'Delete' }));

        expect(missionIdParam()).toBe(missionID);
        expect(await screen.findByRole('heading', { name: "SGC Mission Records", level: 1 }));
    });

    it('displays error message when API returns server error', async () => {
        server.use(
            http.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/missions_teams`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        render(
            <MemoryRouter initialEntries={[PATHS.MISSION_DETAIL(abydosID)]}>
            <Routes>
                <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
            </Routes>
            </MemoryRouter>
        );

        const message = await screen.findByText('Error 500: An unexpected error occurred.');
        expect(message).toBeInTheDocument();
    });
});