import copy from "rollup-plugin-copy";

export function copyDefaultFilesPlugin() {
    return copy({
        targets: [
            {
                src: "dist/locales",
                dest: "dist/tmp/widgets",
                flatten: false
            },
            {
                src: "../../../LICENSE",
                dest: "dist/tmp/widgets",
                rename: "License.txt"
            }
        ]
    });
}

export default args => {
    const result = args.configDefaultConfig;
    return result.map((config, _index) => {
        return {
            ...config,
            plugins: [...config.plugins, copyDefaultFilesPlugin()]
        };
    });
};
