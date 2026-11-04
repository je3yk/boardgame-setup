import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'flows.ts',
  use: { baseURL: 'http://127.0.0.1:4321/boardgame-setup/' },
  webServer: {
    command: 'bun run preview --port 4321',
    url: 'http://127.0.0.1:4321/boardgame-setup/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'narrow-mobile', use: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true } },
  ],
});
