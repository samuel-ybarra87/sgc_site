import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { PATHS } from "../src/lib/paths"
import { e2eTestRecords, e2eTestRoles } from "./mockData"
import {
    deleteTestData,
    extractName,
    fetchTestRoles,
    fetchTestTeams,
    loginAs,
    seedTestPersonnel,
    seedTestRoles,
    seedTestTeams,
    SGC_ADMIN,
    SGC_OFFICER,
    SGC_USER
} from './testUtils';

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

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () =>{
    await deleteTestData(supabase); // force deletion of mock data
    await seedTestTeams(supabase);
    await seedTestRoles(supabase, e2eTestRoles);
});

test.afterAll(async () =>{
    await deleteTestData(supabase);
});

test.describe('read and verify (Personnel)', async () => {
    const displayName = extractName(e2eTestRec).displayName;
    const link = extractName(e2eTestRec).link;
    const civilian_link = extractName(e2eTestCivilian).link;
    const civilianName = extractName(e2eTestCivilian).displayName;
    
    test.beforeAll(async () => {
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

        const records = [
            { ...e2eTestRec, team_id: testTeam1.id, role_id: co.id },
            { ...e2eTestRec2, team_id: testTeam1.id, role_id: testRoles[0].id },
            { ...e2eTestRec3, team_id: testTeam1.id },
            { ...e2eTestCivilian, team_id: testTeam2.id, role_id: testRoles[0].id }
        ].map(({ teams, roles, ...insertable }) => insertable);

        // Insert personnel with team IDs
        await seedTestPersonnel(supabase, records);

        // Update e2eTestRecords
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

        e2eTestCivilian.team_id = testTeam2.id;
        e2eTestCivilian.teams.designation = testTeam2.designation;
        e2eTestCivilian.role_id = testRoles[0].id;
        e2eTestCivilian.roles.name = testRoles[0].name;
    });

    test('displays personnel list on personnel home page', async ({ page }) => {
        //login
        await loginAs(page, SGC_USER.email, SGC_USER.password);

        // Test navigation
        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();

        // Read data
        const heading = page.getByText('SGC Personnel');
        const sam = page.getByText(link);

        // Assertions...
        await expect(page).toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(heading).toBeVisible();
        await expect(sam).toBeVisible();
    });

    test('navigates to personnel detail page from personnel home page', async({ page }) =>{
        await loginAs(page, SGC_USER.email, SGC_USER.password);
        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();

        await page.getByRole('link', { name: link }).click();

        await expect(page.getByRole('heading', { name: displayName })).toBeVisible();
        await expect(page.getByText(new RegExp(`Rank: ${e2eTestRec.rank}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Team: ${e2eTestRec.teams.designation}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Role: ${e2eTestRec.role}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Status: ${e2eTestRec.status}`))).toBeVisible();
        await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();

        await page.getByRole('button', { name: 'Back' }).click();
        await page.getByRole('link', { name: civilian_link }).click();

        await expect(page.getByRole('heading', { name: civilianName })).toBeVisible();
        await expect(page.getByText(/Civilian Contractor/)).toBeVisible();
        await expect(page.getByText(new RegExp(`Team: ${e2eTestCivilian.teams.designation}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Role: ${e2eTestCivilian.role}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Status: ${e2eTestCivilian.status}`))).toBeVisible();
        await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    });

    test('back button returns to list view', async ({ page }) =>{
        await loginAs(page, SGC_USER.email, SGC_USER.password);
        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();
        
        await page.getByRole('link', { name: link }).click();

        await page.getByRole('button', { name: 'Back' }).click();

        await expect(page).toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(page.getByText('SGC Personnel')).toBeVisible();
        await expect(page.getByText(link)).toBeVisible();
    });

    test('detail page shows correct record data', async ({ page }) =>{
        await loginAs(page, SGC_USER.email, SGC_USER.password);
        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();

        await page.getByRole('link', { name: link}).click();
        
        await expect(page.getByRole('heading', { name: displayName })).toBeVisible();
        await expect(page.getByText(new RegExp(`Rank: ${e2eTestRec.rank}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Team: ${e2eTestRec.teams.designation}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Role: ${e2eTestRec.roles.name}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Status: ${e2eTestRec.status}`))).toBeVisible();
        
        await page.getByRole('button', { name: 'Back' }).click();

        await page.getByRole('link', { name: extractName(e2eTestRec2).link }).click();

        await expect(page.getByRole('heading', { name: extractName(e2eTestRec2).displayName })).toBeVisible();
        await expect(page.getByText(new RegExp(`Rank: ${e2eTestRec2.rank}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Team: ${e2eTestRec2.teams.designation}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Role: ${e2eTestRec2.role}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Status: ${e2eTestRec2.status}`))).toBeVisible();
        
        await page.getByRole('button', { name: 'Back' }).click();
        
        await page.getByRole('link', { name: extractName(e2eTestRec3).link }).click();
        
        await expect(page.getByRole('heading', { name: extractName(e2eTestRec3).displayName })).toBeVisible();
        await expect(page.getByText(/Civilian Contractor/)).toBeVisible();
        await expect(page.getByText(new RegExp(`Team: ${e2eTestRec3.teams.designation}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Role: ${e2eTestRec3.role}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Status: ${e2eTestRec3.status}`))).toBeVisible();
    });

    test('edit button navigates to form with pre-populated data', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();
        
        await page.getByRole('link', { name: link }).click();

        await page.getByRole('button', { name: 'Edit' }).click();

        //Assertions...
        await expect(page.getByLabel('Prefix')).toHaveValue(`${e2eTestRec.prefix}`);
        await expect(page.getByLabel('First Name')).toHaveValue(`${e2eTestRec.first_name}`);
        await expect(page.getByLabel('Middle Name')).toHaveValue(`${e2eTestRec.middle_name}`);
        await expect(page.getByLabel('Last Name')).toHaveValue(`${e2eTestRec.last_name}`);
        await expect(page.getByLabel('Suffix')).toHaveValue(`${e2eTestRec.suffix}`);
        await expect(page.getByLabel('Rank')).toHaveValue(`${e2eTestRec.rank}`);
        await expect(page.getByLabel('Role')).toHaveValue(`${e2eTestRec.role_id}`);
        await expect(page.getByLabel('Team')).toHaveValue(`${e2eTestRec.team_id}`);
        await expect(page.getByLabel('Personnel Type')).toHaveValue(`${e2eTestRec.personnel_type}`);
        await expect(page.getByLabel('Status')).toHaveValue(`${e2eTestRec.status}`);
    });

    test('cancel button on edit form returns to list view', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();
        
        await page.getByRole('link', { name: link }).click();

        await page.getByRole('button', { name: 'Edit' }).click();

        await page.getByRole('button', { name: 'Cancel' }).click();

        await expect(page).toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(page.getByText('SGC Personnel')).toBeVisible();
        await expect(page.getByText(link)).toBeVisible();
    });

    test('Add Personnel button navigates to empty form', async ({ page }) =>{ 
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();
        await page.getByRole('button', { name: 'Add Personnel' }).click();

        // Assertions...
        await expect(page).toHaveURL(PATHS.PERSONNEL_NEW);
        await expect(page.getByText('Add Personnel')).toBeVisible();
        await expect(page.getByLabel('Prefix')).toHaveValue('');
        await expect(page.getByLabel('First Name')).toHaveValue('');
        await expect(page.getByLabel('Middle Name')).toHaveValue('');
        await expect(page.getByLabel('Last Name')).toHaveValue('');
        await expect(page.getByLabel('Suffix')).toHaveValue('');
        await expect(page.getByLabel('Rank')).toHaveValue('');
        await expect(page.getByLabel('Role')).toHaveValue('');
        await expect(page.getByLabel('Team')).toHaveValue('');
        await expect(page.getByLabel('Personnel Type')).toHaveValue('military');
        await expect(page.getByLabel('Status')).toHaveValue('active');
    });

    test('new form cancel button returns to list view', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();

        await page.getByRole('button', { name: 'Add Personnel' }).click();

        await page.getByRole('button', { name: 'Cancel' }).click();

        await expect(page).toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(page.getByText('SGC Personnel')).toBeVisible();
        await expect(page.getByText(link)).toBeVisible();
    });
});

test.describe('write then delete', async () =>{
    const link = extractName(e2eTestMilitary).link;
    const displayName = extractName(e2eTestMilitary).displayName;

    test.beforeAll(async () =>{
        const testTeams = await fetchTestTeams(supabase);
        const { data, error } = await supabase
            .from('roles')
            .select()
            .eq('name', 'Commanding Officer')
            .single();

        if(error) throw new Error(`Failed to fetch 'Commanding Officer': ${error.message}`);

        const co = data;

        const testTeam = testTeams![0];
        e2eTestMilitary.team_id = testTeam.id;
        e2eTestMilitary.teams.designation = testTeam.designation;
        e2eTestMilitary.role_id = co.id;
        e2eTestMilitary.roles.name = co.name;
    });

    // Prevent skipped clean ups
    test.beforeEach(async () => {
        await supabase
            .from('personnel')
            .delete()
            .eq('first_name', e2eTestMilitary.first_name)
            .eq('last_name', e2eTestMilitary.last_name);
    });

    // Clean database after tests
    test.afterEach(async () => {
        await supabase
            .from('personnel')
            .delete()
            .eq('first_name', e2eTestMilitary.first_name)
            .eq('last_name', e2eTestMilitary.last_name);
    });

    test('saving a new record navigates to list view', async ({ page }) =>{ 
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();
        await page.getByRole('button', { name: 'Add Personnel' }).click();

        // Select Options
        await page.getByLabel('Prefix').selectOption(e2eTestMilitary.prefix ?? '');
        await page.getByLabel('Rank').selectOption(e2eTestMilitary.rank ?? '');
        await page.getByLabel('Personnel Type').selectOption(e2eTestMilitary.personnel_type ?? '');
        await page.getByLabel('Status').selectOption(e2eTestMilitary.status ?? '');
        await page.getByLabel('Team').selectOption(e2eTestMilitary.team_id ?? '');
        await page.getByLabel('Role').selectOption(e2eTestMilitary.role_id);
        // Fill fields
        await page.getByLabel('First Name').fill(e2eTestMilitary.first_name ?? '');
        await page.getByLabel('Middle Name').fill(e2eTestMilitary.middle_name ?? '');
        await page.getByLabel('Last Name').fill(e2eTestMilitary.last_name ?? '');
        await page.getByLabel('Suffix').fill(e2eTestMilitary.suffix ?? '');
        
        await page.getByRole("button", { name: "Save" }).click();

        await expect(page).toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(page.getByText('SGC Personnel')).toBeVisible();
        await expect(page.getByText(link)).toBeVisible();
    });

    test('saving an edited record navigates to list view', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();
        await page.getByRole('button', { name: 'Add Personnel' }).click();

        // Select Options
        await page.getByLabel('Prefix').selectOption(e2eTestMilitary.prefix ?? '');
        await page.getByLabel('Rank').selectOption(e2eTestMilitary.rank ?? '');
        await page.getByLabel('Personnel Type').selectOption(e2eTestMilitary.personnel_type ?? '');
        await page.getByLabel('Status').selectOption(e2eTestMilitary.status ?? '');
        await page.getByLabel('Team').selectOption(e2eTestMilitary.team_id ?? '');
        await page.getByLabel('Role').selectOption(e2eTestMilitary.role_id);
        // Fill fields
        await page.getByLabel('First Name').fill(e2eTestMilitary.first_name ?? '');
        await page.getByLabel('Middle Name').fill(e2eTestMilitary.middle_name ?? '');
        await page.getByLabel('Last Name').fill(e2eTestMilitary.last_name ?? '');
        await page.getByLabel('Suffix').fill(e2eTestMilitary.suffix ?? '');
        
        await page.getByRole("button", { name: "Save" }).click();

        await page.getByRole("link", { name: link }).click();

        await page.getByRole("button", { name: "Edit" }).click();

        await page.getByLabel('Status').selectOption('kia');

        await page.getByRole("button", { name: "Save" }).click();

        await expect(page).toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(page.getByText('SGC Personnel')).toBeVisible();
        await expect(page.getByText(link)).toBeVisible();

        await page.getByRole("link", { name: link }).click();
        
        await expect(page.getByText(displayName)).toBeVisible();
        await expect(page.getByText(new RegExp(/Status: kia/))).toBeVisible();
    });

    test('confirming delete returns to list view', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();
        await page.getByRole('button', { name: 'Add Personnel' }).click();

        // Select Options
        await page.getByLabel('Prefix').selectOption(e2eTestMilitary.prefix ?? '');
        await page.getByLabel('Rank').selectOption(e2eTestMilitary.rank ?? '');
        await page.getByLabel('Personnel Type').selectOption(e2eTestMilitary.personnel_type ?? '');
        await page.getByLabel('Status').selectOption(e2eTestMilitary.status ?? '');
        await page.getByLabel('Team').selectOption(e2eTestMilitary.team_id ?? '');
        await page.getByLabel('Role').selectOption(e2eTestMilitary.role_id ?? '');
        // Fill fields
        await page.getByLabel('First Name').fill(e2eTestMilitary.first_name ?? '');
        await page.getByLabel('Middle Name').fill(e2eTestMilitary.middle_name ?? '');
        await page.getByLabel('Last Name').fill(e2eTestMilitary.last_name ?? '');
        await page.getByLabel('Suffix').fill(e2eTestMilitary.suffix ?? '');
        
        await page.getByRole("button", { name: "Save" }).click();

        await page.getByRole("link", { name: link }).click();

        page.on('dialog', dialog => dialog.accept());

        await page.getByRole("button", { name: "Delete" }).click();

        await expect(page).toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(page.getByText('SGC Personnel')).toBeVisible();
        await expect(page.getByText(link)).not.toBeVisible();
    });

    test('cancelling delete stays on detail page', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);
        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();
        await page.getByRole('button', { name: 'Add Personnel' }).click();

        // Select Options
        await page.getByLabel('Prefix').selectOption(e2eTestMilitary.prefix ?? '');
        await page.getByLabel('Rank').selectOption(e2eTestMilitary.rank ?? '');
        await page.getByLabel('Personnel Type').selectOption(e2eTestMilitary.personnel_type ?? '');
        await page.getByLabel('Status').selectOption(e2eTestMilitary.status ?? '');
        await page.getByLabel('Team').selectOption(e2eTestMilitary.team_id ?? '');
        await page.getByLabel('Role').selectOption(e2eTestMilitary.role_id);
        // Fill fields
        await page.getByLabel('First Name').fill(e2eTestMilitary.first_name ?? '');
        await page.getByLabel('Middle Name').fill(e2eTestMilitary.middle_name ?? '');
        await page.getByLabel('Last Name').fill(e2eTestMilitary.last_name ?? '');
        await page.getByLabel('Suffix').fill(e2eTestMilitary.suffix ?? '');
        
        await page.getByRole("button", { name: "Save" }).click();

        await page.getByRole("link", { name: link }).click();

        page.on('dialog', dialog => dialog.dismiss());

        await page.getByRole("button", { name: "Delete" }).click();

        await expect(page).not.toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(page.getByText('SGC Personnel')).not.toBeVisible();
        await expect(page.getByText(link)).not.toBeVisible();
        await expect(page.getByText(displayName)).toBeVisible();
    });
});