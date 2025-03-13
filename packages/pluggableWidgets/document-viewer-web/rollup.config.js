export default args => {
    return args.configDefaultConfig.map((config, _index) => {
        config.output.inlineDynamicImports = true;
        return config;
    });
};
