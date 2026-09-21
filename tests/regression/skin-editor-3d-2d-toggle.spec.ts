import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('switching to 2D unwrapped sheet view activates #btnMode2D and shows #wrapper2D', async ({ page }) => {
  const btnMode2D = page.locator('#btnMode2D');
  const btnMode3D = page.locator('#btnMode3D');
  const characterWorld = page.locator('#characterWorld');
  const wrapper2D = page.locator('#wrapper2D');
  const editor2DCanvas = page.locator('#editor2DCanvas');

  await btnMode2D.click();

  await expect(btnMode2D).toHaveClass(/active/);
  await expect(btnMode3D).not.toHaveClass(/active/);
  await expect(characterWorld).toBeHidden();
  await expect(wrapper2D).toBeVisible();
  await expect(editor2DCanvas).toBeVisible();

  await expect(page).toHaveScreenshot('editor-2d-mode.png');
});

test('toggling from 2D back to 3D restores #characterWorld and activates #btnMode3D', async ({ page }) => {
  const btnMode2D = page.locator('#btnMode2D');
  const btnMode3D = page.locator('#btnMode3D');
  const characterWorld = page.locator('#characterWorld');
  const wrapper2D = page.locator('#wrapper2D');

  await btnMode2D.click();
  await expect(wrapper2D).toBeVisible();

  await btnMode3D.click();

  await expect(btnMode3D).toHaveClass(/active/);
  await expect(btnMode2D).not.toHaveClass(/active/);
  await expect(wrapper2D).toBeHidden();
  await expect(characterWorld).toBeVisible();

  await expect(page).toHaveScreenshot('editor-3d-mode-after-toggle.png');
});
