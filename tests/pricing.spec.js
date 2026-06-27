// Prospective-merchant pricing calculator (M9). See docs/PERSONAS.md.
const { test, expect } = require("@playwright/test");

// Set an <input type=range> value and fire the "input" event the page listens
// for. Playwright's fill() doesn't support range inputs, so drive it directly.
async function setSlider(page, value) {
  await page.locator("#calc-slider").evaluate((el, v) => {
    el.value = String(v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

test.describe("Pricing calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing.html");
    await page.waitForSelector("#calc-slider");
  });

  test("M9: defaults to a $50 order at Tier 1 (1%) with the right net", async ({ page }) => {
    await expect(page.locator("#calc-amount")).toHaveText("$50");
    await expect(page.locator('.calc-tier-btn[data-tier="1"]')).toHaveClass(/on/);
    await expect(page.locator("#calc-fee-pct")).toHaveText("1%");
    // 50 − 0.50 (1%) − 1.75 (2.9% + 30¢) = 47.75
    await expect(page.locator("#calc-platform-fee")).toContainText("$0.50");
    await expect(page.locator("#calc-stripe-fee")).toContainText("$1.75");
    await expect(page.locator("#calc-net")).toHaveText("$47.75");
  });

  test("M9: dragging the slider updates the subtotal and net live", async ({ page }) => {
    await setSlider(page, 200);
    await expect(page.locator("#calc-amount")).toHaveText("$200");
    await expect(page.locator("#calc-subtotal")).toHaveText("$200.00");
    // Still Tier 1: 200 − 2.00 (1%) − 6.10 (2.9% + 30¢) = 191.90
    await expect(page.locator("#calc-platform-fee")).toContainText("$2.00");
    await expect(page.locator("#calc-stripe-fee")).toContainText("$6.10");
    await expect(page.locator("#calc-net")).toHaveText("$191.90");
  });

  test("M9: choosing a tier changes the platform % and recalculates net", async ({ page }) => {
    await setSlider(page, 200);
    await page.locator('.calc-tier-btn[data-tier="3"]').click();
    // selection moves to the chosen tier
    await expect(page.locator('.calc-tier-btn[data-tier="3"]')).toHaveClass(/on/);
    await expect(page.locator('.calc-tier-btn[data-tier="1"]')).not.toHaveClass(/on/);
    await expect(page.locator("#calc-fee-pct")).toHaveText("3%");
    // 200 − 6.00 (3%) − 6.10 (2.9% + 30¢) = 187.90
    await expect(page.locator("#calc-platform-fee")).toContainText("$6.00");
    await expect(page.locator("#calc-net")).toHaveText("$187.90");
  });
});
