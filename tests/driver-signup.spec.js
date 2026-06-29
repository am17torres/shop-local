// Prospective-driver sign-up (D7). See docs/PERSONAS.md and docs/PARTNER_INTAKE.md.
const { test, expect } = require("@playwright/test");

const ENDPOINT = "https://intake.test/exec";

async function setup(page) {
  await page.addInitScript(() => {
    window.BH_PARTNER_ENDPOINT = "https://intake.test/exec";
    window.BH_MIN_FILL_MS = 0;
  });
}

test.describe("Driver sign-up", () => {
  test("D7: a valid application posts to the endpoint and shows success", async ({ page }) => {
    await setup(page);
    const posts = [];
    await page.route(ENDPOINT, async (route) => {
      posts.push(JSON.parse(route.request().postData() || "{}"));
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });

    await page.goto("/partner.html");
    const form = page.locator('form[data-partner="driver"]');
    await form.locator("#d-name").fill("Sam Rivera");
    await form.locator("#d-town").fill("Ballston Lake");
    await form.locator("#d-email").fill("sam@drive.test");
    await form.locator("#d-phone").fill("5185550199");
    await form.locator('input[value="Weekday afternoons"]').check();
    await form.locator('input[value="Weekends"]').check();
    await form.locator('input[name="licenseInsurance"]').check();
    await form.locator('button[type="submit"]').click();

    await expect(page.locator("#driver [data-partner-ok]")).toBeVisible();
    await expect(form).toBeHidden();
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      kind: "driver",
      name: "Sam Rivera",
      licenseInsurance: "yes",
      availability: "Weekday afternoons, Weekends", // repeated checkboxes are joined
      token: "bh-partner-2026",
    });
  });

  test("D7: missing the license/insurance attestation blocks submission", async ({ page }) => {
    await setup(page);
    let called = false;
    await page.route(ENDPOINT, async (route) => { called = true; await route.fulfill({ status: 200, body: "{}" }); });

    await page.goto("/partner.html");
    const form = page.locator('form[data-partner="driver"]');
    await form.locator("#d-name").fill("Sam Rivera");
    await form.locator("#d-town").fill("Ballston Lake");
    await form.locator("#d-email").fill("sam@drive.test");
    await form.locator("#d-phone").fill("5185550199");
    // intentionally leave the license/insurance checkbox unchecked
    await form.locator('button[type="submit"]').click();

    await expect(page.locator("#driver [data-partner-ok]")).toBeHidden();
    expect(called).toBe(false);
  });
});
