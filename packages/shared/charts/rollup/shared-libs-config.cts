import { OutputOptions, type RollupOptions, type Plugin } from "rollup";
import path from "node:path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
// import tarser from "@rollup/plugin-terser";
const { join, format } = path;

// Based on packages/pluggable-widgets-tools/configs/rollup.config.js
interface Args {
    configDefaultConfig: [
        WidgetAMDEntry: RollupOptions,
        WidgetESMEntry: RollupOptions,
        EditorPreviewEntry: RollupOptions,
        EditorConfigEntry: RollupOptions
    ];
    configProduction: unknown;
}

const bundles = {
    plotly: {
        // react-plotly.js@2.6.0 use: `import Plotly from 'plotly.js/dist/plotly';`
        // so we use same path as input.
        input: "plotly.js/dist/plotly",
        file: {
            amd: "plotly.js",
            esm: "plotly.mjs"
        }
    },
    reactPlotly: {
        input: "react-plotly.js",
        file: {
            amd: "react-plotly.js",
            esm: "react-plotly.mjs"
        }
    },
    sharedCharts: {
        // The path is as if we importing code into widget module.
        input: "@mendix/shared-charts/main",
        file: {
            amd: "shared-charts.js",
            esm: "shared-charts.mjs"
        }
    }
} as const;

// use CommonJS exports
exports.sharedLibsConfig = function sharedLibsConfig(args: Args): RollupOptions[] {
    // eslint-disable-next-line prefer-const
    let [widgetAMD, widgetESM, editorPreview, editorConfig] = args.configDefaultConfig;
    const external = [...(widgetESM.external as Array<string | RegExp>)];
    const sharedDir = join("dist", "tmp", "widgets", "com", "mendix", "shared", "charts");
    const bundle: BundleBuildConfig = {
        ...bundles,
        isProd: isProd(args),
        external,
        amdDir: join(sharedDir, "amd"),
        esmDir: join(sharedDir, "esm")
    };

    [widgetAMD, widgetESM] = [widgetAMD, widgetESM].map(inputOptions => {
        inputOptions.external = [...external, bundle.sharedCharts.input];
        inputOptions.output = {
            ...inputOptions.output,
            paths: {
                [bundle.sharedCharts.input]:
                    (inputOptions.output as OutputOptions).format === "es"
                        ? `../../../shared/charts/esm/${bundle.sharedCharts.file.esm}`
                        : `../../../shared/charts/amd/${bundle.sharedCharts.file.amd}`
            }
        };
        return inputOptions;
    });

    // Keep each item on separate line
    // prettier-ignore
    return [
        plotly(bundle),
        reactPlotly(bundle),
        sharedCode(bundle),
        widgetAMD,
        widgetESM,
        editorPreview,
        editorConfig
    ];
};

/** Bundles */

type Bundles = typeof bundles;

interface BundleBuildConfig extends Bundles {
    isProd: boolean;
    external: Array<string | RegExp>;
    amdDir: string;
    esmDir: string;
}

/** src/common.js bundle config */
function sharedCode(bundle: BundleBuildConfig): RollupOptions {
    const esmOutput: OutputOptions = {
        format: "es",
        file: format({ dir: bundle.esmDir, base: bundle.sharedCharts.file.esm }),
        paths: {
            // Replace imports of react-plotly.js with relative path.
            [bundle.reactPlotly.input]: `./${bundle.reactPlotly.file.esm}`
        }
    };

    const amdOutput: OutputOptions = {
        format: "amd",
        file: format({ dir: bundle.amdDir, base: bundle.sharedCharts.file.amd }),
        paths: {
            // Replace imports of react-plotly.js with relative path.
            [bundle.reactPlotly.input]: `./${bundle.reactPlotly.file.amd}`
        }
    };

    return {
        input: bundle.sharedCharts.input,
        plugins: stdPlugins(bundle),
        // Mark reactPlotly as external to not include react-plotly.js in bundle.
        external: [...bundle.external, bundle.reactPlotly.input],
        output: [esmOutput, amdOutput]
    };
}

/** react-plotly.js bundle config */
function reactPlotly(bundle: BundleBuildConfig): RollupOptions {
    const esmOutput: OutputOptions = {
        format: "es",
        file: format({ dir: bundle.esmDir, base: bundle.reactPlotly.file.esm }),
        paths: {
            // Replace imports of plotly.js with relative path.
            [bundle.plotly.input]: `./${bundle.plotly.file.esm}`
        }
    };

    const amdOutput: OutputOptions = {
        format: "amd",
        file: format({ dir: bundle.amdDir, base: bundle.reactPlotly.file.amd }),
        paths: {
            // Replace imports of plotly.js with relative path.
            [bundle.plotly.input]: `./${bundle.plotly.file.amd}`
        }
    };

    return {
        input: bundle.reactPlotly.input,
        // Mark plotly as external to not include plotly.js in bundle.
        external: [...bundle.external, bundle.plotly.input],
        plugins: stdPlugins(bundle),
        output: [esmOutput, amdOutput]
    };
}

/** plotly.js bundle config */
function plotly(bundle: BundleBuildConfig): RollupOptions {
    const esmOutput: OutputOptions = {
        format: "es",
        file: format({ dir: bundle.esmDir, base: bundle.plotly.file.esm })
    };

    const amdOutput: OutputOptions = {
        format: "amd",
        file: format({ dir: bundle.amdDir, base: bundle.plotly.file.amd })
    };

    return {
        input: bundle.plotly.input,
        external: [...bundle.external],
        plugins: stdPlugins(bundle),
        output: [esmOutput, amdOutput]
    };
}

/** Utils */

const isProd = (args: Args): boolean => !!args.configProduction;

/** Tarser comments filter */
// const commentsFilter = (_: unknown, comment: { value: string; type: string }): boolean => {
//     const { type, value } = comment;
//     if (type === "comment2") {
//         return /@preserve|@license|@cc_on|License|license/i.test(value);
//     }

//     return false;
// };

/**
 * IMPORTANT: Please use this only for common plugins.
 * All bundle specific plugins should be defined in the bundle function.
 */
const stdPlugins = (config: { isProd: boolean }): Plugin[] => [
    nodeResolve(),
    commonjs(),
    replace({
        "process.env.NODE_ENV": JSON.stringify(config.isProd ? "production" : "development")
    })
    // tarser({
    //     format: {
    //         comments: commentsFilter
    //     }
    // })
];
