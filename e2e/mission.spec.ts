import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { PATHS } from "../src/lib/paths"
import {
    e2eMockMissionObjectives,
    e2eMockMissions,
    e2eTestRecords,
    e2eTestRoles,
    e2eTestTeams,
    TEST_MISSIONS
} from "./mockData"
import {
    deleteTestData,
    deleteTestObjectives,
    extractName,
    fetchTestObjectives,
    fetchTestRoles,
    fetchTestTeams,
    seedMissionTeamLinks,
    seedTeamPersonnelLinks,
    seedTestMissions,
    seedTestObjectives,
    seedTestPersonnel,
    seedTestRoles,
    seedTestTeams
} from './testUtils';
import { Mission, MissionObjective, MissionTeamLink, Team, TeamPersonnelLink } from './interface';

interface SeededTeam extends Team {
    id: string;
}

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

test.describe.configure({ mode: 'serial' });

//personnel
const e2eTestRec = e2eTestRecords.e2eTestRec;
const e2eTestRec2 = e2eTestRecords.e2eTestRec2;
const e2eTestRec3 = e2eTestRecords.e2eTestRec3;
const teamMember1 = e2eTestRecords.teamMember1;
const teamMember2 = e2eTestRecords.teamMember2;
const teamMember3 = e2eTestRecords.teamMember3;
// teams
const SGTEST1: SeededTeam = { id: '', ...e2eTestTeams[0] };
const SGTEST2: SeededTeam = { id: '', ...e2eTestTeams[1] };
const EMPTYTEAM = { id: '', commanding_officer: '', designation: '', status: '' };
// objectives
const completedObjectives: MissionObjective[] = e2eMockMissionObjectives.map(obj => ({ ...obj, is_completed: true }));
const secretObjectives: MissionObjective[] = e2eMockMissionObjectives.filter(obj => obj.secret_objective === true);
const missionObjectives: MissionObjective[] = e2eMockMissionObjectives.filter(obj => obj.secret_objective === false);
const EMPTYOBJECTIVE = { id: '', mission_id: '', objective: '', is_completed: false, secret_objective: false };
// missions
const MOCKMISSION1: Mission = e2eMockMissions[0];
const MOCKMISSION2: Mission = e2eMockMissions[1];
const MOCKMISSIONENTRY: Mission = {
    name: 'Mock Mission 3',
    destination: 'PX3-445',
    description: null,
    start_date: "2026-05-01T08:00:00.000Z",
    end_date: null,
    status: "active"
}
TEST_MISSIONS.push(MOCKMISSIONENTRY.name);

test.beforeAll(async () =>{
    await deleteTestData(supabase); // force clean up of mock data
    await seedTestTeams(supabase);
    await seedTestRoles(supabase, e2eTestRoles);
    await seedTestMissions(supabase);

    // fetchTestTeams
    const testTeams = await fetchTestTeams(supabase);
    const testTeam1 = testTeams[0];
    const testTeam2 = testTeams[1];

    // update e2eTestTeams
    SGTEST1.id = testTeam1.id;
    SGTEST2.id = testTeam2.id;

    const testRoles = await fetchTestRoles(supabase);

    const { data: fetchData, error: fetchError } = await supabase
        .from('roles')
        .select()
        .eq('name', 'Commanding Officer')
        .single();
    
    if(fetchError) throw new Error(`Failed to fetch Commanding Officer role: ${fetchError.message}`);

    const co = fetchData;

    const records = [
        { ...e2eTestRecords.e2eTestRec, team_id: testTeam1.id, role_id: co.id },
        { ...e2eTestRecords.e2eTestRec2, team_id: testTeam1.id, role_id: testRoles[0].id },
        { ...e2eTestRecords.e2eTestRec3, team_id: testTeam1.id },
        { ...e2eTestRecords.teamMember1, team_id: testTeam2.id, role_id: co.id },
        { ...e2eTestRecords.teamMember2, team_id: testTeam2.id, role_id: testRoles[0].id },
        { ...e2eTestRecords.teamMember3, team_id: testTeam2.id, role_id: testRoles[0].id },
    ].map(({ teams, roles, ...insertable }) => insertable);

    // Insert personnel with team IDs
    const dbRecords = await seedTestPersonnel(supabase, records);

    const teamLead1 = dbRecords.find(p => p.role_id === co.id && p.last_name !== e2eTestRecords.teamMember1.last_name);
    const teamLead2 = dbRecords.find(p => p.role_id === co.id && p.last_name === e2eTestRecords.teamMember1.last_name);

    // Update e2eTestTeams
    SGTEST1.commanding_officer = teamLead1.id;
    SGTEST2.commanding_officer = teamLead2.id;

    // Update e2eTestRecords
        // Team 1
    e2eTestRec.role_id = teamLead1.role_id;
    e2eTestRec.team_id = teamLead1.team_id;
    e2eTestRec.teams.designation = testTeam1.designation;
    e2eTestRec2.role_id = testRoles[0].role_id;
    e2eTestRec2.roles.name = testRoles[0].name;
    e2eTestRec2.team_id = teamLead1.team_id;
    e2eTestRec2.teams.designation = testTeam1.designation;
    e2eTestRec3.team_id = teamLead1.team_id;
    e2eTestRec3.teams.designation = testTeam1.designation;
        // Team 2
    teamMember1.role_id = teamLead2.role_id;
    teamMember1.team_id = teamLead2.team_id;
    teamMember1.teams.designation = testTeam2.designation;
    teamMember2.role_id = testRoles[0].role_id;
    teamMember2.roles.name = testRoles[0].name;
    teamMember2.team_id = teamLead2.team_id;
    teamMember2.teams.designation = testTeam2.designation;
    teamMember3.role_id = testRoles[0].role_id;
    teamMember3.roles.name = testRoles[0].name;
    teamMember3.team_id = teamLead2.team_id;
    teamMember3.teams.designation = testTeam1.designation;

    // populate teams with personnel
    const TEAMPERSONNELLINKS: TeamPersonnelLink[] =[
        {
            team_id: testTeam1.id,
            personnel_id: teamLead1.id
        },
        {
            team_id: testTeam1.id,
            personnel_id: dbRecords.find(p => p.team_id === testTeam1.id
                && p.first_name === e2eTestRecords.e2eTestRec2.first_name
                && p.last_name === e2eTestRecords.e2eTestRec2.last_name).id
        },
        {
            team_id: testTeam1.id,
            personnel_id: dbRecords.find(p => p.team_id === testTeam1.id
                && p.first_name === e2eTestRecords.e2eTestRec3.first_name
                && p.last_name === e2eTestRecords.e2eTestRec3.last_name).id
        },
        {
            team_id: testTeam2.id,
            personnel_id: teamLead2.id
        },
        {
            team_id: testTeam2.id,
            personnel_id: dbRecords.find(p => p.team_id === testTeam2.id
                && p.first_name === e2eTestRecords.teamMember2.first_name
                && p.last_name === e2eTestRecords.teamMember2.last_name).id
        },
        {
            team_id: testTeam2.id,
            personnel_id: dbRecords.find(p => p.team_id === testTeam2.id
                && p.first_name === e2eTestRecords.teamMember3.first_name
                && p.last_name === e2eTestRecords.teamMember3.last_name).id
        }
    ];
    await seedTeamPersonnelLinks(supabase, TEAMPERSONNELLINKS);

    // seed test missions
    const testMissions = await seedTestMissions(supabase);
    const mockMission1 = testMissions[0];
    const mockMission2 = testMissions[1];

    // populate missions with teams
    const MISSIONTEAMLINKS: MissionTeamLink[] = [
        {
            mission_id: mockMission1.id,
            team_id: testTeam1.id
        },
        {
            mission_id: mockMission2.id,
            team_id: testTeam2.id
        }
    ];
    await seedMissionTeamLinks(supabase, MISSIONTEAMLINKS);

    // add mission objectives
        // clean up previous runs
    await deleteTestObjectives(supabase, await fetchTestObjectives(supabase));

    const missionObjectives1 = completedObjectives.map(obj => ({
        ...obj,
        mission_id: mockMission1.id
    }));
    const missionObjectives2 = [
        ...missionObjectives,
        ...secretObjectives
    ].map(obj => ({
        ...obj,
        mission_id: mockMission2.id,
        is_completed: false
    }));

    await seedTestObjectives(supabase, missionObjectives1);
    await seedTestObjectives(supabase, missionObjectives2);
});

test.afterAll(async () =>{
    await deleteTestData(supabase);
});

const link = `${MOCKMISSION1.destination} | ${MOCKMISSION1.name} | ${MOCKMISSION1.status}`;

test.describe('read and verify (Missions)', async () => {
    test('should show list on mission home page view', async ({ page }) => {
        // Test navigation
        await page.goto(PATHS.MISSION_LIST);
        
        // Read data
        const heading = page.getByText('SGC Mission Records');
        const mission = page.getByText(link);

        // Assertions...
        await expect(page).toHaveURL(PATHS.MISSION_LIST);
        await expect(heading).toBeVisible();
        await expect(mission).toBeVisible();
    })
});