import preserveDirectives from "rollup-preserve-directives";

export default args => {
    const result = args.configDefaultConfig;
    return result.map((config, _index) => {
        config.plugins = [...config.plugins, preserveDirectives()];
        return config;
    });
};
