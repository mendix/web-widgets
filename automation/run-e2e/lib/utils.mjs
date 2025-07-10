import c from "ansi-colors";
import { readFileSync } from "fs";
import fetch from "node-fetch";
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
    if (!token || typeof token !== "string" || token.length === 0) {
        console.warn("Warning: GITHUB_TOKEN is missing. GitHub API requests may fail or be rate-limited.");
        return fetchWithReport(url, {
            ...init,
            headers: {
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                ...init.headers
            }
        });
    }
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
    while (n < attempts) {
        n++;
        console.log(c.cyan(`GET ${url} attempt ${n}/${attempts}`));
        try {
            const response = await fetch(url);
            const { ok, status } = response;

            if (ok && status === 200) {
                console.log(c.green(`200 OK, continue`));
                return;
            }
        } catch (error) {
            console.error(c.red(`Error during fetch: ${error.message}`));
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error(`Max attempts (${attempts}) exceeded`);
}

export async function usetmp() {
    return mkdtemp(join(tmpdir(), config.tmpDirPrefix));
}

export const streamPipe = promisify(pipeline);
