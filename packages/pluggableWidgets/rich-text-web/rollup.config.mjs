import copyFiles from "@mendix/rollup-web-widgets/copyFiles.mjs";
import typescript from "@rollup/plugin-typescript";

/**
 * quill-resize-module uses `import ... from "*.svg?raw"` syntax (a Vite/webpack
 * feature). Rollup doesn't understand the `?raw` query suffix, so we strip it
 * and let the normal image/url plugin resolve the bare SVG path.
 */
const stripRawSuffix = {
    name: "strip-raw-suffix",
    resolveId(id, importer, options) {
        if (id.endsWith("?raw")) {
            return this.resolve(id.slice(0, -4), importer, { ...options, skipSelf: true });
        }
        return null;
    }
};

export default args => {
    const result = copyFiles(args);
    return result.map((config, _index) => {
        config.plugins = [
            ...config.plugins.filter(plugin => plugin?.name !== "typescript"),
            stripRawSuffix,
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
