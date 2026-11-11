#!/usr/bin/env node

import enquirer from "enquirer";
import {
    getModuleChangelog,
    getWidgetChangelog,
    type ModuleChangelogFileWrapper,
    type WidgetChangelogFileWrapper
} from "../src/changelog-parser/index.ts";
import type { LogSection } from "../src/changelog-parser/types.ts";
import { oraPromise } from "../src/cli-utils.ts";
import { getPackageInfo, type PackageListing, selectPackage } from "../src/index.ts";

const { prompt } = enquirer;

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

async function writeChanges(pkg: PackageListing, sections: LogSection[]): Promise<void> {
    let changelog: WidgetChangelogFileWrapper | ModuleChangelogFileWrapper;
    try {
        changelog = await getWidgetChangelog(pkg.path);
    } catch {
        const module = await getPackageInfo(pkg.path);
        changelog = await getModuleChangelog(pkg.path, module.mxpackage.name);
    }

    changelog.addUnreleasedSections(sections).save();
}

async function main(): Promise<void> {
    const pkg = await selectPackage();
    const sections = await getChangelogSections();

    const { save } = await prompt<{ save: boolean }>({
        type: "confirm",
        initial: true,
        name: "save",
        message: "Save changes?"
    });

    if (save) {
        await oraPromise(writeChanges(pkg, sections), "Writing changes...");
        console.log("Done.");
    } else {
        console.log("Exit without changes.");
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
