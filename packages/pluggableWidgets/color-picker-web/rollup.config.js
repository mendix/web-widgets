import commonjs from "@rollup/plugin-commonjs";

export default args => {
    const result = args.configDefaultConfig;
    return result.map((config, _index) => {
        if (config.output.format !== "es") {
            return config;
        }
        return {
            ...config,
            plugins: config.plugins.map(plugin => {
                if (plugin && plugin.name === "commonjs") {
                    // replace common js plugin that transforms
                    // external requires to imports
                    // this is needed in order to work with modern client
                    return commonjs({
                        extensions: [".js", ".jsx", ".tsx", ".ts"],
                        transformMixedEsModules: true,
                        requireReturnsDefault: "auto",
                        esmExternals: true
                    });
                }

                return plugin;
            })
        };
    });
};
