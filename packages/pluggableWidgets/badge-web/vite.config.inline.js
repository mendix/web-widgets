import { defineConfig } from "vite";

export default defineConfig({
    build: {
        target: "es2019",
        lib: {
            entry: "src/index.ts",
            formats: ["es", "cjs"],
            fileName: "index"
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true
            },
            external: ["react", "react-dom", "@mendix/widget-plugin-component-kit"]
        }
    }
});
