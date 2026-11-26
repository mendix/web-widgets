import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
    MarketplaceApiError,
    MarketplacePublishClient,
    type PublishReleaseParams,
    publishRelease
} from "../api/marketplace-publish.ts";

const releaseId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

interface RecordedRequest {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: unknown;
}

type Route = (request: RecordedRequest) => Response;

function fakeMarketplace(overrides: Record<string, Route> = {}): { requests: RecordedRequest[]; fetch: typeof fetch } {
    const routes: Record<string, Route> = {
        "POST /components/123/releases": () =>
            new Response(null, {
                status: 201,
                headers: { Location: `https://marketplace-api.mendix.com/v1/releases/${releaseId}` }
            }),
        [`PUT /releases/${releaseId}/source-file`]: () => new Response(null, { status: 202 }),
        [`POST /releases/${releaseId}/publish`]: () => new Response(null, { status: 202 }),
        [`GET /releases/${releaseId}`]: () =>
            Response.json({ name: "Test", status: "InReview", releaseId, versionNumber: "1.0.1" }),
        [`DELETE /releases/${releaseId}`]: () => new Response(null, { status: 204 }),
        ...overrides
    };
    const requests: RecordedRequest[] = [];
    const fakeFetch = async (input: string | URL | Request, init: RequestInit = {}): Promise<Response> => {
        const url = String(input);
        const request: RecordedRequest = {
            method: init.method ?? "GET",
            url,
            headers: init.headers as Record<string, string>,
            body: init.body
        };
        requests.push(request);
        const route = routes[`${request.method} ${new URL(url).pathname.replace("/v1", "")}`];
        return route ? route(request) : new Response("not found", { status: 404 });
    };
    return { requests, fetch: fakeFetch as typeof fetch };
}

function apiError(status: number, detail: string): Response {
    return Response.json({ error: { code: status, message: "Error", detail } }, { status });
}

let tmp: string;
let mpkPath: string;

beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "marketplace-publish-"));
    mpkPath = join(tmp, "Widget.mpk");
    await writeFile(mpkPath, "mpk-bytes");
});

afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
});

const params = (): PublishReleaseParams => ({
    componentId: 123,
    versionNumber: "1.0.1",
    mendixVersion: "10.24.0",
    releaseNotes: "<p>Notes</p>",
    mpkPath,
    publish: true
});

const calls = (requests: RecordedRequest[]): string[] =>
    requests.map(r => `${r.method} ${new URL(r.url).pathname.replace("/v1", "")}`);

describe("publishRelease", () => {
    it("creates a manual-publish draft, uploads the MPK, publishes it and returns its status", async () => {
        const api = fakeMarketplace();
        const result = await publishRelease(new MarketplacePublishClient("pat", undefined, api.fetch), params());

        assert.equal(result.status, "InReview");
        assert.deepEqual(calls(api.requests), [
            "POST /components/123/releases",
            `PUT /releases/${releaseId}/source-file`,
            `POST /releases/${releaseId}/publish`,
            `GET /releases/${releaseId}`
        ]);
        const [create, upload] = api.requests;
        assert.deepEqual(JSON.parse(create.body as string), {
            versionNumber: "1.0.1",
            mendixVersion: "10.24.0",
            releaseNotes: "<p>Notes</p>",
            publishManually: true
        });
        assert.equal(create.headers.Authorization, "MxToken pat");
        assert.equal(upload.headers["file-name"], "Widget.mpk");
        assert.equal(Buffer.from(upload.body as Uint8Array).toString(), "mpk-bytes");
    });

    it("leaves the release as a draft without publishing when publish is false", async () => {
        const api = fakeMarketplace();
        await publishRelease(new MarketplacePublishClient("pat", undefined, api.fetch), {
            ...params(),
            publish: false
        });

        assert.ok(!calls(api.requests).includes(`POST /releases/${releaseId}/publish`));
    });

    it("deletes the draft and rethrows when the upload fails", async () => {
        const api = fakeMarketplace({
            [`PUT /releases/${releaseId}/source-file`]: () => apiError(400, "Widget name is already taken.")
        });

        await assert.rejects(
            publishRelease(new MarketplacePublishClient("pat", undefined, api.fetch), params()),
            (error: unknown) =>
                error instanceof MarketplaceApiError &&
                error.status === 400 &&
                error.message.includes("Widget name is already taken.")
        );
        assert.equal(calls(api.requests).at(-1), `DELETE /releases/${releaseId}`);
    });

    it("deletes the draft when publishing fails", async () => {
        const api = fakeMarketplace({
            [`POST /releases/${releaseId}/publish`]: () => apiError(400, "Release metadata is incomplete or invalid.")
        });

        await assert.rejects(publishRelease(new MarketplacePublishClient("pat", undefined, api.fetch), params()));
        assert.equal(calls(api.requests).at(-1), `DELETE /releases/${releaseId}`);
    });

    it("does not delete anything when creating the draft fails", async () => {
        const api = fakeMarketplace({
            "POST /components/123/releases": () =>
                apiError(409, "A release with the same version number already exists.")
        });

        await assert.rejects(
            publishRelease(new MarketplacePublishClient("pat", undefined, api.fetch), params()),
            /already has a release 1\.0\.1 for component 123/
        );
        assert.deepEqual(calls(api.requests), ["POST /components/123/releases"]);
    });

    it("reads the release id from the last UUID of a malformed Location header", async () => {
        const api = fakeMarketplace({
            "POST /components/123/releases": () =>
                new Response(null, {
                    status: 201,
                    headers: {
                        Location: `https://marketplace-api.mendix.com/v1/releases/{releaseId}/v1/releases/${releaseId}`
                    }
                })
        });

        const result = await publishRelease(new MarketplacePublishClient("pat", undefined, api.fetch), params());
        assert.equal(result.releaseId, releaseId);
    });

    it("reports the draft id before uploading", async () => {
        const api = fakeMarketplace();
        const reported: string[] = [];
        await publishRelease(new MarketplacePublishClient("pat", undefined, api.fetch), {
            ...params(),
            onDraftCreated: id => {
                reported.push(`${id} after ${api.requests.length} request(s)`);
            }
        });

        assert.deepEqual(reported, [`${releaseId} after 1 request(s)`]);
    });

    it(
        "deletes the draft and exits when the process is terminated during the upload",
        // Windows has no POSIX signals: kill("SIGTERM") ends the process without running handlers.
        { skip: process.platform === "win32" },
        async () => {
            const fixture = join(import.meta.dirname, "fixtures", "publish-until-signal.ts");
            const child = spawn(process.execPath, [fixture, mpkPath], { stdio: ["ignore", "pipe", "pipe"] });
            let output = "";
            child.stdout.on("data", chunk => {
                output += chunk;
                if (output.includes("PUT ") && !child.killed) {
                    child.kill("SIGTERM");
                }
            });
            const exitCode = await new Promise<number | null>(resolve => child.on("exit", resolve));

            assert.equal(exitCode, 143);
            assert.match(output, new RegExp(`DELETE /v1/releases/${releaseId}`));
        }
    );
});
