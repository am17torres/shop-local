// Shared helpers for the persona user-story tests.
const { expect } = require("@playwright/test");

/** Add products to the cart from the storefront by product id. */
async function addToCart(page, ids) {
  await page.goto("/storefront.html");
  await page.waitForSelector(".product-card");
  for (const id of ids) await page.locator(`[data-add="${id}"]`).click();
}

/** Place the order from the cart (authorize). */
async function checkout(page) {
  await page.goto("/cart.html");
  await page.waitForSelector(".merchant-group");
  await page.click("#placeBtn");
  await page.waitForSelector("#placed", { state: "visible" });
}

/** Confirm every pending sub-order in the merchant dashboard. */
async function confirmAll(page) {
  await page.goto("/merchant.html");
  await page.waitForSelector(".dash-order");
  while (await page.locator("[data-confirm]").count()) {
    await page.locator("[data-confirm]").first().click();
    await page.waitForTimeout(120); // dashboard re-renders after each confirm
  }
}

module.exports = { addToCart, checkout, confirmAll };
