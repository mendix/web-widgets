import { pushUpdateToTestProject, runModuleSteps } from "@mendix/automation-utils/steps";

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
