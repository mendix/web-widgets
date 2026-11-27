import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const here = (path: string): string => fileURLToPath(new URL(path, import.meta.url));
const repoRoot = here("../../../../");

export default defineConfig({
    root: here("."),
    resolve: {
        alias: [
            { find: /^mendix$/, replacement: here("./shims/mendix.ts") },
            { find: /^mendix\/filters\/builders$/, replacement: here("../src/filters/builders.ts") },
            { find: /^mendix\/filters$/, replacement: here("./shims/mendix-filters.ts") },
            // Workspace libraries are consumed from source so the harness needs no prior build.
            {
                find: /^@mendix\/(widget-plugin-[a-z-]+|filter-commons)\/(.*)$/,
                replacement: `${repoRoot}packages/shared/$1/src/$2`
            },
            { find: /^big\.js$/, replacement: here("../node_modules/big.js/big.mjs") }
        ],
        dedupe: ["react", "react-dom", "mobx", "mobx-react-lite"]
    },
    // Scan every scenario up front so the dependency optimizer doesn't reload the page mid-test.
    optimizeDeps: { entries: ["main.tsx", "scenarios/*.tsx"] },
    build: { outDir: "../dist", emptyOutDir: true, sourcemap: true },
    preview: { port: 5199, strictPort: true },
    server: {
        port: 5199,
        strictPort: true,
        fs: { allow: [repoRoot] }
    },
    css: { preprocessorOptions: { scss: { quietDeps: true, silenceDeprecations: ["import", "global-builtin"] } } }
});
