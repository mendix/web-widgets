#!/usr/bin/env ts-node-script

import { getModuleConfigs } from "@mendix/release-utils-internal/utils";
import concurrently from "concurrently";
import { join } from "path";
import { dependencies } from "./dependencies";

async function main(): Promise<void> {
    const [, config] = await getModuleConfigs({
        packagePath: process.cwd(),
        dependencies
    });

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
