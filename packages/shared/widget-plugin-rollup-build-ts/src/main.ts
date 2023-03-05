import type { OutputOptions, RollupOptions } from "rollup";
import { context } from "./context.js";
import { printBuildInfo } from "./print.js";
import { rollupConfig } from "./rollup-config.js";
import { cleanup } from "./utils.js";

type CLIArgs = {
    config: string;
    configUseAnalyzer?: true;
    configAnalyzerLimit?: number;
    configOutDir?: string;
    sourcemap?: OutputOptions["sourcemap"];
    watch?: true;
};

function main(args: CLIArgs): RollupOptions[] {
    const ctx = context({
        watch: args.watch,
        sourcemap: args.sourcemap,
        outDir: args.configOutDir,
        bundleAnalyzer: args.configUseAnalyzer,
        analyzerLimit: args.configAnalyzerLimit
    });

    console.dir(ctx, { depth: 8 });

    printBuildInfo(ctx);

    cleanup({
        verbose: ctx.config.verbose,
        dirs: [ctx.bundle.dirs.tmpDir, ctx.bundle.dirs.mpkDir]
    });

    return rollupConfig(ctx);
}

export { main as rollupConfigFn };
