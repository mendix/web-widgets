#!/usr/bin/env ts-node-script

import { prompt } from "enquirer";
import ora from "ora";
import { bumpPackageJson, bumpXml, getNextVersion } from "../src/bump-version";
import { getWidgetChangelog } from "../src/changelog-parser";
import { LogSection } from "../src/changelog-parser/types";
import { listPackages, PackageListing } from "../src/monorepo";

async function oraPromise<T>(task: Promise<T>, msg: string): Promise<T> {
    const spinner = ora(msg);
    spinner.start();
    const r = await task;
    spinner.stop();
    return r;
}

async function selectPackage(): Promise<PackageListing> {
    const pkgs = await oraPromise(listPackages(["'*'", "!web-widgets"]), "Loading packages...");

    const { packageName } = await prompt<{ packageName: string }>({
        type: "autocomplete",
        name: "packageName",
        message: "Please select package",
        choices: pkgs.map(pkg => pkg.name)
    });

    const pkg = pkgs.find(p => p.name === packageName);

    if (!pkg) {
        throw new Error(`Unable to find package meta for ${packageName}`);
    }

    return pkg;
}

async function getChangelogSections(): Promise<LogSection[]> {
    const sections: LogSection[] = [];
    let adding = true;

    while (adding) {
        const { sectionType } = await prompt<{ sectionType: string }>({
            type: "autocomplete",
            name: "sectionType",
            message: "Please select section type",
            choices: [
                "Added",
                "Changed",
                "Deprecated",
                "Removed",
                "Fixed",
                "Security",
                "Breaking changes",
                "Documentation"
            ]
        });

        const { message } = await prompt<{ message: string }>({
            type: "input",
            name: "message",
            message: "Message"
        });

        sections.push({
            type: sectionType as LogSection["type"],
            logs: [message]
        });

        const { addMore } = await prompt<{ addMore: boolean }>({
            type: "confirm",
            name: "addMore",
            message: "Add one more record?"
        });

        adding = addMore;
    }

    return sections;
}

async function updateVersion(currentVersion: string): Promise<string | undefined> {
    const { bump } = await prompt<{ bump: boolean }>({
        type: "confirm",
        name: "bump",
        message: "Would you like to bump the package version?"
    });

    if (bump) {
        const nextVersion = await getNextVersion(currentVersion);
        console.log(`Version change: ${currentVersion} => ${nextVersion}`);
        return nextVersion;
    }

    return undefined;
}

async function writeChanges(pkg: PackageListing, sections: LogSection[], nextVersion?: string): Promise<void> {
    const changelog = await getWidgetChangelog(pkg.path);
    changelog.addUnreleasedSections(sections).save();

    if (nextVersion) {
        bumpPackageJson(pkg.path, nextVersion);
        await bumpXml(pkg.path, nextVersion);
    }
}

async function main(): Promise<void> {
    const pkg = await selectPackage();
    const sections = await getChangelogSections();
    const nextVersion = await updateVersion(pkg.version);

    const { save } = await prompt<{ save: boolean }>({
        type: "confirm",
        name: "save",
        message: "Save changes?"
    });

    if (save) {
        await oraPromise(writeChanges(pkg, sections, nextVersion), "Writing changes...");
        console.log("Done.");
    } else {
        console.log("Exit without changes.");
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
