import {
    cloneTestProject,
    copyJSActions,
    createModuleMpk,
    moveModuleToDist,
    removeDist,
    runModuleSteps,
    writeVersionAndLicenseToJSActions
} from "@mendix/release-utils-internal/steps";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [
            removeDist,
            cloneTestProject,
            copyJSActions,
            writeVersionAndLicenseToJSActions,
            createModuleMpk,
            moveModuleToDist
        ]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
