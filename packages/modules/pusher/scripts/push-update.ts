import { runModuleSteps, pushUpdates } from "@mendix/automation-utils/steps";

async function main(): Promise<void> {
    await runModuleSteps({
        packagePath: process.cwd(),
        steps: [pushUpdates]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
