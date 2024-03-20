import path from "node:path";
import { ModuleStepParams, logStep, copyActionsFiles } from "@mendix/automation-utils/steps";
import * as rollup from "rollup";
import type { InputOptions, OutputOptions } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

type Entry = {
    getInputOptions: (params: ModuleStepParams) => InputOptions;
    getOutputOptions: (params: ModuleStepParams) => OutputOptions;
};

const xlsxExportTools: Entry = {
    getInputOptions: ({ config }) => ({
        input: path.join(config.paths.javascriptsource, "actions/xlsx-export-tools.js"),
        plugins: [
            resolve(),
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

export async function bundleExportToExcelAction(params: ModuleStepParams): Promise<void> {
    await copyActionsFiles(["Export_To_Excel.js", "Reset_All_Filters.js", "Reset_Filter.js"])(params);

    logStep("Bundle action dependencies");
    const xlsxBundle = await rollup.rollup(xlsxExportTools.getInputOptions(params));
    await xlsxBundle.write(xlsxExportTools.getOutputOptions(params));
}
