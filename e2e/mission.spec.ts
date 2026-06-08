import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { PATHS } from "../src/lib/paths"
import { e2eMockMissionObjectives, e2eTestRecords, e2eTestRoles, e2eTestTeams, TEST_TEAM_DESIGNATIONS } from "./mockData"
import {
    deleteTestData,
    extractName,
    fetchTestRoles,
    fetchTestTeams,
    seedMissionTeamLinks,
    seedTeamPersonnelLinks,
    seedTestMissions,
    seedTestObjectives,
    seedTestPersonnel,
    seedTestRoles,
    seedTestTeams,
    updateTeam
} from './testUtils';
import { MissionTeamLink, Team, TeamPersonnelLink } from './interface';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () =>{
    await deleteTestData(supabase); // force clean up of mock data
    await seedTestTeams(supabase);
    await seedTestRoles(supabase, e2eTestRoles);
    await seedTestMissions(supabase);

    // fetchTestTeams
    const testTeams = await fetchTestTeams(supabase);
    const testTeam1 = testTeams[0];
    const testTeam2 = testTeams[1];

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
            team_id: testTeam1.id,
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
    const missionObjectives1 = e2eMockMissionObjectives.map(obj => ({
        ...obj,
        mission_id: mockMission1.id
    }));
    const missionObjectives2 = e2eMockMissionObjectives.map(obj => ({
        ...obj,
        mission_id: mockMission2.id
    }));
    await seedTestObjectives(supabase, missionObjectives1);
    await seedTestObjectives(supabase, missionObjectives2);
});

test.afterAll(async () =>{
    await deleteTestData(supabase);
});

test.describe('read and verify (Missions)', async () => {
    test('should do nothing', async ({ page }) => {
        // Test navigation
        await page.goto(PATHS.HOME);
        await page.pause();
    })
});