import { defineConfig, devices } from '@playwright/test';

// =============================================================================
// Playwright config (family standard, copied from WCP's shape)
// =============================================================================
// Tests run against the REAL production build (dist/client) served statically,
// not `astro dev`: the Cloudflare workerd dev runtime is flakier and can serve
// error pages that a naive check would read as "fine". Fresh build + no-cache
// serve each run avoids stale-CSS false results.
//
// This site is `output: 'static'`, so dist/client IS the whole site: there
// are no SSR routes and nothing in dist/server. The Sanity Studio is the
// separate studio/ package and is not part of this suite.
// =============================================================================

const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  // Chromium runs everything. A real WebKit iPhone profile runs the
  // viewport-agnostic suites (smoke + both axe sweeps): most of this site's
  // visitors arrive on phones, and Safari's engine finds layout and JS issues
  // Chromium never will. reflow.spec.ts drives its own explicit viewport
  // widths (320/768/1024/1440), which fights device emulation, so it is
  // chromium-only.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'webkit-iphone',
      use: { ...devices['iPhone 14'] },
      testMatch: /(smoke|a11y|a11y-dark)\.spec\.ts$/,
    },
  ],
  webServer: {
    command: 'npm run build && npm run serve:dist',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
