import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Get the mendix version dynamically
const packageJson = require("./package.json");
const mendixVersion = packageJson.dependencies.mendix;
const mendixPath = path.resolve(__dirname, `../../../node_modules/.pnpm/mendix@${mendixVersion}/node_modules/mendix`);

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // Mendix core mocks (only these need to be mocked since they're runtime-only)
            "mendix/filters/builders": path.resolve(__dirname, "src/mocks/mendix-filters.ts"),
            "mendix/filters": path.resolve(__dirname, "src/mocks/mendix-filters.ts"),
            mendix: path.resolve(__dirname, "src/mocks/mendix.ts")
        }
    },
    server: {
        port: 3001,
        open: true,
        host: true
    },
    optimizeDeps: {
        include: ["react", "react-dom", "big.js", "classnames", "downshift", "match-sorter"]
    }
});
