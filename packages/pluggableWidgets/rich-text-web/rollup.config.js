import preserveDirectives from "rollup-preserve-directives";
import alias from "@rollup/plugin-alias";

export default args => {
    const result = args.configDefaultConfig;
    return result.map((config, _index) => {
        config.plugins = [
            ...config.plugins,
            preserveDirectives(),
            alias({
                entries: [
                    {
                        find: /(.*)\.svg\?raw$/,
                        replacement: "$1.svg"
                    }
                ]
            })
        ];
        return config;
    });
};
