import {
    cloneTestProject,
    copyActionsFiles,
    createModuleMpk,
    moveModuleToDist,
    removeDist,
    runModuleSteps,
    writeVersionAndLicenseToJSActions
} from "@mendix/automation-utils/steps";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [
            removeDist,
            cloneTestProject,
            copyActionsFiles([
                "FocusHelper.js",
                "FocusNext.js",
                "FocusPrevious.js",
                "ReadCookie.js",
                "ScrollTo.js",
                "SetCookie.js",
                "SetFavicon.js",
                "SetFocus.js",
                "TakePicture.js"
            ]),
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
