#!/usr/bin/env ts-node-script

import { getPackageInfo } from "../src/package-info";

async function main(): Promise<void> {
    const path = process.cwd();
    const info = await getPackageInfo(path);

    console.log(
        JSON.stringify({
            name: info.name,
            version: info.version.format(),
            appNumber: info.marketplace.appNumber ?? null,
            appName: info.marketplace.appName ?? null
        })
    );
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
