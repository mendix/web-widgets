import { resolve as resolvePath } from "node:path";
import { existsSync } from "node:fs";
import copy from "@guanghechen/rollup-plugin-copy";
import { widgetTyping } from "@mendix/typings-generator";
import command from "rollup-plugin-command";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import livereload from "rollup-plugin-livereload";
import { gray, magenta } from "colorette";
import rimraf from "rimraf";
import type { RollupOptions } from "rollup";
import bundleAnalyzer from "rollup-plugin-analyzer";
import { minify } from "rollup-plugin-swc3";
import { BuildConfig, createBuildConfig } from "./build.js";
import { bundleSize } from "./plugin/bundle-size.js";
import * as dotenv from "dotenv";
import { createMPK } from "./mpk-utils.js";

type Env = Readonly<{
    production: boolean;
    ci: boolean;
    mpkoutput?: string;
    projectPath?: string;
}>;

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

    const rootDir = process.cwd();
    const env = getEnv();
    const config = createBuildConfig(rootDir, args.configOutDir);

    printBuildInfo(env, config, args);

    cleanup({
        dirs: [config.dirs.tmpDir, config.dirs.mpkDir],
        verbose: !env.ci && !args.watch
    });

    return createEntries({ rootDir, env, args, config });
}

export { main as rollupConfigFn };

type CreateEntriesParams = {
    rootDir: string;
    env: Env;
    args: CLIArgs;
    config: BuildConfig;
};

function createEntries(params: CreateEntriesParams): RollupOptions[] {
    const { rootDir, env, args, config } = params;
    const projectPath = getProjectPath(config, env);
    const mpkInfo = getMpkInfo(config, env);
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
                    mpkFile: mpkInfo.mpkFileAbsolute,
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

function getEnv(): Env {
    dotenv.config();

    const prod1 = !!JSON.parse(process.env["PRODUCTION"] || "false");
    const prod2 = process.env["NODE_ENV"] === "production";
    const mpk = process.env["MPKOUTPUT"];
    const mxProjectPath = process.env["MX_PROJECT_PATH"];

    type Writable<T> = {
        -readonly [P in keyof T]: T[P];
    };
    const env: Writable<Env> = {
        production: prod1 || prod2,
        ci: !!JSON.parse(process.env["CI"] || "false")
    };

    if (typeof mpk === "string" && mpk !== "") {
        env.mpkoutput = mpk;
    }

    if (typeof mxProjectPath === "string" && mxProjectPath !== "") {
        env.projectPath = mxProjectPath;
    }

    return Object.freeze(env);
}

function getProjectPath(config: BuildConfig, env: Env): string | undefined {
    let path: string;

    if (env.projectPath) {
        path = env.projectPath;
    } else if (typeof config.package.config?.["packagePath"] === "string") {
        path = config.package.config["packagePath"];
    } else {
        path = resolvePath("tests", "testProject");
    }

    return existsSync(path) ? path : undefined;
}

type MpkInfo = {
    mpkName: string;
    mpkFileAbsolute: string;
};

function getMpkInfo(config: BuildConfig, env: Env): MpkInfo {
    const mpkName = env.mpkoutput ? env.mpkoutput : config.package.mxpackage.mpkName;

    return {
        mpkName,
        mpkFileAbsolute: resolvePath(config.dirs.mpkDir, mpkName)
    };
}

function printBuildInfo(env: Env, config: BuildConfig, options: CLIArgs) {
    if (options.watch) {
        return;
    }

    const { package: pkg } = config;

    type Stat = { prop?: string; value: string };
    type Line = Stat[];
    const statsMain: Line[] = [
        [{ prop: "widget", value: pkg.mxpackage.name }],
        [{ prop: "version", value: pkg.version }],
        [{ prop: "mode", value: env.production ? "production" : "development" }],
        [{ prop: "mpkoutput", value: getMpkInfo(config, env).mpkName }]
    ];

    const statsCI: Line[] = [
        [
            { value: `${pkg.mxpackage.name}@${pkg.version}` },
            { value: `mode: ${env.production ? "production" : "development"}` }
        ]
    ];

    const stats = env.ci ? statsCI : statsMain;

    console.log();
    for (const line of stats) {
        const l = line.map(({ value, prop }) => {
            return prop ? `${align(gray(`${prop}:`))} ${value}` : value;
        });
        console.log(l.join(gray(" | ")));
    }

    const projectPath = getProjectPath(config, env);
    if (!env.ci && projectPath) {
        console.log(align(gray(`project path:`)), magenta(projectPath));
    }
}

function cleanup({ dirs, verbose }: { dirs: string[]; verbose: boolean }) {
    rimraf.sync(dirs);
    if (verbose) {
        console.log(align(gray("cleared:")), dirs.join(", "));
    }
}

function align(msg: string): string {
    return msg.padEnd(24);
}
