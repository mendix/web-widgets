#!/usr/bin/env ts-node-script

import { prompt } from "enquirer";
import { getPackageInfo, PackageListing, selectPackage } from "../src";
import { getNextVersion, writeVersion } from "../src/bump-version";
import {
    getModuleChangelog,
    getWidgetChangelog,
    ModuleChangelogFileWrapper,
    WidgetChangelogFileWrapper
} from "../src/changelog-parser";
import { LogSection } from "../src/changelog-parser/types";
import { oraPromise } from "../src/cli-utils";

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

async function selectNextVersion(currentVersion: string): Promise<string | undefined> {
    const { bump } = await prompt<{ bump: boolean }>({
        type: "confirm",
        initial: true,
        name: "bump",
        message: "Would you like to bump the package version?"
    });

    if (bump) {
        return getNextVersion(currentVersion);
    }

    return undefined;
}

async function writeChanges(pkg: PackageListing, sections: LogSection[], nextVersion?: string): Promise<void> {
    let changelog: WidgetChangelogFileWrapper | ModuleChangelogFileWrapper;
    try {
        changelog = await getWidgetChangelog(pkg.path);
    } catch {
        const module = await getPackageInfo(pkg.path);
        changelog = await getModuleChangelog(pkg.path, module.mxpackage.name);
    }

    changelog.addUnreleasedSections(sections).save();

    if (nextVersion) {
        await writeVersion(pkg, nextVersion);
    }
}

async function main(): Promise<void> {
    const pkg = await selectPackage();
    const sections = await getChangelogSections();
    const nextVersion = await selectNextVersion(pkg.version);

    const { save } = await prompt<{ save: boolean }>({
        type: "confirm",
        initial: true,
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
