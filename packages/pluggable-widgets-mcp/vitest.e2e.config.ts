import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

/**
 * End-to-end suite. Separate from vitest.config.ts on purpose.
 *
 * These specs spawn the built server as a real child process, run a real Yeoman scaffold, and shell
 * out to the Mendix build toolchain. They are minutes where the unit suite is seconds, so they must
 * never be swept into `npm run test` — a slow gate is a gate people stop running.
 *
 * Files run one at a time: they share the warm-cache directory and each spawns processes, so
 * parallel execution would have them fighting over the same fixture.
 */
export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: false,
        include: ["src/__e2e__/**/*.e2e.test.ts"],
        testTimeout: 300_000,
        hookTimeout: 300_000,
        // vitest 0.34: `threads: false` is how you get one file at a time.
        threads: false,
        restoreMocks: true
    }
});
