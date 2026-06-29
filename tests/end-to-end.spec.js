// Cross-persona lifecycle: shopper → merchant → driver → shopper.
// Exercises C7 → M2 → D3 → C8 together. See docs/PERSONAS.md.
const { test, expect } = require("@playwright/test");
const { addToCart, checkout, confirmAll } = require("./helpers");

test("full lifecycle: order → confirm → pick up → deliver → customer sees delivered", async ({ page }) => {
  // Shopper places a delivery order (C7)
  await addToCart(page, ["p-terracotta-8"]);
  await checkout(page);

  // Merchant confirms → payment captured (M2)
  await confirmAll(page);

  // Driver picks up then delivers (D3)
  await page.goto("/demo/driver.html");
  await page.waitForSelector(".dash-order");
  await page.locator("[data-go]").first().click();              // picked up → out for delivery
  await page.locator('[data-go$="|delivered"]').first().click(); // delivered
  await expect(page.locator("#completed .dash-order")).toHaveCount(1);

  // Customer sees the delivered status with distance + fee (C8)
  await page.goto("/demo/order.html");
  await page.waitForSelector(".card");
  await expect(page.locator("#orders")).toContainText("Delivered");
  await expect(page.locator("#orders")).toContainText(/[\d.]+ mi from .+ · \$[\d.]+ delivery/);
});
