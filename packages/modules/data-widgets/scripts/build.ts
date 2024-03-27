#!/usr/bin/env ts-node-script

import {
    copyModuleLicense,
    copyThemesourceToProject,
    copyWidgetsToProject,
    runModuleSteps,
    writeModuleVersion,
    copyActionsFiles
} from "@mendix/automation-utils/steps";

import { bundleXLSX } from "./steps/bundle-xlsx";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [
            copyActionsFiles(["Export_To_Excel.js", "Reset_All_Filters.js", "Reset_Filter.js"]),
            bundleXLSX,
            copyThemesourceToProject,
            writeModuleVersion,
            copyModuleLicense,
            copyWidgetsToProject
        ]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
