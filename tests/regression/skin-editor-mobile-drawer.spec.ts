import { test, expect } from '@playwright/test';

test('hamburger menu opens the mobile drawer', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile drawer only applies below the 1024px desktop breakpoint');

  await page.goto('/');

  const drawerPanel = page.locator('#drawerPanel');
  const drawerBackdrop = page.locator('#drawerBackdrop');

  await expect(drawerPanel).not.toHaveClass(/open/);

  await page.locator('#btnHamburger').click();

  await expect(drawerPanel).toHaveClass(/open/);
  await expect(drawerBackdrop).toHaveClass(/open/);

  await expect(page).toHaveScreenshot('mobile-drawer-open.png');
});

test('closing the mobile drawer hides it again', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile drawer only applies below the 1024px desktop breakpoint');

  await page.goto('/');

  const drawerPanel = page.locator('#drawerPanel');

  await page.locator('#btnHamburger').click();
  await expect(drawerPanel).toHaveClass(/open/);

  await page.locator('#btnCloseDrawer').click();

  await expect(drawerPanel).not.toHaveClass(/open/);
});
