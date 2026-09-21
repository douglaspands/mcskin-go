import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inventoryPath = path.join(__dirname, 'component-inventory.json');

interface InventoryEntry {
  id: string;
  selector: string;
  expectedRegion: Record<string, { x: number; y: number; width: number; height: number }>;
  addedBy: string;
}

const inventory: InventoryEntry[] = JSON.parse(readFileSync(inventoryPath, 'utf-8'));

async function assertComponentPlacement(
  page: import('@playwright/test').Page,
  component: InventoryEntry,
  viewportName: string
): Promise<void> {
  const region = component.expectedRegion[viewportName];
  if (!region) {
    // Component is not registered for this viewport (e.g. a desktop-only panel
    // that the app deliberately hides on tablet/mobile) - nothing to check here.
    return;
  }

  const locator = page.locator(component.selector);
  await expect(locator, `${component.id} must exist in the DOM on ${viewportName}`).toHaveCount(1);
  await expect(locator, `${component.id} must be visible on ${viewportName}`).toBeVisible();
  await expect(locator, `${component.id} must be interactable (enabled) on ${viewportName}`).toBeEnabled();

  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(`${component.id} has no bounding box on ${viewportName}`);
  }

  const withinRegion =
    box.x >= region.x &&
    box.y >= region.y &&
    box.x + box.width <= region.x + region.width &&
    box.y + box.height <= region.y + region.height;

  if (!withinRegion) {
    throw new Error(
      `${component.id} is displaced on ${viewportName}: expected within ${JSON.stringify(region)}, got ${JSON.stringify(box)}`
    );
  }
}

test('component inventory: every registered component is present, interactable, and correctly positioned', async ({
  page,
}, testInfo) => {
  if (inventory.length === 0) return;
  await page.goto('/');
  for (const component of inventory) {
    await assertComponentPlacement(page, component, testInfo.project.name);
  }
});
