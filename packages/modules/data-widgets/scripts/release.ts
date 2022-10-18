#!/usr/bin/env ts-node-script

import {
    addWidgetsToMpk,
    cloneTestProject,
    copyFilesToMpk,
    copyThemesourceToProject,
    copyWidgetsToProject,
    createModuleMpk,
    moveModuleToDist,
    removeDist,
    runModuleSteps
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
            createModuleMpk,
            addWidgetsToMpk,
            moveModuleToDist,
            copyFilesToMpk([{ filePath: "LICENSE", pkgPath: "LICENSE" }])
        ]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
