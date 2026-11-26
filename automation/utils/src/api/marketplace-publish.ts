import { readFile } from "node:fs/promises";
import { basename } from "node:path";

export const MARKETPLACE_API_URL = "https://marketplace-api.mendix.com/v1";

export type ReleaseStatus = "Draft" | "InReview" | "Declined" | "Published";

export interface ReleaseInfo {
    name: string;
    status: ReleaseStatus;
    releaseId: string;
    versionNumber: string;
    minSupportedMendixVersion: string;
    publicationDate?: string;
    releaseNotes?: string;
}

export interface CreateReleaseRequest {
    versionNumber: string;
    mendixVersion: string;
    releaseNotes: string;
    publishManually?: boolean;
}

export class MarketplaceApiError extends Error {
    readonly status: number;

    constructor(operation: string, status: number, detail: string | undefined) {
        super(`Marketplace ${operation} failed (HTTP ${status})${detail ? `: ${detail}` : ""}`);
        this.status = status;
    }
}

const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** Client for the Marketplace Publish API (https://docs.mendix.com/apidocs-mxsdk/apidocs/publish-api/). */
export class MarketplacePublishClient {
    private readonly pat: string;
    private readonly baseUrl: string;
    private readonly fetchImpl: typeof fetch;

    constructor(pat: string, baseUrl = MARKETPLACE_API_URL, fetchImpl: typeof fetch = fetch) {
        this.pat = pat;
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.fetchImpl = fetchImpl;
    }

    /** Creates a `Draft` release and returns its id. */
    async createRelease(componentId: number, body: CreateReleaseRequest): Promise<string> {
        const response = await this.request("create release", "POST", `/components/${componentId}/releases`, {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        // The id is only in the Location header. The documented example of that header is
        // malformed (two "/releases/" segments), so take the last UUID rather than parse the path.
        const location = response.headers.get("location") ?? "";
        const releaseId = location.match(uuidPattern)?.at(-1);
        if (!releaseId) {
            throw new Error(`Marketplace create release returned no release id (Location: "${location}")`);
        }
        return releaseId;
    }

    async uploadSourceFile(releaseId: string, filePath: string): Promise<void> {
        await this.request("source file upload", "PUT", `/releases/${releaseId}/source-file`, {
            headers: { "Content-Type": "application/octet-stream", "file-name": basename(filePath) },
            body: await readFile(filePath)
        });
    }

    async publishRelease(releaseId: string): Promise<void> {
        await this.request("publish release", "POST", `/releases/${releaseId}/publish`);
    }

    async getRelease(releaseId: string): Promise<ReleaseInfo> {
        const response = await this.request("get release", "GET", `/releases/${releaseId}`);
        return (await response.json()) as ReleaseInfo;
    }

    async deleteRelease(releaseId: string): Promise<void> {
        await this.request("delete release", "DELETE", `/releases/${releaseId}`);
    }

    private async request(
        operation: string,
        method: string,
        path: string,
        init: { headers?: Record<string, string>; body?: string | Uint8Array } = {}
    ): Promise<Response> {
        const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
            method,
            headers: { Accept: "application/json", Authorization: `MxToken ${this.pat}`, ...init.headers },
            body: init.body
        });
        if (!response.ok) {
            throw new MarketplaceApiError(operation, response.status, await readErrorDetail(response));
        }
        return response;
    }
}

async function readErrorDetail(response: Response): Promise<string | undefined> {
    const text = await response.text().catch(() => "");
    try {
        const { error } = JSON.parse(text) as { error?: { message?: string; detail?: string } };
        return error?.detail ?? error?.message ?? (text || undefined);
    } catch {
        return text || undefined;
    }
}

export interface PublishReleaseParams {
    componentId: number;
    versionNumber: string;
    mendixVersion: string;
    releaseNotes: string;
    mpkPath: string;
    /** When false, the release is left as a `Draft` with its source file uploaded. */
    publish: boolean;
    /** Called as soon as the draft exists, so its id is recorded even if the process dies before cleanup. */
    onDraftCreated?: (releaseId: string) => void | Promise<void>;
}

const signalExitCodes: Partial<Record<NodeJS.Signals, number>> = { SIGINT: 130, SIGTERM: 143 };

/**
 * Creates a release, uploads the MPK and publishes it. If a later step fails or the
 * process is interrupted, the draft is deleted: the API can't list releases, so a
 * draft whose id is lost blocks its version until it is removed in the Marketplace UI.
 */
export async function publishRelease(
    client: MarketplacePublishClient,
    params: PublishReleaseParams
): Promise<ReleaseInfo> {
    const { componentId, versionNumber, mendixVersion, releaseNotes, mpkPath, publish, onDraftCreated } = params;

    const releaseId = await createDraft(client, componentId, {
        versionNumber,
        mendixVersion,
        releaseNotes,
        publishManually: true
    });
    console.log(`Created draft release ${releaseId} (component ${componentId}, version ${versionNumber}).`);

    const deleteDraft = async (reason: string): Promise<void> => {
        console.error(`Deleting draft release ${releaseId} after ${reason}...`);
        await client.deleteRelease(releaseId).catch((deleteError: unknown) => {
            console.error(
                `Could not delete draft release ${releaseId}; remove it manually in the Marketplace.`,
                deleteError
            );
        });
    };
    let signalCleanup: Promise<void> | undefined;
    const onSignal = (signal: NodeJS.Signals): void => {
        signalCleanup ??= deleteDraft(signal).finally(() => process.exit(signalExitCodes[signal] ?? 1));
    };
    process.on("SIGINT", onSignal);
    process.on("SIGTERM", onSignal);

    try {
        await onDraftCreated?.(releaseId);
        await client.uploadSourceFile(releaseId, mpkPath);
        console.log(`Uploaded ${basename(mpkPath)}.`);
        if (publish) {
            await client.publishRelease(releaseId);
            console.log(`Submitted release ${releaseId} for publishing.`);
        }
    } catch (error) {
        await deleteDraft("failure");
        throw error;
    } finally {
        process.off("SIGINT", onSignal);
        process.off("SIGTERM", onSignal);
    }

    return client.getRelease(releaseId);
}

async function createDraft(
    client: MarketplacePublishClient,
    componentId: number,
    body: CreateReleaseRequest
): Promise<string> {
    try {
        return await client.createRelease(componentId, body);
    } catch (error) {
        if (error instanceof MarketplaceApiError && error.status === 409) {
            throw new Error(
                `Marketplace already has a release ${body.versionNumber} for component ${componentId} (Draft, InReview, Declined or Published). ` +
                    `If it is a leftover draft, delete it under "Manage versions" on the component page, or with ` +
                    `DELETE ${MARKETPLACE_API_URL}/releases/<releaseId> using the id from the failed run's job summary.`,
                { cause: error }
            );
        }
        throw error;
    }
}
