#!/usr/bin/env ts-node-script

import {
    addTestProjectWidgetsToMpk,
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
            // Copy old legacy widget to the module, so we have both for easy migration.
            // New widgets has different filename: com.mendix.widget.web.Pusher.mpk, they won't clash.
            addTestProjectWidgetsToMpk(["Pusher.mpk"]),
            moveModuleToDist
        ]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
