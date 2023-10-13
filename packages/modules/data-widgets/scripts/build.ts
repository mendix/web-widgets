#!/usr/bin/env ts-node-script

import {
    copyModuleLicense,
    copyThemesourceToProject,
    copyWidgetsToProject,
    runModuleSteps,
    writeModuleVersion
} from "@mendix/automation-utils/steps";

import { bundleExportToExcelAction } from "./steps/bundle-export-to-excel";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [
            bundleExportToExcelAction,
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
