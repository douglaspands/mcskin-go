import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('switching to the converter tab shows #viewConverter and hides #viewEditor', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', '#headerTabsDesktop is desktop/tablet-only; mobile switches tabs via the drawer');

  const tabConverter = page.locator('#tabBtnConverter');
  const tabEditor = page.locator('#tabBtnEditor');
  const viewConverter = page.locator('#viewConverter');
  const viewEditor = page.locator('#viewEditor');

  await tabConverter.click();

  await expect(tabConverter).toHaveClass(/active/);
  await expect(tabEditor).not.toHaveClass(/active/);
  await expect(viewConverter).toBeVisible();
  await expect(viewEditor).toBeHidden();

  await expect(page).toHaveScreenshot('converter-tab-active.png');
});

test('switching back to the editor tab restores #viewEditor and hides #viewConverter', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', '#headerTabsDesktop is desktop/tablet-only; mobile switches tabs via the drawer');

  const tabConverter = page.locator('#tabBtnConverter');
  const tabEditor = page.locator('#tabBtnEditor');
  const viewConverter = page.locator('#viewConverter');
  const viewEditor = page.locator('#viewEditor');

  await tabConverter.click();
  await expect(viewConverter).toBeVisible();

  await tabEditor.click();

  await expect(tabEditor).toHaveClass(/active/);
  await expect(tabConverter).not.toHaveClass(/active/);
  await expect(viewEditor).toBeVisible();
  await expect(viewConverter).toBeHidden();
});
