#!/usr/bin/env ts-node-script

import {
    listPackages,
    getWidgetInfo,
    overrideFilesInPackageXml,
    getWidgetXmlPath
} from "@mendix/release-utils-internal/utils";
import { runWidgetSteps, removeDist, WidgetStepParams, logStep } from "@mendix/release-utils-internal/steps";
import { mkdir, unzip, cp, rm, zip } from "@mendix/release-utils-internal/shell";
import { dirname, join } from "node:path";

// Charts specific steps

const [, , env] = process.argv;
const copyToProject = env !== "production" && process.env.MX_PROJECT_PATH;

async function repackChartWidgets({ config }: WidgetStepParams): Promise<void> {
    logStep("Repack chart widgets");
    const { dependencies, paths, output } = config;
    const packages = await listPackages(dependencies);
    const widgets = await Promise.all(packages.map(({ path }) => getWidgetInfo(path)));

    mkdir("-p", [paths.tmp, dirname(output.files.mpk)]);

    console.info("Unpacking mpks and create correct file tree...");
    for (const pkg of widgets) {
        console.info(`Unpack ${pkg.name}@${pkg.version.format()}`);
        const contentDir = join(paths.tmp, pkg.mxpackage.name);
        const pkgSource = join(contentDir, "com");
        const pkgXml = join(contentDir, "package.xml");
        mkdir("-p", contentDir);
        await unzip(pkg.mpk, contentDir);
        cp("-r", pkgSource, paths.tmp);
        rm("-rf", pkgSource);
        rm(pkgXml);
    }

    console.info("Reading new file tree...");
    const relativePaths = widgets.map(getWidgetXmlPath);

    console.log("Updating package.xml...");
    const packageXml = join(paths.tmp, "package.xml");
    cp(join(paths.package, "src", "package.xml"), packageXml);
    await overrideFilesInPackageXml(packageXml, relativePaths, "clientModule");
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
