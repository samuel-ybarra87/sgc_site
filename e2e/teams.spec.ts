import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { PATHS } from "../src/lib/paths"
import { e2eTestRecords, e2eTestRoles, e2eTestTeams, TEST_TEAM_DESIGNATIONS } from "./mockData"
import {
    deleteTestData,
    extractName,
    fetchTestRoles,
    fetchTestTeams,
    getApiToken,
    loginAs,
    seedTestPersonnel,
    seedTestRoles,
    seedTestTeams,
    SGC_ADMIN,
    SGC_OFFICER,
    SGC_USER,
    updateTeam,
    type SeededTeam
} from './testUtils';
import type { Team } from './interface';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_KEY!
);

// personnel
const e2eTestRec = e2eTestRecords.e2eTestRec;
const e2eTestRec2 = e2eTestRecords.e2eTestRec2;
const e2eTestRec3 = e2eTestRecords.e2eTestRec3;
const e2eTestMilitary = e2eTestRecords.e2eTestMilitary;
const e2eTestCivilian = e2eTestRecords.e2eTestCivilian;
// teams
const SGC_MOCK_TEST = 'SGC-MOCK-TEST';
const SGC_EDIT_TEST = 'SGC-EDIT-TEST';
const SGC_HACK_TEST = 'SGC-HACK-TEST';
TEST_TEAM_DESIGNATIONS.push(SGC_MOCK_TEST);
TEST_TEAM_DESIGNATIONS.push(SGC_EDIT_TEST);
TEST_TEAM_DESIGNATIONS.push(SGC_HACK_TEST);
const e2eTestTeam1 = e2eTestTeams[0];
const e2eTestTeam2 = e2eTestTeams[1];
const members =[
    e2eTestRecords.teamMember1,
    e2eTestRecords.teamMember2,
    e2eTestRecords.teamMember3,
]

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () =>{
    await deleteTestData(supabase); // force clean up of mock data
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
    e2eTestTeam1.commanding_officer = (await updateTeam(supabase, { ...e2eTestTeam1, commanding_officer: teamLead.id })).commanding_officer;
});

test.afterAll(async () =>{
    await deleteTestData(supabase);
});

const link = e2eTestTeam1.designation;

test.describe('read and verify (Teams)', async () => {
    
    test('displays team list on team home page', async ({ page }) => {
        // login
        await loginAs(page, SGC_USER.email, SGC_USER.password);

        // Test navigation
        await page.getByRole('link', { name: 'TEAM LIST'}).click();

        // Read data
        const heading = page.getByText('SGC Team List');
        const team = page.getByText(link);

        // Assertions...
        await expect(page).toHaveURL(PATHS.TEAM_LIST);
        await expect(heading).toBeVisible();
        await expect(team).toBeVisible();
    });

    test('navigates to team detail page from team home page', async({ page }) =>{
        await loginAs(page, SGC_USER.email, SGC_USER.password);
        await page.getByRole('link', { name: 'TEAM LIST'}).click();

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
        await loginAs(page, SGC_USER.email, SGC_USER.password);
        await page.getByRole('link', { name: 'TEAM LIST'}).click();
        
        await page.getByRole('link', { name: link }).click();

        await page.getByRole('button', { name: 'Back' }).click();

        await expect(page).toHaveURL(PATHS.TEAM_LIST);
        await expect(page.getByText('SGC Team List')).toBeVisible();
        await expect(page.getByText(link)).toBeVisible();
    });

    test('detail page shows correct record data', async({ page }) =>{
        await loginAs(page, SGC_USER.email, SGC_USER.password);
        await page.getByRole('link', { name: 'TEAM LIST'}).click();

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

    test('edit button navigates to form with pre-populated data', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'TEAM LIST'}).click();

        await page.getByRole('link', { name: link }).click();

        await page.getByRole('button', { name: 'Edit' }).click();

        await expect(page.getByLabel('Designation')).toHaveValue(e2eTestTeam1.designation);
        await expect(page.getByLabel('Commanding Officer')).toHaveValue((e2eTestTeam1 as Team).commanding_officer as string);
        await expect(page.getByLabel('Status')).toHaveValue(e2eTestTeam1.status);
    });

    test('cancel button on edit form returns to list view', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'TEAM LIST'}).click();

        await page.getByRole('link', { name: link }).click();

        await page.getByRole('button', { name: 'Edit' }).click();

        await page.getByRole('button', { name: 'Cancel' }).click();

        await expect(page).toHaveURL(PATHS.TEAM_LIST);
        await expect(page.getByText('SGC Team List')).toBeVisible();
        await expect(page.getByText(link)).toBeVisible();
    });

    test('Add Team button navigates to empty form', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'TEAM LIST'}).click();

        await page.getByRole('button', { name: 'Add Team' }).click();

        await expect(page).toHaveURL(PATHS.TEAM_NEW);
        await expect(page.getByLabel('Designation')).toHaveValue('');
        await expect(page.getByLabel('Commanding Officer')).toHaveValue('');
        await expect(page.getByLabel('Status')).toHaveValue('active');
    });

    test('new form cancel button returns to list view', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'TEAM LIST'}).click();

        await page.getByRole('button', { name: 'Add Team' }).click();

        await page.getByRole('button', { name: 'Cancel' }).click();

        await expect(page).not.toHaveURL(PATHS.TEAM_NEW);
        await expect(page).toHaveURL(PATHS.TEAM_LIST);
        await expect(page.getByText('SGC Team List')).toBeVisible();
        await expect(page.getByText(link)).toBeVisible();});
});

test.describe('write then delete', async () =>{
    test.beforeEach(async ()=>{
        // clean up missed artifacts
        await supabase
            .from('teams')
            .delete()
            .in('designation', [SGC_MOCK_TEST, SGC_EDIT_TEST]);
    });

    test.afterEach(async ()=>{
        // remove test entry
        await supabase
            .from('teams')
            .delete()
            .in('designation', [SGC_MOCK_TEST, SGC_EDIT_TEST]);
    });

    test('saving a new record navigates to list view', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'TEAM LIST' }).click();
        await page.getByRole('button', { name: 'Add Team' }).click();

        await page.getByLabel('Designation').fill(SGC_MOCK_TEST);
        await page.getByLabel('Commanding Officer').selectOption(e2eTestTeam1.commanding_officer); // use real personnel UUID from mock data hydration
        await expect(page.getByLabel('Status')).toHaveValue(e2eTestTeam1.status);

        await page.getByRole('button', { name: 'Save' }).click();

        await expect(page).toHaveURL(PATHS.TEAM_LIST);
        await expect(page.getByRole('link', { name: SGC_MOCK_TEST })).toBeVisible();
    });

    test('saving an edited record navigates to list view', async ({ page }) =>{
        // Add test team to edit
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'TEAM LIST' }).click();
        await page.getByRole('button', { name: 'Add Team' }).click();

        await page.getByLabel('Designation').fill(SGC_MOCK_TEST);
        await page.getByLabel('Commanding Officer').selectOption(e2eTestTeam1.commanding_officer); // use real personnel UUID from mock data hydration
        await page.getByLabel('Status').selectOption(e2eTestTeam1.status);

        await page.getByRole('button', { name: 'Save' }).click();

        await expect(page).toHaveURL(PATHS.TEAM_LIST);
        await expect(page.getByText('SGC Team List')).toBeVisible();
        await expect(page.getByRole('link', { name: SGC_MOCK_TEST })).toBeVisible();
        await expect(page.getByRole('link', { name: SGC_EDIT_TEST })).not.toBeVisible();

        // Edit test team
        await page.getByRole('link', { name: SGC_MOCK_TEST }).click();
        await page.getByRole('button', { name: 'Edit' }).click();
        await page.getByLabel('Designation').fill(SGC_EDIT_TEST);
        await page.getByRole('button', { name: 'Save' }).click();

        // Assertions
        await expect(page).toHaveURL(PATHS.TEAM_LIST);
        await expect(page.getByText('SGC Team List')).toBeVisible();
        await expect(page.getByRole('link', { name: SGC_EDIT_TEST })).toBeVisible();
        await expect(page.getByRole('link', { name: SGC_MOCK_TEST })).not.toBeVisible();
    });

    test('confirming delete returns to list view', async ({ page }) =>{
        // Add test team to delete
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'TEAM LIST' }).click();
        await page.getByRole('button', { name: 'Add Team' }).click();

        await page.getByLabel('Designation').fill(SGC_MOCK_TEST);
        await page.getByLabel('Commanding Officer').selectOption(e2eTestTeam1.commanding_officer); // use real personnel UUID from mock data hydration
        await expect(page.getByLabel('Status')).toHaveValue(e2eTestTeam1.status);

        await page.getByRole('button', { name: 'Save' }).click();

        await page.getByRole('link', { name: SGC_MOCK_TEST }).click();

        page.on('dialog', dialog => dialog.accept());

        await page.getByRole('button', { name: 'Delete' }).click();

        await expect(page).toHaveURL(PATHS.TEAM_LIST);
        await expect(page.getByRole('link', { name: SGC_MOCK_TEST })).not.toBeVisible();
    });

    test('cancelling delete stays on detail page', async ({ page }) =>{
        // Add test team
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'TEAM LIST' }).click();
        await page.getByRole('button', { name: 'Add Team' }).click();

        await page.getByLabel('Designation').fill(SGC_MOCK_TEST);
        await page.getByLabel('Commanding Officer').selectOption(e2eTestTeam1.commanding_officer); // use real personnel UUID from mock data hydration
        await expect(page.getByLabel('Status')).toHaveValue(e2eTestTeam1.status);

        await page.getByRole('button', { name: 'Save' }).click();

        await page.getByRole('link', { name: SGC_MOCK_TEST }).click();

        page.on('dialog', dialog => dialog.dismiss());

        await page.getByRole('button', { name: 'Delete' }).click();

        await expect(page.getByText(SGC_MOCK_TEST)).toBeVisible();
        await expect(page).not.toHaveURL(PATHS.TEAM_LIST);
    });
});

test.describe('Team - API RBAC Security', async () =>{
    let userToken: string;
    let officerToken: string;

    const db = {
        url: `${process.env.VITE_SUPABASE_URL}/rest/v1/teams`,
        apikey: process.env.VITE_SUPABASE_ANON_KEY
    };

    const header = (token: string) => {
        return {
                'apikey': db.apikey!,
                'Authorization': `Bearer ${token}`, // Inject token
                'Content-Type': 'application/json',
                'Prefer': 'return=representation' // Tell PostgREST to return created object
            }
    }

    const HACKER: Team = {
        designation: SGC_HACK_TEST,
        commanding_officer: e2eTestTeam1.commanding_officer,
        status: 'active'
    }

    test.beforeAll(async ({ request }) =>{
        // Fetch tokens for both user and officer
        [userToken, officerToken] = await Promise.all([
            getApiToken(request, SGC_USER.email, SGC_USER.password),
            getApiToken(request, SGC_OFFICER.email, SGC_OFFICER.password)
        ]);
    });

    test.afterAll(async () =>{
        deleteTestData(supabase);
    })

    test('should reject unauthorized POST attempts with 403 Forbidden (User)', async ({ request }) =>{
        // Send a raw HTTP POST request to the Teams table endpoint
        const response = await request.post(`${db.url}`, {
            headers: header(userToken),
            data: HACKER
        });

        // Assertions
        const responseBody = await response.json();

        // Print error on failure as Playwright does not report it.
        if(response.status() !== 403) console.log("API Error Body:", responseBody);

        await expect(response.status()).toBe(403);
    });

    test('should reject unauthorized POST attempts with 403 Forbidden (Officer)', async ({ request }) =>{
        const response = await request.post(`${db.url}`, {
            headers: header(officerToken),
            data: HACKER
        });

        const responseBody = await response.json();
        if(response.status() !== 403) console.log("API Error Body:", responseBody);

        await expect(response.status()).toBe(403);
    });

    test('should silent block PATCH attempts (User)', async ({ request }) =>{
        // Get real team id
        const { data, error } = await supabase
            .from('teams')
            .select()
            .eq('designation', 'SG-1')
            .single();
        if(error) throw new Error(`Error occured - ${error.code}: ${error.message}`);
        if(!data) throw new Error(`No data returned`);
        const team: SeededTeam = data;

        team.designation = 'Hacked Team';

        // Send raw HTTP PATCH request to the Team table endpoint
        const response = await request.patch(`${db.url}?id=eq.${team.id}`, {
            headers: header(userToken),
            data: team
        });

        const responseBody = await response.json();
        if(response.status() !== 200) console.log("API Error Body:", responseBody);

        // Verify HTTP status is 200 (the defense trick)
        await expect(response.status()).toBe(200);

        // Verify EXACTLY 0 rows updated
        await expect(responseBody).toHaveLength(0);
    });

    test('officers can edit entries', async ({ page }) =>{
        // Add test team to edit
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'TEAM LIST' }).click();
        await page.getByRole('button', { name: 'Add Team' }).click();

        await page.getByLabel('Designation').fill(SGC_MOCK_TEST);
        await page.getByLabel('Commanding Officer').selectOption(e2eTestTeam1.commanding_officer); // use real personnel UUID from mock data hydration
        await page.getByLabel('Status').selectOption(e2eTestTeam1.status);

        await page.getByRole('button', { name: 'Save' }).click();

        // Log Admin out; Log Officer in
        await page.getByRole('button', { name: 'Log Out' }).click();
        await expect(page.getByText('SGC Personnel Access Portal')).toBeVisible();
        await loginAs(page, SGC_OFFICER.email, SGC_OFFICER.password);
        await page.getByRole('link', { name: 'TEAM LIST' }).click();

        await expect(page).toHaveURL(PATHS.TEAM_LIST);
        await expect(page.getByText('SGC Team List')).toBeVisible();
        await expect(page.getByRole('link', { name: SGC_MOCK_TEST })).toBeVisible();
        await expect(page.getByRole('link', { name: SGC_EDIT_TEST })).not.toBeVisible();

        // Edit test team
        await page.getByRole('link', { name: SGC_MOCK_TEST }).click();
        await page.getByRole('button', { name: 'Edit' }).click();
        await page.getByLabel('Designation').fill(SGC_EDIT_TEST);
        await page.getByRole('button', { name: 'Save' }).click();

        // Assertions
        await expect(page).toHaveURL(PATHS.TEAM_LIST);
        await expect(page.getByText('SGC Team List')).toBeVisible();
        await expect(page.getByRole('link', { name: SGC_EDIT_TEST })).toBeVisible();
        await expect(page.getByRole('link', { name: SGC_MOCK_TEST })).not.toBeVisible();
    });

    test('should silently block DELETE attempts (User)', async ({ request }) => {
        // Fetch a real team record to target
        const { data, error } = await supabase
            .from('teams')
            .select()
            .eq('designation', 'SG-1')
            .single();
        if(error) throw new Error(`Error occured - ${error.code}: ${error.message}`);
        if(!data) throw new Error(`No data returned`);
        const team: SeededTeam = data;

        // Attempt raw HTTP DELETE request
        const response = await request.delete(`${db.url}?id=eq.${team.id}`, {
            headers: header(userToken)
        });

        const responseBody = await response.json();
        if (response.status() !== 200) console.log("API Error Body:", responseBody);

        // Verify HTTP status is 200 (PostgREST silent defense)
        await expect(response.status()).toBe(200);

        // Verify EXACTLY 0 rows were returned/deleted
        await expect(responseBody).toHaveLength(0);
    });

    test('should silently block DELETE attempts (Officer)', async ({ request }) => {
        // Fetch the same team record
        const { data, error } = await supabase
            .from('teams')
            .select()
            .eq('designation', 'SG-1')
            .single();
        if(error) throw new Error(`Error occured - ${error.code}: ${error.message}`);
        if(!data) throw new Error(`No data returned`);
        const team: SeededTeam = data;

        // Attempt raw HTTP DELETE request using the Officer's token
        const response = await request.delete(`${db.url}?id=eq.${team.id}`, {
            headers: header(officerToken)
        });

        const responseBody = await response.json();
        if (response.status() !== 200) console.log("API Error Body:", responseBody);

        await expect(response.status()).toBe(200);
        await expect(responseBody).toHaveLength(0);
    });
})