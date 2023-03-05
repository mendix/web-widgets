import { resolve as resolvePath } from "node:path";
import copy from "@guanghechen/rollup-plugin-copy";
import command from "rollup-plugin-command";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import livereload from "rollup-plugin-livereload";
import { gray, magenta, green } from "colorette";
import rimraf from "rimraf";
import type { RollupOptions } from "rollup";
import bundleAnalyzer from "rollup-plugin-analyzer";
import { minify } from "rollup-plugin-swc3";
import type { Bundle } from "./bundle.js";
import { bundleSize } from "./plugin/bundle-size.js";
import { widgetTyping } from "./plugin/widget-typing.js";
import { createMPK } from "./mpk-utils.js";
import { Context, context } from "./context.js";

type CLIArgs = {
    config: string;
    configAnalyze?: true;
    configAnalyzeLimit?: number;
    configProduction?: true;
    configOutDir?: string;
    sourcemap?: boolean | "inline" | "hidden";
    watch?: true;
};

function main(args: CLIArgs): RollupOptions[] {
    args.configAnalyzeLimit ??= 20;
    args.configOutDir ??= "output";

    const ctx = context();
    console.dir(ctx, { depth: 8 });

    printBuildInfo(ctx, args);

    cleanup({
        dirs: [ctx.bundle.dirs.tmpDir, ctx.bundle.dirs.mpkDir],
        verbose: !ctx.env.ci && !args.watch
    });

    return createEntries({ rootDir: ctx.rootDir, env: ctx.env, args, config: ctx.bundle }, ctx);
}

export { main as rollupConfigFn };

type CreateEntriesParams = {
    rootDir: string;
    env: Env;
    args: CLIArgs;
    config: Bundle;
};

function createEntries(params: CreateEntriesParams, context: Context): RollupOptions[] {
    const { rootDir, env, args, config } = params;
    const projectPath = context.config.projectPath;
    const hasProject = !!projectPath;

    const use = {
        bundleAnalyzer: !env.ci && !args.watch && args.configAnalyze,
        verboseOutput: !env.ci && !args.watch,
        minify: env.production,
        bundleSizeWarning: env.production,
        bundleSize: !args.watch,
        livereload: args.watch && hasProject
    } as const;

    const ts = () =>
        typescript({
            exclude: ["**/__tests__/**/*"],
            compilerOptions: {
                sourceMap: !!args.sourcemap,
                noEmitOnError: !args.watch
            }
        });

    const analyze = () =>
        use.bundleAnalyzer
            ? bundleAnalyzer({
                  summaryOnly: true,
                  limit: args.configAnalyzeLimit ?? 20
              })
            : null;

    const size = () =>
        use.bundleSize
            ? bundleSize({
                  warnOnExceeded: use.bundleSizeWarning
              })
            : null;

    // We need to create .mpk and copy results to test project after bundling is finished.
    // In case of a regular build is it is on `writeBundle` of the last config we define
    // (since rollup processes configs sequentially). But in watch mode rollup re-bundles only
    // configs affected by a change => we cannot know in advance which one will be "the last".
    // So we run the same logic for all configs, letting the last one win.
    const mpk = () =>
        command([
            () =>
                createMPK({
                    mpkFile: context.bundle.mpk.mpkFileAbsolute,
                    clientModuleRootDir: resolvePath(config.dirs.clientModule.rootDir)
                })
        ]);

    const mainEntryPlugins = [
        nodeResolve(),
        commonjs(),
        ts(),
        use.minify ? minify({ compress: true, mangle: true, sourceMap: !!args.sourcemap }) : null,
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
        size(),
        use.livereload ? livereload() : null,
        mpk()
    ];

    const editorConfigPlugins = [nodeResolve(), commonjs(), ts(), analyze(), size(), mpk()];

    const editorPreviewPlugins = [nodeResolve(), commonjs(), ts(), analyze(), size(), mpk()];

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

type Env = Readonly<{
    production: boolean;
    ci: boolean;
    mpkoutput?: string;
    projectPath?: string;
}>;

function printBuildInfo(context: Context, options: CLIArgs) {
    if (options.watch) {
        return;
    }

    const { env, package: pkg, bundle } = context;

    type Stat = { prop?: string; value: string };
    type Line = Stat[];
    const statsMain: Line[] = [
        [{ prop: "widget", value: pkg.mxpackage.name }],
        [{ prop: "version", value: pkg.version }],
        [{ prop: "mode", value: env.production ? "production" : "development" }],
        [{ prop: "mpkoutput", value: bundle.mpk.mpkName }]
    ];

    const statsCI: Line[] = [
        [
            { value: `${pkg.mxpackage.name}@${pkg.version}` },
            { value: `mode: ${env.production ? "production" : "development"}` }
        ]
    ];

    const stats = env.ci ? statsCI : statsMain;

    // Spacing top
    console.log();

    for (const line of stats) {
        const l = line.map(({ value, prop }) => {
            return prop ? `${align(gray(`${prop}:`))} ${value}` : value;
        });
        console.log(l.join(gray(" | ")));
    }

    const projectPath = context.config.projectPath;
    if (!env.ci && projectPath) {
        console.log(align(gray(`project path:`)), magenta(projectPath));
    }
}

function cleanup({ dirs, verbose }: { dirs: string[]; verbose: boolean }) {
    rimraf.sync(dirs);
    if (verbose) {
        // Spacing top
        console.log();
        console.log(green(`removed:`));
        for (const dir of dirs) {
            console.log(green(`  ${dir}`));
        }
    }
}

function align(msg: string): string {
    return msg.padEnd(24);
}
