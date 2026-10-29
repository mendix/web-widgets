#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import { join } from "path";
import concurrently from "concurrently";
import { getModuleConfigs } from "@mendix/automation-utils/utils";

async function main(): Promise<void> {
    const [, config] = await getModuleConfigs(process.cwd());

    await mkdir(config.paths.targetProject, { recursive: true });

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
