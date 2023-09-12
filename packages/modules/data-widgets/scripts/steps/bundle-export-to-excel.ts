import { ModuleStepParams, logStep } from "@mendix/automation-utils/steps";
import * as rollup from "rollup";
import type { InputOptions, OutputOptions } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import path from "node:path";

type Entry = {
    inputOptions: InputOptions;
    getOutputOptions: (params: ModuleStepParams) => OutputOptions;
};
const action: Entry = {
    inputOptions: {
        input: "src/javascriptsource/datawidgets/actions/ExportToExcel.js",
        external: id => /xlsx-export-tools/.test(id)
    },
    getOutputOptions: params => ({
        format: "es",
        file: path.join(params.config.output.dirs.javascriptsource, "actions/ExportToExcel.js")
    })
};

const xlsxExportTools: Entry = {
    inputOptions: {
        input: "src/javascriptsource/datawidgets/actions/xlsx-export-tools.js",
        plugins: [resolve(), terser()]
    },
    getOutputOptions: params => ({
        format: "es",
        file: path.join(params.config.output.dirs.javascriptsource, "actions/xlsx-export-tools.js")
    })
};

export async function bundleExportToExcelAction(params: ModuleStepParams): Promise<void> {
    logStep("Bundle ExportToExcel action");
    const actionBundle = await rollup.rollup(action.inputOptions);
    await actionBundle.write(action.getOutputOptions(params));
    const xlsxBundle = await rollup.rollup(xlsxExportTools.inputOptions);
    await xlsxBundle.write(xlsxExportTools.getOutputOptions(params));
}
