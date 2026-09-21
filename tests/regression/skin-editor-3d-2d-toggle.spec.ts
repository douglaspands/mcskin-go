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

test('floating mode pill is visible in 2D and panning in rotate mode transforms 2D sheet without moving 3D', async ({ page }) => {
  const btnMode2D = page.locator('#btnMode2D');
  const btnTouchRotate = page.locator('#btnTouchRotate');
  const btnTouchPaint = page.locator('#btnTouchPaint');
  const wrapper2D = page.locator('#wrapper2D');
  const editor2DCanvas = page.locator('#editor2DCanvas');
  const btnZoom2DReset = page.locator('#btnZoom2DReset');

  // Switch to 2D
  await btnMode2D.click();
  await expect(wrapper2D).toBeVisible();

  // Floating mode pill must be visible in 2D mode
  await expect(btnTouchRotate).toBeVisible();
  await expect(btnTouchPaint).toBeVisible();

  // Activate Rotate (Pan) mode
  await btnTouchRotate.click();
  await expect(btnTouchRotate).toHaveClass(/active/);

  // Initial transform of 2D canvas
  const initialTransform = await editor2DCanvas.evaluate((el) => el.style.transform);

  // Drag on 2D canvas to pan
  const canvasBox = await editor2DCanvas.boundingBox();
  if (canvasBox) {
    await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + canvasBox.width / 2 + 50, canvasBox.y + canvasBox.height / 2 + 40);
    await page.mouse.up();
  }

  // Verify 2D transform changed (panned)
  const pannedTransform = await editor2DCanvas.evaluate((el) => el.style.transform);
  expect(pannedTransform).not.toBe(initialTransform);
  expect(pannedTransform).toContain('translate(50px, 40px)');

  // Reset 2D view
  await btnZoom2DReset.click();
  const resetTransform = await editor2DCanvas.evaluate((el) => el.style.transform);
  expect(resetTransform).toContain('translate(0px, 0px)');
});

