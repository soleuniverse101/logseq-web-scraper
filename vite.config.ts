import { defineConfig, UserConfig } from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

const config = {
  plugins: [wasm(), topLevelAwait()],
} satisfies UserConfig;

export default defineConfig(({ command }) => {
  if (command === "serve") {
    return config;
  } else {
    return {
      ...config,
      base: "",
      build: {
        copyPublicDir: false,
      },
    };
  }
});
