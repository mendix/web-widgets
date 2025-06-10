#!/usr/bin/env ts-node-script

import { ZodError } from "zod";
import {
    getPackageFileContent,
    PackageSchema,
    ModulePackageSchema,
    JSActionsPackageSchema,
    PublishedPackageSchema
} from "../src";
import { verify as verifyWidget } from "../src/verify-widget-manifest";
import { fgCyan, fgGreen, fgYellow } from "../src/ansi-colors";
import { getModuleChangelog, getWidgetChangelog } from "../src";

async function main(): Promise<void> {
    const path = process.cwd();

    try {
        const raw = await getPackageFileContent(path);

        // To get better error output from zod use empty objects
        const target = {
            mxpackage: {},
            marketplace: {},
            repository: {},
            testProject: {},
            ...raw
        };

        // First, check common fields
        const info = PackageSchema.parse(target);

        switch (info.mxpackage.type) {
            case "widget": {
                await verifyWidget(path, target);
                break;
            }
            case "module": {
                ModulePackageSchema.parse(target);
                break;
            }
            case "jsactions": {
                JSActionsPackageSchema.parse(target);
                break;
            }
        }

        switch (info.mxpackage.changelogType ?? info.mxpackage.type) {
            case "widget": {
                getWidgetChangelog(path);
                break;
            }
            case "module": {
                getModuleChangelog(path, info.mxpackage.name);
                break;
            }
        }

        if (!info.private) {
            // .private is not true - assume package is published at marketplace
            PublishedPackageSchema.parse(target);
        }

        // Changelog check coming soon...

        console.log(fgGreen("Verification success"));
    } catch (error) {
        if (error instanceof ZodError) {
            for (const issue of error.issues) {
                const keys = issue.path.map(x => fgYellow(`${x}`));
                const code = `[${issue.code}]`;
                console.error(`package.${keys.join(".")} - ${code} ${fgCyan(issue.message)}`);
            }
            // Just for new line
            console.log("");
            throw new Error("Verification failed");
        }

        throw error;
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
