import json from "@rollup/plugin-json";

export default args => {
    const result = args.configDefaultConfig;
    return result.map((config, _index) => {
        config.plugins = [...config.plugins, json()];
        return config;
    });
};
