#!/usr/bin/env ts-node-script

import { getModuleConfigs } from "@mendix/automation-utils/utils";
import { mkdir } from "@mendix/automation-utils/shell";
import concurrently from "concurrently";
import { join } from "path";

async function main(): Promise<void> {
    const [, config] = await getModuleConfigs(process.cwd());

    mkdir("-p", config.paths.targetProject);

    await concurrently(
        [
            {
                name: "web-themesource-datawidgets",
                command: `copy-and-watch --watch "src/themesource/datawidgets/web/**/*" "${join(
                    config.paths.targetProject,
                    "themesource/datawidgets/web"
                )}"`
            },
            {
                name: "public-themesource-datawidgets",
                command: `copy-and-watch --watch "src/themesource/datawidgets/public/**/*" "${join(
                    config.paths.targetProject,
                    "themesource/datawidgets/public"
                )}"`
            }
        ],
        {
            killOthers: ["failure"]
        }
    );
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
