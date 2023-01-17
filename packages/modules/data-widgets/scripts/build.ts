#!/usr/bin/env ts-node-script

import {
    copyModuleLicense,
    copyThemesourceToProject,
    copyWidgetsToProject,
    runModuleSteps,
    writeModuleVersion
} from "@mendix-internal/automation-utils/steps";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [copyThemesourceToProject, copyWidgetsToProject, writeModuleVersion, copyModuleLicense]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
