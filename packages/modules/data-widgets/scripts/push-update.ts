#!/usr/bin/env ts-node-script

import { pushUpdateToTestProject, runModuleSteps } from "@mendix-internal/automation-utils/steps";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [pushUpdateToTestProject]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
