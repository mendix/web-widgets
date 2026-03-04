import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: false,
        include: ["src/**/__tests__/**/*.test.ts"],
        testTimeout: 10_000,
        restoreMocks: true
    }
});
