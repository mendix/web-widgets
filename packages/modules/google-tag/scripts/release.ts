#!/usr/bin/env ts-node-script

import {
    addREADMEOSSToMpk,
    addWidgetsToMpk,
    cloneTestProject,
    copyActionsFiles,
    copyWidgetsToProject,
    createModuleMpk,
    moveModuleToDist,
    removeDist,
    runModuleSteps,
    writeVersionAndLicenseToJSActions
} from "@mendix/automation-utils/steps";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [
            removeDist,
            cloneTestProject,
            copyWidgetsToProject,
            copyActionsFiles(["GoogleTagAction.js"]),
            writeVersionAndLicenseToJSActions,
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
