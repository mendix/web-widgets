import {
    copyJSActions,
    writeVersionAndLicenseToJSActions,
    runModuleSteps
} from "@mendix-internal/automation-utils/steps";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [copyJSActions, writeVersionAndLicenseToJSActions]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
