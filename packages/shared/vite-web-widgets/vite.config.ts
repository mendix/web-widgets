import { defineConfig, type ConfigEnv } from "vite";
import { createConfig } from "./config/create";
import type { WidgetViteConfigOptions } from "./types";

export function createWidgetViteConfig(options: WidgetViteConfigOptions = {}) {
    return defineConfig((env: ConfigEnv) => createConfig(options, env));
}

// Default export supports direct CLI usage:
// `vite build --config ../../shared/vite-web-widgets/vite.config.ts`
export default defineConfig((env: ConfigEnv) => createConfig({}, env));
