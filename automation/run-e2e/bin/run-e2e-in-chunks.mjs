#!/usr/bin/env node

import { Buffer } from "node:buffer";

function main() {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        throw new Error("GITHUB_TOKEN environment variable is not set");
    } else {
        console.log("Github token is set, proceeding with the script...");

        console.warn(token.substring(0, 4) + "..." + token.substring(token.length - 4));
    }
}

main();
