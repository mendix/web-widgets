#!/usr/bin/env ts-node-script

import {
    addWidgetsToMpk,
    cloneTestProject,
    copyModuleLicense,
    copyThemesourceToProject,
    copyWidgetsToProject,
    createModuleMpk,
    moveModuleToDist,
    removeDist,
    runModuleSteps,
    writeModuleVersion
} from "@mendix/automation-utils/steps";

import { bundleExportToExcelAction } from "./steps/bundle-export-to-excel";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [
            removeDist,
            cloneTestProject,
            copyWidgetsToProject,
            copyThemesourceToProject,
            bundleExportToExcelAction,
            writeModuleVersion,
            copyModuleLicense,
            createModuleMpk,
            addWidgetsToMpk,
            moveModuleToDist
        ]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
