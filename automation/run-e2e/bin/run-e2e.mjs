#!/usr/bin/env node

import { parseArgs } from "node:util";
import { ci } from "../commands/ci.mjs";
import { dev } from "../commands/dev.mjs";

async function main() {
    const parseArgsOptions = {
        "no-widget-update": {
            type: "boolean",
            default: false
        }
    };

    const { positionals, values } = parseArgs({ options: parseArgsOptions, allowPositionals: true });
    const [command] = positionals;

    switch (command) {
        case "ci": {
            await ci(values);
            break;
        }
        case "dev": {
            await dev(values);
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
