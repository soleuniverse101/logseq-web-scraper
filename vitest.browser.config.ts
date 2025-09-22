import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: "playwright",
      // https://vitest.dev/guide/browser/playwright
      instances: [
        {
          browser: "chromium",
          // Cors interfered with fetching pages
          context: { bypassCSP: true },
          launch: {
            args: ["--disable-web-security", "--remote-debugging-port=9222"],
          },
        },
      ],
      // Browser env is only needed for DOM-related functions
      headless: true,
      screenshotFailures: false,
    },
  },
});
