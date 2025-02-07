#!/usr/bin/env ts-node-script

import {
    addWidgetsToMpk,
    cloneTestProject,
    copyWidgetsToProject,
    createModuleMpk,
    moveModuleToDist,
    removeDist,
    runModuleSteps
} from "@mendix/automation-utils/steps";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [removeDist, cloneTestProject, copyWidgetsToProject, createModuleMpk, addWidgetsToMpk, moveModuleToDist]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
