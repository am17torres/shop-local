// Prospective-merchant sign-up (M10). See docs/PERSONAS.md and docs/PARTNER_INTAKE.md.
const { test, expect } = require("@playwright/test");

const ENDPOINT = "https://intake.test/exec";

// Point the form at a stub endpoint and disable the time-trap so tests can
// submit immediately (both are window overrides read by site/assets/app.js).
async function setup(page) {
  await page.addInitScript(() => {
    window.BH_PARTNER_ENDPOINT = "https://intake.test/exec";
    window.BH_MIN_FILL_MS = 0;
  });
}

async function fillValid(form) {
  await form.locator("#shop").fill("Hillside Pottery");
  await form.locator("#owner").fill("Dana Hill");
  await form.locator("#email").fill("dana@hillside.test");
  await form.locator("#phone").fill("5185550140");
  await form.locator("#address").fill("12 Lakehill Rd, Burnt Hills");
  await form.locator("#sells").fill("pottery & garden goods");
}

test.describe("Merchant sign-up", () => {
  test("M10: a valid submission posts to the endpoint and shows success", async ({ page }) => {
    await setup(page);
    const posts = [];
    await page.route(ENDPOINT, async (route) => {
      posts.push(JSON.parse(route.request().postData() || "{}"));
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });

    await page.goto("/index.html");
    const form = page.locator('form[data-partner="merchant"]');
    await fillValid(form);
    await form.locator('button[type="submit"]').click();

    await expect(page.locator("[data-partner-ok]")).toBeVisible();
    await expect(form).toBeHidden();
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      kind: "merchant",
      shopName: "Hillside Pottery",
      email: "dana@hillside.test",
      token: "bh-partner-2026",
    });
  });

  test("M10: required fields block submission (no network call)", async ({ page }) => {
    await setup(page);
    let called = false;
    await page.route(ENDPOINT, async (route) => { called = true; await route.fulfill({ status: 200, body: "{}" }); });

    await page.goto("/index.html");
    await page.locator('form[data-partner="merchant"] button[type="submit"]').click();

    await expect(page.locator("[data-partner-ok]")).toBeHidden();
    expect(called).toBe(false);
  });

  test("M10: a filled honeypot is dropped silently — no network, still 'succeeds'", async ({ page }) => {
    await setup(page);
    let called = false;
    await page.route(ENDPOINT, async (route) => { called = true; await route.fulfill({ status: 200, body: "{}" }); });

    await page.goto("/index.html");
    const form = page.locator('form[data-partner="merchant"]');
    await fillValid(form);
    await form.locator("[data-x]").fill("i am a bot", { force: true });
    await form.locator('button[type="submit"]').click();

    await expect(page.locator("[data-partner-ok]")).toBeVisible();
    expect(called).toBe(false);
  });
});
