import { copyActionsFiles, writeVersionAndLicenseToJSActions, runModuleSteps } from "@mendix/automation-utils/steps";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [
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
            writeVersionAndLicenseToJSActions
        ]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
