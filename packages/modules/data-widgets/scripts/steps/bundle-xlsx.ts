import path from "node:path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terserPlugin from "@rollup/plugin-terser";
import * as rollup from "rollup";
import type { InputOptions, OutputOptions } from "rollup";
import { copyActionsFiles, logStep, type ModuleStepParams } from "@mendix/automation-utils/steps";

// The plugin's typings are resolved as CJS under NodeNext, but Node loads its ESM build whose default export is the function.
const terser = terserPlugin as unknown as typeof terserPlugin.default;

type Entry = {
    getInputOptions: (params: ModuleStepParams) => InputOptions;
    getOutputOptions: (params: ModuleStepParams) => OutputOptions;
};

const xlsxExportTools: Entry = {
    getInputOptions: ({ config }) => ({
        input: path.join(config.paths.javascriptsource, "actions/xlsx-export-tools.js"),
        plugins: [
            nodeResolve(),
            terser({
                module: true,
                ecma: 2017
            })
        ]
    }),
    getOutputOptions: ({ config }) => ({
        format: "es",
        file: path.join(config.output.dirs.javascriptsource, "actions/xlsx-export-tools.js")
    })
};

export async function bundleXLSX(params: ModuleStepParams): Promise<void> {
    logStep("Bundle action dependencies");
    const xlsxBundle = await rollup.rollup(xlsxExportTools.getInputOptions(params));
    await xlsxBundle.write(xlsxExportTools.getOutputOptions(params));
}
