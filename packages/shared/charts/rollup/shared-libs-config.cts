import { OutputOptions, type RollupOptions } from "rollup";
import path from "node:path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import tarser from "@rollup/plugin-terser";
const { join, format } = path;

type Args = { configDefaultConfig: [AMDConfig: RollupOptions, ESMConfig: RollupOptions]; configProduction: unknown };

// use CommonJS exports
exports.sharedLibsConfig = function sharedLibsConfig(args: Args): RollupOptions[] {
    const isProd = !!args.configProduction;
    // eslint-disable-next-line prefer-const
    let [widgetAMD, widgetESM, ...editorEntries] = args.configDefaultConfig;
    const external = [...(widgetESM.external as Array<string | RegExp>)];
    const sharedDir = join("dist", "tmp", "widgets", "com", "mendix", "shared", "charts");
    const outESM = join(sharedDir, "esm");
    const outAMD = join(sharedDir, "amd");
    const plugins = [
        nodeResolve(),
        commonjs(),
        replace({
            "process.env.NODE_ENV": JSON.stringify(isProd ? "production" : "development")
        }),
        tarser()
    ];

    /*
     * [react-plotly.js]
     * Extracting react-plotly.js to separate esm and amd modules.
     */
    const reactPlotly: RollupOptions = {
        external,
        input: "react-plotly.js",
        plugins
    };
    const reactPlotlyESM: RollupOptions = {
        ...reactPlotly,
        output: {
            format: "es",
            file: format({ dir: outESM, base: "react-plotly.mjs" })
        }
    };
    const reactPlotlyAMD: RollupOptions = {
        ...reactPlotly,
        output: {
            format: "amd",
            file: format({ dir: outAMD, base: "react-plotly.js" })
        },
        plugins
    };

    /*
     * [@mendix/shared-charts]
     * Extracting common code entry point to separate esm and amd modules.
     * Also, replacing react-plotly.js path.
     */
    const chartsCommonMain = "@mendix/shared-charts/common";
    const chartsCommonFile = "charts-common";
    const chartsCommonOptions: RollupOptions = {
        external: [...external, "react-plotly.js"],
        input: chartsCommonMain,
        plugins
    };

    const chartsCommonESM: RollupOptions = {
        ...chartsCommonOptions,
        output: {
            format: "es",
            file: format({ dir: outESM, base: `${chartsCommonFile}.mjs` }),
            paths: {
                "react-plotly.js": "./react-plotly.mjs"
            }
        }
    };

    const chartsCommonAMD: RollupOptions = {
        ...chartsCommonOptions,
        output: {
            format: "amd",
            file: format({ dir: outAMD, base: `${chartsCommonFile}.js` }),
            paths: {
                "react-plotly.js": "./react-plotly.js"
            }
        },
        plugins
    };

    /*
     * [<widget>]
     * Patching rollup options for widget entries.
     * Also, replacing "@mendix/shared-charts" path to relative path.
     */
    [widgetAMD, widgetESM] = [widgetAMD, widgetESM].map(inputOptions => {
        inputOptions.external = [...external, chartsCommonMain];
        inputOptions.output = {
            ...inputOptions.output,
            paths: {
                [chartsCommonMain]:
                    (inputOptions.output as OutputOptions).format === "es"
                        ? `../../../shared/charts/esm/${chartsCommonFile}.mjs`
                        : `../../../shared/charts/amd/${chartsCommonFile}.js`
            }
        };
        return inputOptions;
    });

    return [reactPlotlyAMD, chartsCommonAMD, widgetAMD, reactPlotlyESM, chartsCommonESM, widgetESM, ...editorEntries];
};
