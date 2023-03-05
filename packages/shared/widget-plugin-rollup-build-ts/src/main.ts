import { gray, magenta, green } from "colorette";
import rimraf from "rimraf";
import type { OutputOptions, RollupOptions } from "rollup";
import { Context, context } from "./context.js";
import { rollupConfig } from "./rollup-config.js";

type CLIArgs = {
    config: string;
    configAnalyze?: true;
    configAnalyzeLimit?: number;
    configProduction?: true;
    configOutDir?: string;
    sourcemap?: OutputOptions["sourcemap"];
    watch?: true;
};

function main(args: CLIArgs): RollupOptions[] {
    const ctx = context({
        sourcemap: args.sourcemap,
        outDir: args.configOutDir,
        bundleAnalyzer: args.configAnalyze
    });

    console.dir(ctx, { depth: 8 });

    printBuildInfo(ctx, args);

    cleanup({
        dirs: [ctx.bundle.dirs.tmpDir, ctx.bundle.dirs.mpkDir],
        verbose: !ctx.env.ci && !args.watch
    });

    return rollupConfig(ctx);
}

export { main as rollupConfigFn };

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
