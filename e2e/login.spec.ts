import { test, expect } from "playwright/test";
import { loginAs, SGC_ADMIN, SGC_OFFICER, SGC_USER } from "./testUtils";
import { PATHS } from "../src/lib/paths";

test.describe('login as authenticated user', async () => {
    test('displays a login form for users', async ({ page }) =>{
        await page.goto('/');
        await expect(page.getByText('SGC Personnel Access Portal')).toBeVisible();
        await expect(page.getByLabel('Email Address')).toBeVisible();
        await expect(page.getByLabel('Password')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
    });

    test('successfully logs in with correct credentials', async ({ page }) =>{
        await page.goto('/');
        await page.getByLabel('Email Address').fill(SGC_USER.email);
        await page.getByLabel('Password').fill(SGC_USER.password);

        await page.getByRole('button', { name: 'Log In' }).click();

        await expect(page.getByText('Stargate Command Records')).toBeVisible();
        await expect(page.getByText(SGC_USER.email)).toBeVisible();
        await expect(page.getByRole('button', { name: 'Log Out' })).toBeVisible();
    });

    test('displays an error message when login fails', async ({ page }) =>{
        await page.goto('/');
        await page.getByLabel('Email Address').fill('wrong@email.com');
        await page.getByLabel('Password').fill('wrongPassword');

        await page.getByRole('button', { name: 'Log In' }).click();

        await expect(page.getByText('Invalid login credentials')).toBeVisible();
    });

    // Add data
    // users
    test('standard users cannot add personnel', async ({ page }) =>{
        await loginAs(page, SGC_USER.email, SGC_USER.password);

        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();

        await expect(page.getByRole('button', { name: 'Add Personnel' })).not.toBeVisible();
    });

    test('standard users cannot add teams', async ({ page }) =>{
        await loginAs(page, SGC_USER.email, SGC_USER.password);

        await page.getByRole('link', { name: 'TEAM LIST' }).click();

        await expect(page.getByRole('button', { name: 'Add Team' })).not.toBeVisible();
    });

    test('standard users cannot add missions', async ({ page }) =>{
        await loginAs(page, SGC_USER.email, SGC_USER.password);

        await page.getByRole('link', { name: 'MISSION LIST' }).click();

        await expect(page.getByRole('button', { name: 'Add Mission Record' })).not.toBeVisible();
    });

    // officers
    test('officers cannot add personnel', async ({ page }) =>{
        await loginAs(page, SGC_OFFICER.email, SGC_OFFICER.password);

        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();

        await expect(page.getByRole('button', { name: 'Add Personnel' })).not.toBeVisible();
    });

    test('officers cannot add teams', async ({ page }) =>{
        await loginAs(page, SGC_OFFICER.email, SGC_OFFICER.password);

        await page.getByRole('link', { name: 'TEAM LIST' }).click();

        await expect(page.getByRole('button', { name: 'Add Team' })).not.toBeVisible();
    });

    test('officers cannot add missions', async ({ page }) =>{
        await loginAs(page, SGC_OFFICER.email, SGC_OFFICER.password);

        await page.getByRole('link', { name: 'MISSION LIST' }).click();

        await expect(page.getByRole('button', { name: 'Add Mission Record' })).not.toBeVisible();
    });

    // admins
    test('admins can add personnel', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);

        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();

        await page.getByRole('button', { name: 'Add Personnel' }).click();

        await expect(page).toHaveURL(PATHS.PERSONNEL_NEW);
    });

    test('admins can add teams', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);

        await page.getByRole('link', { name: 'TEAM LIST' }).click();

        await page.getByRole('button', { name: 'Add Team' }).click();

        await expect(page).toHaveURL(PATHS.TEAM_NEW);
    });

    test('admins can add missions', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);

        await page.getByRole('link', { name: 'MISSION LIST' }).click();

        await page.getByRole('button', { name: 'Add Mission Record' }).click();

        await expect(page).toHaveURL(PATHS.MISSION_NEW);
    });

    // Edit/Delete data
    // users
    test('standard users cannot edit or delete personnel records', async ({ page }) =>{
        await loginAs(page, SGC_USER.email, SGC_USER.password);

        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();

        const firstPersonelLink = page.locator('a[href*="/personnel/"]').first();
        await firstPersonelLink.click();

        await expect(page.getByRole('button', { name: 'Edit' })).not.toBeVisible();
        await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
    });

    test('standard users cannot edit or delete team records', async ({ page }) =>{
        await loginAs(page, SGC_USER.email, SGC_USER.password);

        await page.getByRole('link', { name: 'TEAM LIST' }).click();

        const firstTeamLink = page.locator('a[href*="/teams/"]').first();
        await firstTeamLink.click();

        await expect(page.getByRole('button', { name: 'Edit' })).not.toBeVisible();
        await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
    });

    test('standard users cannot edit or delete mission records', async ({ page }) =>{
        await loginAs(page, SGC_USER.email, SGC_USER.password);

        await page.getByRole('link', { name: 'MISSION LIST' }).click();

        const firstMissionLink = page.locator('a[href*="/missions/"]').first();
        await firstMissionLink.click();

        await expect(page.getByRole('button', { name: 'Edit' })).not.toBeVisible();
        await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
    });

    // officers
    test('officers can edit but not delete personnel records', async ({ page }) =>{
        await loginAs(page, SGC_OFFICER.email, SGC_OFFICER.password);

        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();

        const firstPersonelLink = page.locator('a[href*="/personnel/"]').first();
        await firstPersonelLink.click();

        await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
    });

    test('officers can edit but not delete team records', async ({ page }) =>{
        await loginAs(page, SGC_OFFICER.email, SGC_OFFICER.password);

        await page.getByRole('link', { name: 'TEAM LIST' }).click();

        const firstTeamLink = page.locator('a[href*="/teams/"]').first();
        await firstTeamLink.click();

        await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
    });

    test('officers can edit but not delete mission records', async ({ page }) =>{
        await loginAs(page, SGC_OFFICER.email, SGC_OFFICER.password);

        await page.getByRole('link', { name: 'MISSION LIST' }).click();

        const firstMissionLink = page.locator('a[href*="/missions/"]').first();
        await firstMissionLink.click();

        await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
    });
    // admins
    test('admins can edit or delete personnel records', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);

        await page.getByRole('link', { name: 'PERSONNEL LIST' }).click();

        const firstPersonelLink = page.locator('a[href*="/personnel/"]').first();
        await firstPersonelLink.click();

        await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    });

    test('admins can edit or delete team records', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);

        await page.getByRole('link', { name: 'TEAM LIST' }).click();

        const firstTeamLink = page.locator('a[href*="/teams/"]').first();
        await firstTeamLink.click();

        await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    });

    test('admins can edit or delete mission records', async ({ page }) =>{
        await loginAs(page, SGC_ADMIN.email, SGC_ADMIN.password);

        await page.getByRole('link', { name: 'MISSION LIST' }).click();

        const firstMissionLink = page.locator('a[href*="/missions/"]').first();
        await firstMissionLink.click();

        await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    });
});