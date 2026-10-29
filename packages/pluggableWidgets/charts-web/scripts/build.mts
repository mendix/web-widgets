#!/usr/bin/env node

import { unzip, zip } from "@mendix/automation-utils/shell";
import { logStep, removeDist, runWidgetSteps, type WidgetStepParams } from "@mendix/automation-utils/steps";
import { getWidgetInfo, listPackages } from "@mendix/automation-utils/utils";
import { cp, mkdir, rm } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

// Charts specific steps

const [, , env] = process.argv;
const copyToProject = env !== "production" && process.env.MX_PROJECT_PATH;

async function repackChartWidgets({ config }: WidgetStepParams): Promise<void> {
    logStep("Repack chart widgets");
    const { dependencies, paths, output } = config;
    const packages = await listPackages(dependencies);
    const widgets = await Promise.all(packages.map(({ path }) => getWidgetInfo(path)));

    await mkdir(paths.tmp, { recursive: true });
    await mkdir(dirname(output.files.mpk), { recursive: true });

    console.info("Unpacking mpks and create correct file tree...");
    for (const pkg of widgets) {
        console.info(`Unpack ${pkg.name}@${pkg.version.format()}`);
        const contentDir = join(paths.tmp, pkg.mxpackage.name);
        const pkgSource = join(contentDir, "com");
        const pkgXml = join(contentDir, "package.xml");
        await mkdir(contentDir, { recursive: true });
        await unzip(pkg.mpk, contentDir);
        await cp(pkgSource, join(paths.tmp, "com"), { recursive: true });
        await rm(pkgSource, { recursive: true, force: true });
        await rm(pkgXml);
    }

    console.log("Copying package.xml...");
    await cp(join(paths.package, "src", "package.xml"), join(paths.tmp, "package.xml"));
    console.log("Copying License.txt...");
    await cp(join(paths.package, "../../../LICENSE"), join(paths.tmp, "License.txt"));
    console.log("Creating mpk...");
    await zip(paths.tmp, output.files.mpk);
}

async function main(): Promise<void> {
    await runWidgetSteps({
        packagePath: process.cwd(),
        steps: [
            removeDist,
            repackChartWidgets,
            async ({ config }) => {
                if (copyToProject) {
                    logStep("Copy widget to targetProject");
                    const dir = join(config.paths.targetProject, "widgets");
                    await mkdir(dir, { recursive: true });
                    await cp(config.output.files.mpk, join(dir, basename(config.output.files.mpk)));
                }
            }
        ]
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
