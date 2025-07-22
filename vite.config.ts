import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  if (command === "serve") {
    return {};
  } else {
    return {
      base: "",
      build: {
        copyPublicDir: false
      }
    };
  }
});