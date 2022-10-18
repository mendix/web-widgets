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
} from "@mendix/release-utils-internal/steps";
import { dependencies } from "./dependencies";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        dependencies,
        steps: [
            removeDist,
            cloneTestProject,
            copyWidgetsToProject,
            copyThemesourceToProject,
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
