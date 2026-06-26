// Driver user stories (D1–D5). See docs/PERSONAS.md.
const { test, expect } = require("@playwright/test");
const { addToCart, checkout, confirmAll } = require("./helpers");

test.describe("Driver", () => {
  test("D1: batched day-list of per-store pickups from the sample day", async ({ page }) => {
    await page.goto("/driver.html");
    await page.click("#sampleBtn");
    await page.waitForSelector(".dash-order");
    // sample day = 3 orders, 4 store sub-orders (one order spans 2 shops)
    await expect(page.locator("#pickups .dash-order")).toHaveCount(4);
  });

  test("D2 & D3: each store sub-order advances independently", async ({ page }) => {
    await page.goto("/driver.html");
    await page.click("#sampleBtn");
    await page.waitForSelector(".dash-order");

    // advance only the Garden Shed slice of the 2-shop order BH-403
    await page.click('[data-go="BH-403|the-garden-shed|out_for_delivery"]');
    await expect(page.locator("#pickups .dash-order")).toHaveCount(3);
    await expect(page.locator("#dropoffs .dash-order")).toHaveCount(1);
    // its sibling store (hardware) on the SAME order is still awaiting pickup
    await expect(page.locator('[data-go="BH-403|burnt-hills-hardware|out_for_delivery"]')).toHaveCount(1);

    await page.click('[data-go="BH-403|the-garden-shed|delivered"]');
    await expect(page.locator("#completed .dash-order")).toHaveCount(1);
  });

  test("D4: distance and fee per drop-off plus day totals", async ({ page }) => {
    await page.goto("/driver.html");
    await page.click("#sampleBtn");
    await page.waitForSelector(".dash-order");
    await expect(page.locator("#routeSummary")).toContainText(/[\d.]+ mi · \$[\d.]+ in delivery fees/);

    await page.locator("[data-go]").first().click(); // move one stop to drop-off
    await expect(page.locator("#dropoffs")).toContainText(/[\d.]+ mi → \$[\d.]+ fee/);
  });

  test("D5: pick-up-in-store items never appear on the route", async ({ page }) => {
    await addToCart(page, ["p-terracotta-8"]);
    await page.goto("/cart.html");
    await page.waitForSelector(".merchant-group");
    await page.click('[data-ful="p-terracotta-8|pickup"]'); // make it pickup
    await page.click("#placeBtn");
    await page.waitForSelector("#placed", { state: "visible" });
    await confirmAll(page);

    await page.goto("/driver.html");
    await page.waitForTimeout(200);
    await expect(page.locator("#pickups .dash-order")).toHaveCount(0);
    await expect(page.locator("#dropoffs .dash-order")).toHaveCount(0);
  });
});
