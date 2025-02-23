import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  if (command === "serve") {
    return {
      publicDir: "resources"
    };
  } else {
    return {
      build: {
        
      }
    };
  }
  return {};
});