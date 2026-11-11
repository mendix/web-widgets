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
            },
            {
                // Matches files starting with 'Siemens', containing 'READMEOSS' somewhere, and ending with .html
                src: "Siemens*READMEOSS*.html",
                dest: "dist/tmp/widgets",
                flatten: true
            },
            {
                // Maia skill files; shipped only for widgets that have a .maia folder
                src: ".maia",
                dest: "dist/tmp/widgets"
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
