import copy from "@guanghechen/rollup-plugin-copy";
import { widgetTyping } from "@mendix/typings-generator";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { cyan, gray, green } from "colorette";
import rimraf from "rimraf";
import type { RollupOptions } from "rollup";
import bundleAnalyzer from "rollup-plugin-analyzer";
import { minify } from "rollup-plugin-swc3";
import { BuildConfig, createBuildConfig } from "./build.js";
import { bundleSize } from "./plugin/bundle-size.js";

type Env = {
    production: boolean;
    ci: boolean;
    mpkoutput?: string;
};

type CLIOptions = {
    config: string;
    configAnalyze?: true;
    configAnalyzeLimit?: number;
    configProduction?: true;
    configOutDir?: string;
    sourcemap?: boolean | "inline" | "hidden";
    watch?: true;
};

function main(options: CLIOptions): RollupOptions[] {
    options.configAnalyzeLimit ??= 20;
    options.configOutDir ??= "output";

    const env: Env = {
        production: !!process.env["production"],
        ci: !!process.env["CI"],
        mpkoutput: process.env["MPKOUTPUT"] || process.env["mpkoutput"]
    } as const;

    const rootDir = process.cwd();
    const config = createBuildConfig(rootDir, options.configOutDir);

    printBuildInfo(env, config);

    cleanup({
        dirs: [config.dirs.tmpDir, config.dirs.mpkDir],
        verbose: !env.ci
    });

    return createEntries({ rootDir, env, options, config });
}

export { main as rollupConfigFn };

type CreateEntriesParams = {
    rootDir: string;
    env: Env;
    options: CLIOptions;
    config: BuildConfig;
};

function createEntries(params: CreateEntriesParams): RollupOptions[] {
    const { rootDir, env, options, config } = params;

    const use = {
        bundleAnalyzer: !env.ci && options.configAnalyze,
        verboseOutput: !env.ci,
        minify: env.production,
        bundleSizeWarning: env.production
    } as const;

    const ts = () =>
        typescript({
            compilerOptions: {
                sourceMap: !!options.sourcemap
            }
        });

    const analyze = () =>
        use.bundleAnalyzer
            ? bundleAnalyzer({
                  summaryOnly: true,
                  limit: options.configAnalyzeLimit ?? 20
              })
            : null;

    const size = () =>
        bundleSize({
            warnOnExceeded: use.bundleSizeWarning
        });

    const mainEntryPlugins = [
        nodeResolve(),
        commonjs(),
        ts(),
        use.minify ? minify({ compress: true, mangle: true, sourceMap: !!options.sourcemap }) : null,
        analyze(),
        copy({
            targets: [
                { src: "src/package.xml", dest: config.dirs.clientModule.rootDir },
                { src: "src/**/*.xml", dest: config.dirs.clientModule.widgetDefinitionDir },
                { src: "src/*.{icon,tile}*.png", dest: config.dirs.clientModule.widgetDefinitionDir }
            ],
            verbose: use.verboseOutput
        }),
        widgetTyping({ sourceDir: `${rootDir}/src` }),
        size()
    ];

    const editorConfigPlugins = [nodeResolve(), commonjs(), ts(), analyze(), size()];

    const editorPreviewPlugins = [nodeResolve(), commonjs(), ts(), analyze(), size()];

    const external = [/^mendix($|\/)/, /^react$/, /^react\/jsx-runtime$/, /^react-dom$/, /^big.js$/];

    const entries: RollupOptions[] = [
        {
            input: config.inputs.main,
            output: [
                {
                    format: "amd",
                    file: config.outputs.mainAmd
                },
                {
                    format: "esm",
                    file: config.outputs.mainEsm
                }
            ],
            external,
            plugins: mainEntryPlugins
        }
    ];

    if (config.inputs.editorPreview) {
        entries.push({
            input: config.inputs.editorPreview,
            output: {
                format: "commonjs",
                file: config.outputs.editorPreview
            },
            external,
            plugins: editorPreviewPlugins
        });
    }

    if (config.inputs.editorConfig) {
        entries.push({
            input: config.inputs.editorConfig,
            output: {
                format: "commonjs",
                file: config.outputs.editorConfig
            },
            external,
            plugins: editorConfigPlugins
        });
    }

    return entries;
}

function printBuildInfo(env: Env, { package: pkg }: BuildConfig) {
    type Info = { prop?: string; value: string };

    const stats: Info[][] = [
        [{ prop: "widget", value: pkg.mxpackage.name }],
        [{ prop: "version", value: pkg.version }],
        [{ prop: "mode", value: env.production ? "production" : "development" }],
        [{ prop: "mpkoutput", value: pkg.mxpackage.mpkName }]
    ];

    console.log();
    for (const line of stats) {
        const l = line.map(({ value, prop }) => {
            return prop ? `${cyan(`${prop}:`.padEnd(20))} ${value}` : value;
        });
        console.log(l.join(gray(" | ")));
    }
}

function cleanup({ dirs, verbose }: { dirs: string[]; verbose: boolean }) {
    rimraf.sync(dirs);
    if (verbose) {
        console.log(`\n${gray("cleared:")}`, green(dirs.join(", ")));
    }
}
