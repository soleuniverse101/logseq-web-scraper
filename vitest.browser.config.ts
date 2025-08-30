import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: "playwright",
      // https://vitest.dev/guide/browser/playwright
      instances: [{ browser: "chromium" }],
      // Browser env is only needed for DOM-related functions
      headless: true,
      screenshotFailures: false,
    },
  },
});
