import copyFiles from "@mendix/rollup-web-widgets/copyFiles.mjs";
import typescript from "@rollup/plugin-typescript";
import preserveDirectives from "rollup-preserve-directives";
import alias from "@rollup/plugin-alias";
import { string } from "rollup-plugin-string";

export default args => {
    const result = copyFiles(args);
    return result.map((config, _index) => {
        // Find the position of the url plugin (which handles assets)
        const urlPluginIndex = config.plugins.findIndex(p => p?.name === "url");

        config.plugins = [
            ...config.plugins.slice(0, urlPluginIndex).filter(plugin => plugin?.name !== "typescript"),
            // Insert string plugin BEFORE url plugin to intercept SVG imports
            string({
                include: "**/quill-table-better/assets/icon/*.svg"
            }),
            ...config.plugins.slice(urlPluginIndex).filter(plugin => plugin?.name !== "typescript"),
            preserveDirectives(),
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
