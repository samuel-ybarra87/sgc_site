import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { PATHS } from "../src/lib/paths"
import { e2eTestRecords, e2eTestRoles, e2eTestTeams } from "./mockData"
import {
    deleteTestData,
    extractName,
    fetchTestRoles,
    fetchTestTeams,
    seedTestPersonnel,
    seedTestRoles,
    seedTestTeams
} from './testUtils';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// personnel
const e2eTestRec = e2eTestRecords.e2eTestRec;
const e2eTestRec2 = e2eTestRecords.e2eTestRec2;
const e2eTestRec3 = e2eTestRecords.e2eTestRec3;
const e2eTestMilitary = e2eTestRecords.e2eTestMilitary;
const e2eTestCivilian = e2eTestRecords.e2eTestCivilian;
// teams
const SGC_MOCK_TEST = 'SGC-MOCK-TEST';
const e2eTestTeam1 = e2eTestTeams[0];
const e2eTestTeam2 = e2eTestTeams[1];
const members =[
    e2eTestRecords.teamMember1,
    e2eTestRecords.teamMember2,
    e2eTestRecords.teamMember3,
]

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () =>{
    await seedTestTeams(supabase);
    await seedTestRoles(supabase, e2eTestRoles);

    // fetchTestTeams
    const testTeams = await fetchTestTeams(supabase);
    const testTeam1 = testTeams![0];
    const testTeam2 = testTeams![1];

    const testRoles = await fetchTestRoles(supabase);

    const { data: fetchData, error: fetchError } = await supabase
        .from('roles')
        .select()
        .eq('name', 'Commanding Officer')
        .single();
    
    if(fetchError) throw new Error(`Failed to fetch Commanding Officer role: ${fetchError.message}`);

    const co = fetchData;

    const { data: unassignedTeam, error: fetchUnassignedTeamError } = await supabase
        .from('teams')
        .select()
        .eq('designation', 'Unassigned')
        .single();

    if(fetchUnassignedTeamError) throw new Error(`Failed to fetch Unassigned team: ${fetchUnassignedTeamError}`);

    const unassigned = unassignedTeam;

    const records = [
        { ...e2eTestRec, team_id: testTeam1.id, role_id: co.id },
        { ...e2eTestRec2, team_id: testTeam1.id, role_id: testRoles[0].id },
        { ...e2eTestRec3, team_id: testTeam1.id },
        { ...e2eTestMilitary, team_id: unassigned.id, role_id: testRoles[0].id },
        { ...e2eTestCivilian, team_id: testTeam2.id, role_id: testRoles[0].id },
        { ...e2eTestRecords.teamMember1, team_id: testTeam1.id, role_id: testRoles[0].id },
        { ...e2eTestRecords.teamMember2, team_id: testTeam1.id, role_id: testRoles[0].id },
        { ...e2eTestRecords.teamMember3, team_id: testTeam1.id, role_id: testRoles[0].id },
    ].map(({ teams, roles, ...insertable }) => insertable);

    // Insert personnel with team IDs
    const dbRecords = await seedTestPersonnel(supabase, records);

    const teamLead = dbRecords.find(p => p.role_id === co.id)

    // Update e2e Test Records
    // personnel
    e2eTestRec.team_id = testTeam1.id;
    e2eTestRec.teams.designation = testTeam1.designation;
    e2eTestRec.role_id = co.id;
    e2eTestRec.roles.name = co.name;

    e2eTestRec2.team_id = testTeam1.id;
    e2eTestRec2.teams.designation = testTeam1.designation;
    e2eTestRec2.role_id = testRoles[0].id;
    e2eTestRec2.roles.name = testRoles[0].name;

    e2eTestRec3.team_id = testTeam1.id;
    e2eTestRec3.teams.designation = testTeam1.designation;

    e2eTestMilitary.team_id = unassigned.id;
    e2eTestMilitary.teams.designation = unassigned.designation
    e2eTestMilitary.role_id = testRoles[0].id;
    e2eTestMilitary.roles.name = testRoles[0].name;

    e2eTestCivilian.team_id = testTeam2.id;
    e2eTestCivilian.teams.designation = testTeam2.designation;
    e2eTestCivilian.role_id = testRoles[0].id;
    e2eTestCivilian.roles.name = testRoles[0].name;

    // teams
    e2eTestTeam1.commanding_officer = teamLead.id;

});

test.afterAll(async () =>{
    await deleteTestData(supabase);
});

test.describe('read and verify (Teams)', async () => {
    const link = e2eTestTeam1.designation;
    
    test('displays team list on personnel home page', async ({ page }) => {
        // Test navigation
        await page.goto(PATHS.TEAM_LIST);

        // Read data
        const heading = page.getByText('SGC Team List');
        const team = page.getByText(link);

        // Assertions...
        await expect(page).toHaveURL(PATHS.TEAM_LIST);
        await expect(heading).toBeVisible();
        await expect(team).toBeVisible();
    });

    test('navigates to team detail page from team home page', async({ page }) =>{
        await page.goto(PATHS.TEAM_LIST);

        await page.getByRole('link', { name: link }).click();

        // headers
        await expect(page.getByRole('heading', { name: e2eTestTeam1.designation, level: 1 })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Current Members', level: 3 })).toBeVisible();
        // active members
        await expect(page.getByText(new RegExp(`${e2eTestRec.roles.name}: ${extractName(e2eTestRec).listName}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`${members[0].roles.name}: ${extractName(members[0]).listName}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`${members[1].roles.name}: ${extractName(members[1]).listName}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`${members[2].roles.name}: ${extractName(members[2]).listName}`))).toBeVisible();
        // status
        await expect(page.getByRole('heading', { name: 'Status: active', level: 4 })).toBeVisible();
        // Other members
        await expect(page.getByRole('heading', { name: 'Other Members', level: 3 })).toBeVisible();
        await expect(page.getByText(extractName(e2eTestRec2).listName)).toBeVisible();
        await expect(page.getByText(extractName(e2eTestRec3).listName)).toBeVisible();
    });

    test('back button returns to list view', async ({ page }) =>{
        await page.goto(PATHS.TEAM_LIST);
        
        await page.getByRole('link', { name: link }).click();

        await page.getByRole('button', { name: 'Back' }).click();

        await expect(page).toHaveURL(PATHS.TEAM_LIST);
        await expect(page.getByText('SGC Team List')).toBeVisible();
        await expect(page.getByText(link)).toBeVisible();
    });

    test('detail page shows correct record data', async({ page }) =>{
        await page.goto(PATHS.TEAM_LIST);

        await page.getByRole('link', { name: link }).click();

        // headers
        await expect(page.getByRole('heading', { name: e2eTestTeam1.designation, level: 1 })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Current Members', level: 3 })).toBeVisible();
        // active members
        await expect(page.getByText(new RegExp(`${e2eTestRec.roles.name}: ${extractName(e2eTestRec).listName}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`${members[0].roles.name}: ${extractName(members[0]).listName}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`${members[1].roles.name}: ${extractName(members[1]).listName}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`${members[2].roles.name}: ${extractName(members[2]).listName}`))).toBeVisible();
        // status
        await expect(page.getByRole('heading', { name: 'Status: active', level: 4 })).toBeVisible();
        // Other members
        await expect(page.getByRole('heading', { name: 'Other Members', level: 3 })).toBeVisible();
        await expect(page.getByText(extractName(e2eTestRec2).listName)).toBeVisible();
        await expect(page.getByText(extractName(e2eTestRec3).listName)).toBeVisible();

        await page.getByRole('button', { name: 'Back' }).click();

        await page.getByRole('link', { name: e2eTestTeam2.designation }).click();

        await page.pause();

        // headers
        await expect(page.getByRole('heading', { name: e2eTestTeam2.designation, level: 1 })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Current Members', level: 3 })).toBeVisible();
        // active members
        await expect(page.getByText(new RegExp(`${e2eTestCivilian.roles.name}: ${extractName(e2eTestCivilian).listName}`))).toBeVisible();
        // status
        await expect(page.getByRole('heading', { name: 'Status: active', level: 4 })).toBeVisible();
        // Other members
        await expect(page.getByRole('heading', { name: 'Other Members', level: 3 })).not.toBeVisible();
    });

    test('edit button navigates to form with pre-populated data', async ({ page }) =>{});

    test('cancel button on edit form returns to list view', async ({ page }) =>{});

    test('Add Team button navigates to empty form', async ({ page }) =>{});

    test('new form cancel button returns to list view', async ({ page }) =>{});
});

test.describe('write then delete', async () =>{
    test('saving a new record navigates to list view', async ({ page }) =>{});

    test('saving an edited record navigates to list view', async ({ page }) =>{});

    test('confirming delete returns to list view', async ({ page }) =>{});

    test('cancelling delete stays on detail page', async ({ page }) =>{});

});