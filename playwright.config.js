// @ts-check
const { defineConfig, devices } = require("@playwright/test");
const fs = require("fs");

/* Locally (e.g. the dev sandbox) use the pre-installed Chromium under
   PLAYWRIGHT_BROWSERS_PATH so we don't download a browser. In CI, leave
   executablePath undefined and let `npx playwright install` provide the
   matching build. */
function localChromium() {
  if (process.env.CI) return undefined;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  try {
    for (const d of fs.readdirSync(base)) {
      if (d.startsWith("chromium-")) {
        const p = `${base}/${d}/chrome-linux/chrome`;
        if (fs.existsSync(p)) return p;
      }
    }
  } catch (e) { /* no local browsers — fall through */ }
  return undefined;
}

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { executablePath: localChromium() },
      },
    },
  ],
  webServer: {
    command: "python3 -m http.server 4173 --directory site",
    url: "http://127.0.0.1:4173/index.html",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
