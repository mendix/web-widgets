import preserveDirectives from "rollup-preserve-directives";
import url from "@rollup/plugin-url";
import image from "@rollup/plugin-image";
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
            }),
            url({
                include: ["**/*.svg"],
                limit: 0,
                fileName: "[name][extname]"
            }),
            image({
                include: ["**/*.svg"]
            })
        ];
        return config;
    });
};
