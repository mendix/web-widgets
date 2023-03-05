import { yellow, green } from "colorette";
import type { Context } from "./context.js";

export function printBuildInfo(ctx: Context) {
    if (ctx.options.watch) {
        return;
    }

    const { env, package: pkg, bundle } = ctx;

    const statsMain: Line[] = [
        [{ prop: "widget", value: pkg.mxpackage.name }],
        [{ prop: "version", value: pkg.version }],
        [{ prop: "mode", value: env.production ? "production" : "development" }],
        [{ prop: "mpkoutput", value: bundle.mpk.mpkName }]
    ];

    const statsCI: Line[] = [
        [
            { prop: "widget", value: `${pkg.mxpackage.name}@${pkg.version}`, align: false },
            { prop: "mode", value: env.production ? "production" : "development", align: false }
        ]
    ];

    const stats = env.ci ? statsCI : statsMain;

    // Spacing top
    console.log();

    for (const line of stats) {
        console.log(line.map(formatStat).join(" | "));
    }

    const projectPath = ctx.config.projectPath;
    if (!env.ci && projectPath) {
        console.log(align(`project path:`), yellow(projectPath));
    }
}

function formatStat({ value, prop, align: useAlign = true }: Stat): string {
    if (!prop) {
        return value;
    }
    let p = prop + ":";
    p = useAlign ? align(p) : p;
    return `${p} ${green(value)}`;
}

function align(msg: string): string {
    return msg.padEnd(16);
}

type Stat = { prop?: string; value: string; align?: boolean };

type Line = Stat[];
