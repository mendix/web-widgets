#!/usr/bin/env ts-node-script

import {
    addREADMEOSSToMpk,
    addWidgetsToMpk,
    cloneTestProject,
    copyModuleLicense,
    copyWidgetsToProject,
    createModuleMpk,
    moveModuleToDist,
    removeDist,
    runModuleSteps,
    writeModuleVersion
} from "@mendix/automation-utils/steps";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [
            removeDist,
            cloneTestProject,
            writeModuleVersion,
            copyModuleLicense,
            copyWidgetsToProject,
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
