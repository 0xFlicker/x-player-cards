import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './browser-tests',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4173', headless: true },
  webServer: [
    { command: 'bun run build && TEST_FRAME_ORIGIN=http://localhost:4174 bun scripts/serve.ts', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
    { command: 'bun scripts/frame-harness.ts', url: 'http://localhost:4174', reuseExistingServer: false },
  ],
});
