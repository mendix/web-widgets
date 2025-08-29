import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

export default {
    input: "src/index.ts",
    output: {
        file: "build/index.js",
        format: "es",
        sourcemap: true,
        banner: "#!/usr/bin/env node"
    },
    external: [
        // Keep Node.js built-in modules external
        "fs",
        "fs/promises",
        "path",
        "url",
        "child_process",
        "util",
        // Keep workspace dependencies external (they won't be bundled)
        "@mendix/automation-utils"
    ],
    plugins: [
        // Handle JSON imports
        json(),

        // Resolve node modules
        nodeResolve({
            preferBuiltins: true,
            exportConditions: ["node"]
        }),

        // Convert CommonJS modules to ES6
        commonjs(),

        // Compile TypeScript
        typescript({
            tsconfig: "./tsconfig.json",
            declaration: false,
            declarationMap: false,
            sourceMap: true
        })
    ]
};
