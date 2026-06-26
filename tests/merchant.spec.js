// Merchant / Shop Owner user stories (M1–M4). See docs/PERSONAS.md.
const { test, expect } = require("@playwright/test");
const { addToCart, checkout } = require("./helpers");

test.describe("Merchant", () => {
  test("M1 & M4: incoming authorized orders, split per shop", async ({ page }) => {
    await addToCart(page, ["p-terracotta-8", "p-strawberry-jam"]); // 2 shops
    await checkout(page);
    await page.goto("/merchant.html");
    await page.waitForSelector(".dash-order");
    // one pending sub-order per shop (M4: each shop sees only its slice)
    await expect(page.locator("#pending .dash-order")).toHaveCount(2);
  });

  test("M2: confirm captures payment and moves the order to handled", async ({ page }) => {
    await addToCart(page, ["p-terracotta-8"]);
    await checkout(page);
    await page.goto("/merchant.html");
    await page.waitForSelector(".dash-order");
    await page.locator("[data-confirm]").first().click();
    await expect(page.locator("#handled .dash-order")).toHaveCount(1);
    await expect(page.locator("#handled .status.confirmed")).toBeVisible();
  });

  test("M3: reject releases the hold", async ({ page }) => {
    await addToCart(page, ["p-terracotta-8"]);
    await checkout(page);
    await page.goto("/merchant.html");
    await page.waitForSelector(".dash-order");
    await page.locator("[data-reject]").first().click();
    await expect(page.locator("#handled .status.rejected")).toBeVisible();
  });
});
