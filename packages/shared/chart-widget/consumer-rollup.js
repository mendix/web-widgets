const copy = require("rollup-plugin-copy");

function sharedConfig(args) {
    const entries = args.configDefaultConfig;

    // We mark @web-widgets/chart-widget as external
    const external = [/^@web-widgets\/chart-widget($|\/)/];

    return entries.map((config, index) => {
        // Only for first two entries
        if (index < 2) {
            config.external = [...config.external, ...external];

            config.output.paths = {
                ...config.output.paths,
                "@web-widgets/chart-widget": "../../../shared/chart-widget/chart-widget.js"
            };
        }

        // Only for first entry
        if (index === 0) {
            config.plugins = [
                ...config.plugins,
                copy({
                    verbose: true,
                    copyOnce: true,
                    targets: [
                        {
                            src: "node_modules/@web-widgets/chart-widget/dist/*",
                            dest: "dist/tmp/widgets/com/mendix/shared/chart-widget"
                        }
                    ]
                })
            ];
        }

        return config;
    });
}

exports.sharedConfig = sharedConfig;
