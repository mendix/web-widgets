import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import tarser from "@rollup/plugin-terser";
import path from "node:path";
import { OutputOptions, type Plugin, type RollupOptions } from "rollup";
import copy from "rollup-plugin-copy";
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
        // We redirect this import to min version.
        input: "plotly.js-dist-min",
        file: {
            amd: "plotly.min.js",
            esm: "plotly.min.mjs"
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

    // Entries - widget entries with changed config.
    // We mark plotly.input as external module and redirect
    // it to shared/charts/<amd|esm>/plotly.something it.
    // IMPORTANT: By marking plotly as external we avoid bundling it and fix issue with memory.
    const entries = [widgetAMD, widgetESM].map(inputOptions => {
        // Plotly and shared marked as external
        inputOptions.external = [...external, bundle.sharedCharts.input, bundle.plotly.input];

        const format = (inputOptions.output as OutputOptions).format;
        const paths: OutputOptions["paths"] = {};
        paths[bundle.sharedCharts.input] =
            format === "es"
                ? `../../../shared/charts/esm/${bundle.sharedCharts.file.esm}`
                : `../../../shared/charts/amd/${bundle.sharedCharts.file.amd}`;
        paths[bundle.plotly.input] =
            format === "es"
                ? `../../../shared/charts/esm/${bundle.plotly.file.esm}`
                : `../../../shared/charts/amd/${bundle.plotly.file.amd}`;

        inputOptions.output = {
            ...inputOptions.output,
            paths
        };

        return inputOptions;
    });

    // Keep each item on separate line
    // prettier-ignore
    return [
        plotly(bundle),
        reactPlotly(bundle),
        sharedCode(bundle),
        ...entries,
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
    const plotlyImport = "plotly.js/dist/plotly";
    const esmOutput: OutputOptions = {
        format: "es",
        file: format({ dir: bundle.esmDir, base: bundle.reactPlotly.file.esm }),
        paths: {
            // Replace imports of plotly.js with relative path.
            [plotlyImport]: `./${bundle.plotly.file.esm}`
        }
    };

    const amdOutput: OutputOptions = {
        format: "amd",
        file: format({ dir: bundle.amdDir, base: bundle.reactPlotly.file.amd }),
        paths: {
            // Replace imports of plotly.js with relative path.
            [plotlyImport]: `./${bundle.plotly.file.amd}`
        }
    };

    return {
        input: bundle.reactPlotly.input,
        // Mark plotly as external to not include plotly.js in bundle.
        external: [...bundle.external, plotlyImport],
        plugins: stdPlugins(bundle),
        output: [esmOutput, amdOutput]
    };
}

/**
 * plotly.js bundle config
 *
 * Main goal is to:
 *  1. Copy plotly.min.js.
 *  2. Convert to es module (for modern client).
 *  3. Copy to it's own file.
 *  4. Avoid running tarser on plotly,
 *  otherwise our GitHub pipeline fails
 *  because tarser consume too much memory.
 */
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
        plugins: [
            nodeResolve(),
            commonjs(),
            // Here we just copy the license file.
            copy({
                targets: [
                    { src: "node_modules/plotly.js/dist/plotly.min.js.LICENSE.txt", dest: bundle.amdDir },
                    { src: "node_modules/plotly.js/dist/plotly.min.js.LICENSE.txt", dest: bundle.esmDir }
                ],
                verbose: true
            })
        ],
        output: [esmOutput, amdOutput]
    };
}

/** Utils */

const isProd = (args: Args): boolean => !!args.configProduction;

/**
 * IMPORTANT: Please use this only for common plugins.
 * All bundle specific plugins should be defined in the bundle function.
 */
const stdPlugins = (config: { isProd: boolean }): Plugin[] => [
    nodeResolve(),
    commonjs(),
    replace({
        "process.env.NODE_ENV": JSON.stringify(config.isProd ? "production" : "development")
    }),
    tarser()
];
