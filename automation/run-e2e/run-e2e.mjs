#!/usr/bin/env node

import { parseArgs } from "node:util";
import { relativeToModule } from "../utils.mjs";
import { runDev } from "./run-dev.mjs";

async function main() {
    const packageBin = relativeToModule("node_modules/.bin", import.meta.url);
    const { positionals } = parseArgs({ allowPositionals: true });
    const [env] = positionals;

    process.env.PATH += `:${packageBin}`;
    switch (env) {
        case "ci": {
            console.log(env);
            return;
        }
        case "dev": {
            runDev();
            return;
        }
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
