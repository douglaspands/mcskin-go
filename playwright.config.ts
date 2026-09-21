import { defineConfig, devices } from '@playwright/test';

const PORT = 8990;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/regression',
  fullyParallel: false,
  retries: 0,
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  use: {
    baseURL: BASE_URL,
  },
  webServer: {
    command: `go run ./cmd/mcskin --web --port ${PORT} --no-browser`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 800, height: 1024 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 420, height: 840 },
      },
    },
  ],
});
