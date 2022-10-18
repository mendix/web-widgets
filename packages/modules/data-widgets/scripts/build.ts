#!/usr/bin/env ts-node-script

import {
    copyModuleLicense,
    copyThemesourceToProject,
    copyWidgetsToProject,
    runModuleSteps,
    writeModuleVersion
} from "@mendix/release-utils-internal/steps";
import { dependencies } from "./dependencies";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        dependencies,
        steps: [copyThemesourceToProject, copyWidgetsToProject, writeModuleVersion, copyModuleLicense]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
