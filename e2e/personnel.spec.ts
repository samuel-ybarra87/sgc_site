import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { PATHS } from "../src/lib/paths"
import { e2eTestRecords } from "./mockData"
import {
    deleteTestPersonnel,
    deleteTestTeams,
    extractName,
    fetchTestPersonnel,
    fetchTestTeams,
    seedTestPersonnel,
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

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () =>{
    await seedTestTeams(supabase);
});

test.afterAll(async () =>{
    // personnnel
    await deleteTestPersonnel(supabase, await fetchTestPersonnel(supabase));
    // teams
    await deleteTestTeams(supabase, await fetchTestTeams(supabase));
});

test.describe('read and verify', async () => {
    const displayName = extractName(e2eTestRec).displayName;
    const link = extractName(e2eTestRec).link;
    const civilian_link = extractName(e2eTestCivilian).link;
    const civilianName = extractName(e2eTestCivilian).displayName;
    
    test.beforeAll(async () => {
        // fetchTestTeams
        const testTeams = await fetchTestTeams(supabase);
        const testTeam1 = testTeams![0];
        const testTeam2 = testTeams![1];

        const records = [
            { ...e2eTestRec, team_id: testTeam1.id },
            { ...e2eTestRec2, team_id: testTeam1.id },
            { ...e2eTestRec3, team_id: testTeam1.id },
            { ...e2eTestCivilian, team_id: testTeam2.id }
        ].map(({ teams, ...insertable }) => insertable);

        // Insert personnel with team IDs
        await seedTestPersonnel(supabase, records);

        // Update e2eTestRecords
        e2eTestRec.team_id = testTeam1.id;
        e2eTestRec.teams.designation = testTeam1.designation;

        e2eTestRec2.team_id = testTeam1.id;
        e2eTestRec2.teams.designation = testTeam1.designation;

        e2eTestRec3.team_id = testTeam1.id;
        e2eTestRec3.teams.designation = testTeam1.designation;

        e2eTestCivilian.team_id = testTeam2.id;
        e2eTestCivilian.teams.designation = testTeam2.designation;
    });

    test('displays personnel list on personnel home page', async ({ page }) => {
        // Test navigation
        await page.goto(PATHS.PERSONNEL_LIST);

        // Read data
        const heading = page.getByText('SGC Personnel');
        const sam = page.getByText(link);

        // Assertions...
        await expect(page).toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(heading).toBeVisible();
        await expect(sam).toBeVisible(); // Can't be found?
    });

    test('navigates to personnel detail page from personnel home page', async({ page }) =>{
        await page.goto(PATHS.PERSONNEL_LIST);

        await page.getByRole('link', { name: link }).click();

        await expect(page.getByRole('heading', { name: displayName })).toBeVisible();
        await expect(page.getByText(new RegExp(`Rank: ${e2eTestRec.rank}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Team: ${e2eTestRec.teams.designation}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Role: ${e2eTestRec.role}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Status: ${e2eTestRec.status}`))).toBeVisible();
        await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();

        await page.goto(PATHS.PERSONNEL_LIST);
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
        await page.goto(PATHS.PERSONNEL_LIST);
        
        await page.getByRole('link', { name: link }).click();

        await page.getByRole('button', { name: 'Back' }).click();

        await expect(page).toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(page.getByText('SGC Personnel')).toBeVisible();
        await expect(page.getByText(link)).toBeVisible();
    });

    test('detail page shows correct record data', async ({ page }) =>{
        await page.goto(PATHS.PERSONNEL_LIST);

        await page.getByRole('link', { name: link}).click();
        
        await expect(page.getByRole('heading', { name: displayName })).toBeVisible();
        await expect(page.getByText(new RegExp(`Rank: ${e2eTestRec.rank}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Team: ${e2eTestRec.teams.designation}`))).toBeVisible();
        await expect(page.getByText(new RegExp(`Role: ${e2eTestRec.role}`))).toBeVisible();
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
        await page.goto(PATHS.PERSONNEL_LIST);
        
        await page.getByRole('link', { name: link }).click();

        await page.getByRole('button', { name: 'Edit' }).click();

        //Assertions...
        await expect(page.getByLabel('Prefix')).toHaveValue(`${e2eTestRec.prefix}`);
        await expect(page.getByLabel('First Name')).toHaveValue(`${e2eTestRec.first_name}`);
        await expect(page.getByLabel('Middle Name')).toHaveValue(`${e2eTestRec.middle_name}`);
        await expect(page.getByLabel('Last Name')).toHaveValue(`${e2eTestRec.last_name}`);
        await expect(page.getByLabel('Suffix')).toHaveValue(`${e2eTestRec.suffix}`);
        await expect(page.getByLabel('Rank')).toHaveValue(`${e2eTestRec.rank}`);
        await expect(page.getByLabel('Role')).toHaveValue(`${e2eTestRec.role}`);
        await expect(page.getByLabel('Team')).toHaveValue(`${e2eTestRec.team_id}`);
        await expect(page.getByLabel('Personnel Type')).toHaveValue(`${e2eTestRec.personnel_type}`);
        await expect(page.getByLabel('Status')).toHaveValue(`${e2eTestRec.status}`);
    });

    test('cancel button on edit form returns to list view', async ({ page }) =>{
        await page.goto(PATHS.PERSONNEL_LIST);
        
        await page.getByRole('link', { name: link }).click();

        await page.getByRole('button', { name: 'Edit' }).click();

        await page.getByRole('button', { name: 'Cancel' }).click();

        await expect(page).toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(page.getByText('SGC Personnel')).toBeVisible();
        await expect(page.getByText(link)).toBeVisible();
    });

    test('Add Personnel button navigates to empty form', async ({ page }) =>{
        await page.goto(PATHS.PERSONNEL_LIST);

        await page.getByRole('button', { name: 'Add Personnel' }).click();

        // Assertions...
        await expect(page).toHaveURL(PATHS.PERSONNEL_NEW);
        await expect(page.getByText('Add Personnel')).toBeVisible();
        await expect(page.getByLabel('Status')).toHaveValue('active');
    });

    test('new form cancel button returns to list view', async ({ page }) =>{
        await page.goto(PATHS.PERSONNEL_LIST);

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
        const testTeam = testTeams![0];
        e2eTestMilitary.team_id = testTeam.id;
        e2eTestMilitary.teams.designation = testTeam.designation;
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
        await page.goto(PATHS.PERSONNEL_LIST);

        await page.getByRole('button', { name: 'Add Personnel' }).click();

        // Select Options
        await page.getByLabel('Prefix').selectOption(e2eTestMilitary.prefix ?? '');
        await page.getByLabel('Rank').selectOption(e2eTestMilitary.rank ?? '');
        await page.getByLabel('Personnel Type').selectOption(e2eTestMilitary.personnel_type ?? '');
        await page.getByLabel('Status').selectOption(e2eTestMilitary.status ?? '');
        await page.getByLabel('Team').selectOption(e2eTestMilitary.team_id ?? '');
        // Fill fields
        await page.getByLabel('First Name').fill(e2eTestMilitary.first_name ?? '');
        await page.getByLabel('Middle Name').fill(e2eTestMilitary.middle_name ?? '');
        await page.getByLabel('Last Name').fill(e2eTestMilitary.last_name ?? '');
        await page.getByLabel('Suffix').fill(e2eTestMilitary.suffix ?? '');
        await page.getByLabel('Role').fill(e2eTestMilitary.role ?? '');
        
        await page.getByRole("button", { name: "Save" }).click();

        await expect(page).toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(page.getByText('SGC Personnel')).toBeVisible();
        await expect(page.getByText(link)).toBeVisible();
    });

    test('saving an edited record navigates to list view', async ({ page }) =>{        
        await page.goto(PATHS.PERSONNEL_LIST);

        await page.getByRole('button', { name: 'Add Personnel' }).click();

        // Select Options
        await page.getByLabel('Prefix').selectOption(e2eTestMilitary.prefix ?? '');
        await page.getByLabel('Rank').selectOption(e2eTestMilitary.rank ?? '');
        await page.getByLabel('Personnel Type').selectOption(e2eTestMilitary.personnel_type ?? '');
        await page.getByLabel('Status').selectOption(e2eTestMilitary.status ?? '');
        await page.getByLabel('Team').selectOption(e2eTestMilitary.team_id ?? '');
        // Fill fields
        await page.getByLabel('First Name').fill(e2eTestMilitary.first_name ?? '');
        await page.getByLabel('Middle Name').fill(e2eTestMilitary.middle_name ?? '');
        await page.getByLabel('Last Name').fill(e2eTestMilitary.last_name ?? '');
        await page.getByLabel('Suffix').fill(e2eTestMilitary.suffix ?? '');
        await page.getByLabel('Role').fill(e2eTestMilitary.role ?? '');
        
        await page.getByRole("button", { name: "Save" }).click();

        await page.getByRole("link", { name: link }).click();

        await page.getByRole("button", { name: "Edit" }).click();

        await page.getByLabel('Status').selectOption('kia');

        await page.getByRole("button", { name: "Save" }).click();

        await expect(page).toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(page.getByText('SGC Personnel')).toBeVisible();
        await expect(page.getByText(link)).toBeVisible();
    });

    test('confirming delete returns to list view', async ({ page }) =>{        
        await page.goto(PATHS.PERSONNEL_LIST);

        await page.getByRole('button', { name: 'Add Personnel' }).click();

        // Select Options
        await page.getByLabel('Prefix').selectOption(e2eTestMilitary.prefix ?? '');
        await page.getByLabel('Rank').selectOption(e2eTestMilitary.rank ?? '');
        await page.getByLabel('Personnel Type').selectOption(e2eTestMilitary.personnel_type ?? '');
        await page.getByLabel('Status').selectOption(e2eTestMilitary.status ?? '');
        await page.getByLabel('Team').selectOption(e2eTestMilitary.team_id ?? '');
        // Fill fields
        await page.getByLabel('First Name').fill(e2eTestMilitary.first_name ?? '');
        await page.getByLabel('Middle Name').fill(e2eTestMilitary.middle_name ?? '');
        await page.getByLabel('Last Name').fill(e2eTestMilitary.last_name ?? '');
        await page.getByLabel('Suffix').fill(e2eTestMilitary.suffix ?? '');
        await page.getByLabel('Role').fill(e2eTestMilitary.role ?? '');
        
        await page.getByRole("button", { name: "Save" }).click();

        await page.getByRole("link", { name: link }).click();

        page.on('dialog', dialog => dialog.accept());

        await page.getByRole("button", { name: "Delete" }).click();

        await expect(page).toHaveURL(PATHS.PERSONNEL_LIST);
        await expect(page.getByText('SGC Personnel')).toBeVisible();
        await expect(page.getByText(link)).not.toBeVisible();
    });

    // Delete cancelled stays on detail page
    test('cancelling delete stays on detail page', async ({ page }) =>{        
        await page.goto(PATHS.PERSONNEL_LIST);

        await page.getByRole('button', { name: 'Add Personnel' }).click();

        // Select Options
        await page.getByLabel('Prefix').selectOption(e2eTestMilitary.prefix ?? '');
        await page.getByLabel('Rank').selectOption(e2eTestMilitary.rank ?? '');
        await page.getByLabel('Personnel Type').selectOption(e2eTestMilitary.personnel_type ?? '');
        await page.getByLabel('Status').selectOption(e2eTestMilitary.status ?? '');
        await page.getByLabel('Team').selectOption(e2eTestMilitary.team_id ?? '');
        // Fill fields
        await page.getByLabel('First Name').fill(e2eTestMilitary.first_name ?? '');
        await page.getByLabel('Middle Name').fill(e2eTestMilitary.middle_name ?? '');
        await page.getByLabel('Last Name').fill(e2eTestMilitary.last_name ?? '');
        await page.getByLabel('Suffix').fill(e2eTestMilitary.suffix ?? '');
        await page.getByLabel('Role').fill(e2eTestMilitary.role ?? '');
        
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