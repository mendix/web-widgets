#!/usr/bin/env ts-node-script

import { dependencies } from "./dependencies";
import { runModuleSteps, copyThemesourceToProject, copyWidgetsToProject } from "@mendix/release-utils-internal/steps";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        dependencies,
        steps: [copyThemesourceToProject, copyWidgetsToProject]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
