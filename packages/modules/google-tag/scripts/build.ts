import {
    copyActionsFiles,
    writeVersionAndLicenseToJSActions,
    runModuleSteps,
    copyWidgetsToProject
} from "@mendix/automation-utils/steps";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [copyActionsFiles(["GoogleTagActions.js"]), writeVersionAndLicenseToJSActions, copyWidgetsToProject]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
