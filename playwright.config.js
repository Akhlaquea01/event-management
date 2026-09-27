import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false, // Run sequentially for predictable in-memory state
  workers: 1,
  use: {
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },
  webServer: {
    command: 'node --env-file=.env src/app.js',
    url: 'http://localhost:3000/health',
    reuseExistingServer: false,
    timeout: 15000,
    env: {
      NODE_ENV: 'test',
    },
  },
});
