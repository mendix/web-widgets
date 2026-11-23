import { MarketplacePublishClient, publishRelease } from "../../api/marketplace-publish.ts";

const releaseId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

const fakeFetch = async (input: string | URL | Request, init: RequestInit = {}): Promise<Response> => {
    const method = init.method ?? "GET";
    console.log(`${method} ${new URL(String(input)).pathname}`);
    if (method === "POST") {
        return new Response(null, { status: 201, headers: { Location: `/v1/releases/${releaseId}` } });
    }
    if (method === "PUT") {
        // Stands in for the open socket of a slow upload, which keeps the process alive.
        setInterval(() => {}, 1000);
        return new Promise<Response>(() => {});
    }
    return new Response(null, { status: 204 });
};

await publishRelease(new MarketplacePublishClient("pat", undefined, fakeFetch as typeof fetch), {
    componentId: 123,
    versionNumber: "1.0.1",
    mendixVersion: "10.24.0",
    releaseNotes: "<p>Notes</p>",
    mpkPath: process.argv[2],
    publish: true
});
