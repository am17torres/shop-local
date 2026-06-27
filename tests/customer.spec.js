// Shopper / Customer user stories (C1–C8). See docs/PERSONAS.md.
const { test, expect } = require("@playwright/test");
const { addToCart } = require("./helpers");

const money = (n) => "$" + n.toFixed(2);

test.describe("Shopper", () => {
  test("C1: browse every shop's products in one storefront", async ({ page }) => {
    await page.goto("/storefront.html");
    await page.waitForSelector(".product-card");
    await expect(page.locator(".product-card")).toHaveCount(30);
    await expect(page.locator("#resultMeta")).toContainText("11 shop");
  });

  test("C2: faceted filtering by category, feature, and shop", async ({ page }) => {
    await page.goto("/storefront.html");
    await page.waitForSelector(".product-card");

    await page.check('[data-feat-enum="roast"][value="dark"]');
    await expect(page.locator(".product-card")).toHaveCount(1);
    await page.click("#clearBtn");

    await page.check('[data-feat-bool="glutenFree"]');
    await expect(page.locator(".product-card")).toHaveCount(1);
    await page.click("#clearBtn");

    await page.check('[data-cat="bakery"]');
    await expect(page.locator(".product-card")).toHaveCount(5);
  });

  test("C3: free-text search matches product attributes, not just names", async ({ page }) => {
    await page.goto("/storefront.html");
    await page.waitForSelector(".product-card");
    await page.fill("#q", "terracotta");
    await expect(page.locator(".product-card")).toHaveCount(1);
    await page.fill("#q", "maple");
    await expect(page.locator(".product-card").first()).toBeVisible();
  });

  test("C4: one cart spanning multiple shops", async ({ page }) => {
    await addToCart(page, ["p-terracotta-8", "p-strawberry-jam"]);
    await page.goto("/cart.html");
    await expect(page.locator(".merchant-group")).toHaveCount(2);
  });

  test("C5: choose delivery vs pick-up-in-store per item", async ({ page }) => {
    await addToCart(page, ["p-terracotta-8", "p-strawberry-jam"]);
    await page.goto("/cart.html");
    await page.waitForSelector(".merchant-group");
    await page.click('[data-ful="p-strawberry-jam|pickup"]');
    await expect(page.locator("#summary")).toContainText("collect them at the shop");
  });

  test("C6: per-store distance fee (sum of each store→address), live by address; none on pickup-only", async ({ page }) => {
    await addToCart(page, ["p-terracotta-8", "p-strawberry-jam"]); // Hillside + Maple & Main
    await page.goto("/cart.html");
    await page.waitForSelector(".merchant-group");

    // each store priced on its own distance, in 1–10 mi
    const perStore = (addr) => page.evaluate((a) => ({
      hill: BHApp.feeForDistance(BHApp.mockDistanceMi("hillside-pottery", a)),
      maple: BHApp.feeForDistance(BHApp.mockDistanceMi("maple-main-grocer", a)),
    }), addr);
    const inRange = await page.evaluate(() => {
      const d = BHApp.mockDistanceMi("hillside-pottery", "12 Lakehill Rd, Burnt Hills");
      return d >= 1 && d <= 10;
    });
    expect(inRange).toBe(true);

    let f = await perStore("12 Lakehill Rd, Burnt Hills");
    await expect(page.locator("#feeVal")).toHaveText(money(f.hill + f.maple)); // total = sum of stores
    await expect(page.locator('[data-shop="hillside-pottery"]')).toBeVisible(); // per-store line shown
    await expect(page.locator('[data-shop="maple-main-grocer"]')).toBeVisible();

    await page.fill("#addr", "500 Saratoga Rd, Glenville");
    f = await perStore("500 Saratoga Rd, Glenville");
    await expect(page.locator("#feeVal")).toHaveText(money(f.hill + f.maple)); // recomputes live

    // jam → pickup: only Hillside's delivery fee remains
    await page.click('[data-ful="p-strawberry-jam|pickup"]');
    f = await perStore("500 Saratoga Rd, Glenville");
    await expect(page.locator("#feeVal")).toHaveText(money(f.hill));

    // everything pickup → no fee, no delivery window
    await page.click('[data-ful="p-terracotta-8|pickup"]');
    await expect(page.locator("#feeVal")).toHaveText(money(0));
    await expect(page.locator("#dw")).toHaveCount(0);
  });

  test("C7: checkout authorizes (not charged) pending shop confirmation", async ({ page }) => {
    await addToCart(page, ["p-terracotta-8"]);
    await page.goto("/cart.html");
    await page.waitForSelector(".merchant-group");
    await page.click("#placeBtn");
    await expect(page.locator("#placed")).toBeVisible();
    await expect(page.locator("#placed")).toContainText("authorized");
  });

  test("C8: track each shop's part of the order (pre-confirmation state)", async ({ page }) => {
    await addToCart(page, ["p-terracotta-8"]);
    await page.goto("/cart.html");
    await page.waitForSelector(".merchant-group");
    await page.click("#placeBtn");
    await page.waitForSelector("#placed", { state: "visible" });

    await page.goto("/order.html");
    await page.waitForSelector(".card");
    await expect(page.locator("#orders")).toContainText("Hillside Pottery");
    await expect(page.locator("#orders .status.authorized").first()).toBeVisible();
  });
});
