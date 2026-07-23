import copyFiles from "@mendix/rollup-web-widgets/copyFiles.mjs";
import typescript from "@rollup/plugin-typescript";
import preserveDirectives from "rollup-preserve-directives";
import alias from "@rollup/plugin-alias";
import json from "@rollup/plugin-json";

export default args => {
    const result = copyFiles(args);
    return result.map((config, _index) => {
        config.plugins = [
            ...config.plugins.filter(plugin => plugin?.name !== "typescript"),
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
