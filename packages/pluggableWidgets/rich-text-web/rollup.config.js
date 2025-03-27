import typescript from "@rollup/plugin-typescript";
import preserveDirectives from "rollup-preserve-directives";

export default args => {
    const result = args.configDefaultConfig;
    return result.map((config, _index) => {
        const newPlugins = config.plugins.map(plugin => {
            if (plugin && plugin.name === "typescript") {
                return typescript({
                    noEmitOnError: !args.watch,
                    sourceMap: config.sourceMaps,
                    inlineSources: config.sourceMaps,
                    target: "es2022", // we transpile the result with babel anyway, see below
                    useDefineForClassFields: false,
                    exclude: ["**/__tests__/**/*"]
                });
            }
            return plugin;
        });
        config.plugins = [...newPlugins, preserveDirectives()];

        return config;
    });
};
