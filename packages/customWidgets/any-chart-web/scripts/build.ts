#!/usr/bin/env ts-node-script

import { cp, mkdir, zip, exec } from "@mendix/automation-utils/shell";
import { logStep, removeDist, runWidgetSteps, WidgetStepParams } from "@mendix/automation-utils/steps";
import { dirname, join } from "node:path";

const [, , env] = process.argv;
const isProd = env === "production";
const copyToProject = !isProd && process.env.MX_PROJECT_PATH;

async function createMPK({ config }: WidgetStepParams): Promise<void> {
    logStep("Create mpk");
    const { paths, output } = config;
    mkdir("-p", dirname(output.files.mpk));
    await zip(paths.tmp, output.files.mpk);
}

async function main(): Promise<void> {
    await runWidgetSteps({
        packagePath: process.cwd(),
        steps: [
            removeDist,
            async () => {
                logStep("Bundling");
                await exec(`webpack -c webpack.config.js`);
            },
            createMPK,
            async ({ config }) => {
                if (copyToProject) {
                    logStep("Copy widget to targetProject");
                    const dir = join(config.paths.targetProject, "widgets");
                    mkdir("-p", dir);
                    cp(config.output.files.mpk, dir);
                }
            }
        ]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
