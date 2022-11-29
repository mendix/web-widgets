#!/usr/bin/env node

import parseArgs from "yargs-parser";
import { ci } from "../commands/ci.mjs";
import { dev } from "../commands/dev.mjs";

async function main() {
    const { _: [command] } = parseArgs(process.argv.slice(2))

    switch (command) {
        case "ci": {
            await ci();
            break;
        }
        case "dev": {
            await dev();
            break;
        }
        default: {
            throw new Error(`Unknown command: ${command}`);
        }
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
