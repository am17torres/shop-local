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

  test("C6: distance-based delivery fee, live by address; none on pickup-only", async ({ page }) => {
    await addToCart(page, ["p-terracotta-8", "p-strawberry-jam"]);
    await page.goto("/cart.html");
    await page.waitForSelector(".merchant-group");

    const addr = "12 Lakehill Rd, Burnt Hills";
    const d = await page.evaluate((a) => BHApp.mockDistanceMi(a), addr);
    await expect(page.locator("#feeVal")).toHaveText(money(d)); // $1/mi

    await page.fill("#addr", "500 Saratoga Rd, Glenville");
    const d2 = await page.evaluate(() => BHApp.mockDistanceMi("500 Saratoga Rd, Glenville"));
    await expect(page.locator("#feeVal")).toHaveText(money(d2)); // recomputes live

    // make everything pickup → no fee, no delivery window
    await page.click('[data-ful="p-terracotta-8|pickup"]');
    await page.click('[data-ful="p-strawberry-jam|pickup"]');
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
