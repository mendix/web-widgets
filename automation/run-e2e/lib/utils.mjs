import fetch from "node-fetch";
import c from "chalk";
import { spawnSync } from "child_process";
import assert from "node:assert/strict";
import { readFileSync } from "fs";

export const packageMeta = JSON.parse(readFileSync("package.json", { encoding: "utf-8" }));

export async function runReleaseScript() {
    const { name: packageName } = packageMeta;
    assert.ok(typeof packageName === "string", "missing package.name");

    // Please keep in mind that order of args matters.
    // Our goal is to run `turbo run --filter <widget>`
    // as then we can make sure that widget build with dependencies.
    // But both, pnpm and turbo have `--filter` flag (which may be confusing).
    // To pass flags to turbo, we pass --filter AFTER command (`release` in our case).
    // Check https://pnpm.io/cli/run#options for more details.
    const command = "pnpm";
    const args = ["run", "--workspace-root", "release", `--filter ${packageName}`];

    spawnSync(command, args, { stdio: "inherit", shell: true });
}

export async function await200(url = "http://localhost:8080", attempts = 50) {
    let n = 0;
    while (++n <= attempts) {
        console.log(c.cyan(`GET ${url} ${n}`));
        let response;
        try {
            response = await fetch(url);
        } catch {
            // ignore
        }

        const { ok, status } = response ?? {};

        if (ok && status === 200) {
            console.log(c.green(`200 OK, continue`));
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error(`Max attempts (${attempts}) exceeded`);
}
