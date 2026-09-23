const { test, expect } = require('@playwright/test');

const ARTIFACT = 'test-results/judge-flow.png';

test('judge can complete recommendation and truthful Amazon handoff flow', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Shopping Compass' })).toBeVisible();
  await expect(page.getByText('Alexa+ · MCP Streamable HTTP · 2025-11-25+')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('MCP endpoint ready');

  await page.getByLabel('Category').selectOption('wireless earbuds');
  await page.getByLabel('Budget').selectOption('budget');
  await page.getByLabel('What matters most?').fill('battery');
  await page.getByLabel('Who or what is it for?').fill('family');
  await page.getByRole('button', { name: 'Find my best match' }).click();

  await expect(page.getByText('Verified by MCP tool call')).toBeVisible();
  await expect(page.locator('#product')).not.toHaveText('');
  await expect(page.locator('#reason')).toContainText('Why:');
  await expect(page.locator('#truth')).toContainText('Purchase claimed: false');
  await expect(page.getByRole('status')).toContainText('Recommendation returned through MCP');

  await page.getByRole('button', { name: 'Confirm & prepare Amazon handoff' }).click();
  await expect(page.locator('#proof')).toBeVisible();
  await expect(page.locator('#proof')).toContainText('handoff_prepared');
  await expect(page.locator('#proof')).toContainText('AMAZON.AddToShoppingCart');
  await expect(page.locator('#proof')).toContainText('"executedByThisMcpServer": false');
  await expect(page.getByRole('status')).toContainText('Amazon still controls the final cart and purchase');

  await page.screenshot({ path: ARTIFACT, fullPage: true });
});
