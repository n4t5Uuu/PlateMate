import { defineConfig } from "@playwright/test";

const port = 3917;

// Minimal config for the frontend journeys; needs `pnpm build` first (it serves the production build).
export default defineConfig({
  testDir: "./frontend/tests/e2e",
  use: { baseURL: `http://localhost:${port}`, channel: "chrome" },
  webServer: {
    command: `pnpm --filter @platemate/frontend exec next start -p ${port}`,
    url: `http://localhost:${port}/sign-in`,
    reuseExistingServer: false, // a stale server on this port must fail the run, not serve an old build
    timeout: 60_000,
  },
});
