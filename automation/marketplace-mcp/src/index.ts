#!/usr/bin/env node
/**
 * marketplace-mcp: MCP server for the Mendix Marketplace Content API
 *
 *
 * Transport: stdio
 *
 * Required environment variable:
 *   MX_PAT  – Personal Access Token with the mx:marketplace-content:read scope
 *             Generate one at: https://sprintr.home.mendix.com/link/myprofile → API Keys
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Config / auth
// ---------------------------------------------------------------------------

const BASE_URL = "https://marketplace-api.mendix.com/v1";

function getPat(): string {
    const pat = process.env.MX_PAT;
    if (!pat) {
        throw new Error(
            "MX_PAT environment variable is not set. Generate a PAT at https://sprintr.home.mendix.com/link/myprofile"
        );
    }
    return pat;
}

function authHeader(): Record<string, string> {
    return { Authorization: `MxToken ${getPat()}` };
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

type Params = Record<string, string | number | boolean | undefined>;

function buildQuery(params: Params): string {
    const entries = Object.entries(params).filter(
        (e): e is [string, string | number | boolean] => e[1] !== undefined && e[1] !== ""
    );
    if (!entries.length) return "";
    return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}

async function apiFetch<T = unknown>(path: string, params: Params = {}): Promise<T> {
    const url = `${BASE_URL}/${path}${buildQuery(params)}`;
    const res = await fetch(url, {
        headers: { Accept: "application/json", ...authHeader() }
    });
    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Marketplace API error ${res.status} ${res.statusText}: ${body}`);
    }
    return res.json();
}

// ---------------------------------------------------------------------------
// Types (OpenAPI schema subset)
// ---------------------------------------------------------------------------

interface ContentVersion {
    name: string;
    versionId: string;
    versionNumber: string;
    minSupportedMendixVersion: string;
    publicationDate: string;
    releaseNotes?: string;
}

interface SpecificContent {
    contentId: number;
    publisher: string;
    type: string;
    categories?: Array<{ name: string }>;
    supportCategory?: string;
    licenseUrl?: string;
    isPrivate: boolean;
    latestVersion?: ContentVersion;
}

interface ContentVersionList {
    items?: ContentVersion[];
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function fmtContent(c: SpecificContent): string {
    const cats = c.categories?.map(x => x.name).join(", ") || "—";
    const latest = c.latestVersion;
    return [
        `contentId   : ${c.contentId}`,
        `name        : ${latest?.name ?? "—"}`,
        `publisher   : ${c.publisher}`,
        `type        : ${c.type}`,
        `categories  : ${cats}`,
        `support     : ${c.supportCategory ?? "—"}`,
        `private     : ${c.isPrivate}`,
        `licenseUrl  : ${c.licenseUrl ?? "—"}`,
        `latestVersion:`,
        `  versionId : ${latest?.versionId ?? "—"}`,
        `  number    : ${latest?.versionNumber ?? "—"}`,
        `  minMxVer  : ${latest?.minSupportedMendixVersion ?? "—"}`,
        `  published : ${latest?.publicationDate ?? "—"}`
    ].join("\n");
}

function fmtVersion(v: ContentVersion, index: number): string {
    return [
        `${index + 1}. ${v.versionNumber} (${v.publicationDate})`,
        `   versionId : ${v.versionId}`,
        `   minMxVer  : ${v.minSupportedMendixVersion}`,
        ...(v.releaseNotes ? [`   notes     : ${v.releaseNotes.split("\n").slice(0, 3).join(" | ")}`] : [])
    ].join("\n");
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new McpServer({
    name: "marketplace-mcp",
    version: "0.1.0",
    description: "Query Mendix Marketplace content and versions via the Content API"
});

// ── Tool 1: get_content ────────────────────────────────────────────────────

server.registerTool(
    "get_content",
    {
        description:
            "Get full details for a single Marketplace content item by its numeric content ID. Content ID can be found in corresponding package.json under `marketplace.appNumber` entry.",
        inputSchema: {
            contentId: z.number().int().positive().describe("Numeric content ID from the Marketplace URL")
        }
    },
    async ({ contentId }) => {
        const data = await apiFetch<SpecificContent>(`content/${contentId}`);
        return {
            content: [{ type: "text", text: fmtContent(data) }]
        };
    }
);

// ── Tool 2: get_content_versions ──────────────────────────────────────────

server.registerTool(
    "get_content_versions",
    {
        description:
            "List all published versions of a Marketplace content item. Optionally filter by a specific version UUID or find the version compatible with a given Studio Pro version.",
        inputSchema: {
            contentId: z.number().int().positive().describe("Numeric content ID"),
            versionId: z.string().uuid().optional().describe("UUID of a specific published version"),
            supportedMendixVersion: z
                .string()
                .optional()
                .describe("Return the most recent version compatible with this Studio Pro version, e.g. '10.6.1'"),
            publishedSince: z
                .string()
                .optional()
                .describe("Only versions published on or after this date, format: yyyy-MM-dd"),
            limit: z.number().int().min(1).max(20).optional().describe("Max results (default 10, max 20)"),
            offset: z.number().int().min(0).optional().describe("Zero-based page offset (default 0)")
        }
    },
    async ({ contentId, versionId, supportedMendixVersion, publishedSince, limit = 10, offset = 0 }) => {
        const data = await apiFetch<ContentVersionList>(`content/${contentId}/versions`, {
            versionId,
            supportedMendixVersion,
            publishedSince,
            limit,
            offset
        });
        const items = data.items ?? [];

        if (items.length === 0) {
            return {
                content: [
                    { type: "text", text: `No versions found for contentId ${contentId} with the given filters.` }
                ]
            };
        }

        const lines = items.map((v, i) => fmtVersion(v, i + offset));
        return {
            content: [
                {
                    type: "text",
                    text: `${items.length} version(s) for contentId ${contentId} (offset ${offset}):\n\n${lines.join("\n\n")}`
                }
            ]
        };
    }
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
