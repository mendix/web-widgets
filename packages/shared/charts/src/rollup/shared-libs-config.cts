import { type RollupOptions } from "rollup";
import path from "node:path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
const { join } = path;

type Args = { configDefaultConfig: [AMDConfig: RollupOptions, ESMConfig: RollupOptions]; configProduction: unknown };

// use CommonJS exports
exports.sharedLibsConfig = function sharedLibsConfig(args: Args): RollupOptions[] {
    // As v5 will be used in modern client it doesn't make any sens
    // to compile AMD entry, so, we just ignore it.
    const [_skip_amd_, widgetConfig, ...editorEntries] = args.configDefaultConfig;
    const external = [...(widgetConfig.external as Array<string | RegExp>)];

    const reactPlotly: RollupOptions = {
        external,
        input: "react-plotly.js",
        output: {
            format: "es",
            file: join("dist", "tmp", "widgets", "com", "mendix", "shared", "charts", "react-plotly.js")
        },
        plugins: [nodeResolve(), commonjs()]
    };

    const chartComponent: RollupOptions = {
        external: [...external, "react-plotly.js"],
        input: "@mendix/shared-charts/components/Chart",
        output: {
            format: "es",
            file: join("dist", "tmp", "widgets", "com", "mendix", "shared", "charts", "Chart.js"),
            paths: {
                // Chart.js and react-plotly both in <shared> folder.
                "react-plotly.js": "./react-plotly.js"
            }
        },
        plugins: [nodeResolve(), commonjs()]
    };

    widgetConfig.external = [...external, "@mendix/shared-charts/components/Chart"];
    widgetConfig.output = {
        ...widgetConfig.output,
        paths: {
            "@mendix/shared-charts/components/Chart": "../../../shared/charts/Chart.js"
        }
    };
    // Sed, but PWT has a flaw in which only AMD entry do scss extraction.
    // As a quick fix, we just replace postcss plugins.
    widgetConfig.plugins![5] = _skip_amd_.plugins![5];

    return [reactPlotly, chartComponent, widgetConfig, ...editorEntries];
};
