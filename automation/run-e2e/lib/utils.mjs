import c from "ansi-colors";
import { readFileSync } from "fs";
import fetch from "node-fetch";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import * as config from "./config.mjs";

export const packageMeta = JSON.parse(readFileSync("package.json", { encoding: "utf-8" }));

export async function fetchWithReport(url, init) {
    const response = await fetch(url, init);
    if (response.ok) {
        return response;
    }
    console.error(`HTTP Error Response: ${response.status} ${response.statusText}`);
    const errorBody = await response.text();
    console.error(`Error body: ${errorBody}`);
    throw new Error("HTTP Error");
}

export async function fetchGithubRestAPI(url, init = {}) {
    const token = process.env.GITHUB_TOKEN;
    assert.ok(typeof token === "string" && token.length > 0, "GITHUB_TOKEN is missing");

    return fetchWithReport(url, {
        ...init,
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
            ...init.headers
        }
    });
}

export async function await200(url = "http://127.0.0.1:8080", attempts = 50) {
    let n = 0;
    while (++n <= attempts) {
        console.log(c.cyan(`GET ${url} ${n}`));
        const response = await fetch(url);
        const { ok, status } = response;

        if (ok && status === 200) {
            console.log(c.green(`200 OK, continue`));
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error(`Max attempts (${attempts}) exceeded`);
}

export async function usetmp() {
    return mkdtemp(join(tmpdir(), config.tmpDirPrefix));
}

export const streamPipe = promisify(pipeline);
