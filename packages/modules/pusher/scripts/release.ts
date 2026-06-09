#!/usr/bin/env ts-node-script

import { join } from "path";
import {
    addWidgetsToMpk,
    cloneTestProject,
    copyModuleLicense,
    copyWidgetsToProject,
    createModuleMpk,
    logStep,
    ModuleStepParams,
    moveModuleToDist,
    removeDist,
    runModuleSteps,
    writeModuleVersion
} from "@mendix/automation-utils/steps";
import { cp } from "@mendix/automation-utils/shell";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [
            removeDist,
            cloneTestProject,
            writeModuleVersion,
            copyModuleLicense,
            copyWidgetsToProject,
            copyLegacyPusherWidget,
            createModuleMpk,
            addWidgetsToMpk,
            moveModuleToDist
        ]
    });
}

async function copyLegacyPusherWidget({ config }: ModuleStepParams) {
    logStep("Copying legacy Pusher widget to the module");
    cp(
        join(config.paths.package, "assets", "Pusher_widget_legacy_1.2.0.mpk"),
        join(config.output.dirs.widgets, "Pusher.mpk")
    );
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
