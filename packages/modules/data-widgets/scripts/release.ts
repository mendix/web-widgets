#!/usr/bin/env ts-node-script

import {
    addREADMEOSSToMpk,
    addWidgetsToMpk,
    cloneTestProject,
    copyActionsFiles,
    copyModuleLicense,
    copyThemesourceToProject,
    copyWidgetsToProject,
    createModuleMpk,
    moveModuleToDist,
    removeDist,
    runModuleSteps,
    writeModuleVersion
} from "@mendix/automation-utils/steps";

import { bundleXLSX } from "./steps/bundle-xlsx";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [
            removeDist,
            cloneTestProject,
            copyWidgetsToProject,
            copyThemesourceToProject,
            copyActionsFiles(["Export_To_Excel.js", "Reset_All_Filters.js", "Reset_Filter.js"]),
            bundleXLSX,
            writeModuleVersion,
            copyModuleLicense,
            createModuleMpk,
            addWidgetsToMpk,
            addREADMEOSSToMpk,
            moveModuleToDist
        ]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
