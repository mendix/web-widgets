import config from "@mendix/eslint-config-web-widgets/widget-ts.mjs";

/**
 * This package is a Node server, not a browser widget, so the shared widget config needs two
 * corrections:
 *
 * 1. It sets `tsconfigRootDir` to its own directory, which makes the TypeScript project service
 *    resolve our files against the wrong tsconfig — build output under `dist/` then fails with
 *    "not found by the project service".
 * 2. Build output and scaffolded widgets should not be linted at all.
 *
 * The React/JSX and Jest blocks in the shared config are scoped to `*.tsx` and `*.spec.ts`, neither
 * of which exists here (tests are `*.test.ts` under vitest), so they are inert and there is no
 * reason to fork the rule set.
 */
export default [
    {
        ignores: ["dist/**", "generations/**", ".e2e-cache/**"]
    },
    ...config,
    {
        name: "pluggable-widgets-mcp: type-aware linting rooted in this package",
        files: ["**/*.ts"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        }
    },
    {
        // The e2e suite has one plain ESM helper that has to run as its own process, so it is not
        // TypeScript and the shared config has no Node globals for it.
        name: "pluggable-widgets-mcp: node scripts",
        files: ["**/*.mjs"],
        languageOptions: {
            globals: { process: "readonly", console: "readonly" }
        }
    }
];
