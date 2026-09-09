import alias from "@rollup/plugin-alias";
import { getBabelInputPlugin } from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import preserveDirectives from "rollup-preserve-directives";
import copyFiles from "@mendix/rollup-web-widgets/copyFiles.mjs";

// Tiptap 3.30+ ships dist files carrying a `@jsxImportSource @tiptap/core` pragma. The default
// pluggable-widgets-tools babel setup transforms node_modules with the classic JSX runtime, which
// rejects that pragma ("importSource cannot be set when runtime is classic"). Recreate the babel
// input plugin so tiptap files are handled with the automatic runtime instead.
const babelInputPlugin = sourceMaps =>
    getBabelInputPlugin({
        sourceMaps,
        babelrc: false,
        babelHelpers: "bundled",
        overrides: [
            {
                test: /node_modules/,
                exclude: /node_modules[\\/](\.pnpm[\\/])?@tiptap/,
                plugins: ["@babel/plugin-transform-flow-strip-types", "@babel/plugin-transform-react-jsx"]
            },
            {
                test: /node_modules[\\/](\.pnpm[\\/])?@tiptap/,
                plugins: [["@babel/plugin-transform-react-jsx", { runtime: "automatic" }]]
            },
            {
                exclude: /node_modules/,
                plugins: [["@babel/plugin-transform-react-jsx", { runtime: "automatic" }]]
            }
        ]
    });

export default args => {
    const result = copyFiles(args);
    return result.map((config, _index) => {
        config.plugins = [
            ...config.plugins
                .filter(plugin => plugin?.name !== "typescript")
                // `name === "babel"` matches both the input and the output plugin; only the input one
                // has a `transform` hook.
                .map(plugin =>
                    plugin?.name === "babel" && plugin.transform ? babelInputPlugin(config.sourceMaps) : plugin
                ),
            preserveDirectives(),
            json(),
            alias({
                entries: [
                    {
                        find: /(.*)\.svg\?raw$/,
                        replacement: "$1.svg"
                    }
                ]
            }),
            typescript({
                noEmitOnError: !args.watch,
                sourceMap: config.sourceMaps,
                inlineSources: config.sourceMaps,
                target: "es2022", // we transpile the result with babel anyway, see below
                useDefineForClassFields: false,
                exclude: ["**/__tests__/**/*"]
            })
        ];

        return config;
    });
};
